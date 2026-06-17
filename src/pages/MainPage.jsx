import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";

import Banner from "../components/mainComponents/Banner";
import BottomNav from "../components/mainComponents/BottomNav";
import CategoryFilter from "../components/mainComponents/CategoryFilter";
import GuideCard from "../components/mainComponents/GuideCard";
import PostCard from "../components/mainComponents/PostCard";
import RegionCard from "../components/mainComponents/RegionCard";
import ReviewCard from "../components/mainComponents/ReviewCard";
import Section from "../components/mainComponents/Section";

import bannerData from "../data/bannerData.json";
import regionData from "../data/regionData.json";

import MainHeader from "../components/mainComponents/MainHeader";
import { getMyWishlists, getPopularGuides, getPostReviews, getPosts } from "../api/tomorang";
import { syncLikedPostsFromWishlists } from "../utils/wishlist";
import { getPostOwnerId } from "../utils/postOwner";
import { getPostRatingAverage } from "../utils/postStats";
import { useI18n } from "../i18n/I18nProvider";
import { sortReviewsByRecent } from "../utils/reviews";
import { filterEmergingRegionsByPosts } from "../utils/emergingRegions";
import { resolvePublicAsset } from "../utils/publicAsset";

const SCROLL_ROW = {
  display: "flex",
  gap: 12,
  overflowX: "auto",
  scrollbarWidth: "none",
  msOverflowStyle: "none",
  paddingBottom: 2,
};

const getGuideId = (guide) => guide?.id ?? guide?.guideId ?? guide?.userId ?? guide?.username;
const getPostId = (post) => post?.postId ?? post?.post_id ?? post?.id;
const getReviewCount = (post) => Number(post?.reviewCount ?? post?.review_count ?? 0) || 0;

const normalizeGuide = (guide) => ({
  ...guide,
  profileImage: guide.profileImage ?? guide.image,
  nickname: guide.nickname ?? guide.nickName ?? guide.id,
  rating: guide.rating ?? guide.avgRating ?? 0,
  reviewCount: guide.reviewCount ?? guide.review_count ?? guide.totalReviews ?? 0,
});

const buildGuideStats = (posts, reviewsByPostId) => {
  const stats = {};

  posts.forEach((post) => {
    const guideId = getPostOwnerId(post);
    const postId = getPostId(post);
    if (!guideId || !postId) return;

    const reviews = reviewsByPostId[String(postId)] ?? [];
    const reviewRatings = reviews
      .map((review) => Number(review.rating))
      .filter(Number.isFinite);
    const fallbackCount = getReviewCount(post);
    const fallbackRating = getPostRatingAverage(post);
    const reviewCount = reviewRatings.length || fallbackCount;
    if (!reviewCount) return;

    const ratingSum = reviewRatings.length
      ? reviewRatings.reduce((sum, rating) => sum + rating, 0)
      : fallbackRating * fallbackCount;

    if (!stats[guideId]) {
      stats[guideId] = { ratingSum: 0, reviewCount: 0 };
    }

    stats[guideId].ratingSum += ratingSum;
    stats[guideId].reviewCount += reviewCount;
  });

  return Object.fromEntries(
    Object.entries(stats).map(([guideId, stat]) => [
      guideId,
      {
        reviewCount: stat.reviewCount,
        rating: stat.reviewCount ? stat.ratingSum / stat.reviewCount : 0,
      },
    ])
  );
};

export default function MainPage() {
  const navigate = useNavigate();
  const { language: lang } = useI18n();
  const [activeNav, setActiveNav] = useState(0);
  const [serverPosts, setServerPosts] = useState([]);
  const [serverGuides, setServerGuides] = useState([]);
  const [guideStats, setGuideStats] = useState({});
  const [realtimeReviews, setRealtimeReviews] = useState([]);

  useEffect(() => {
    let alive = true;

    const loadPostsAndReviews = () => {
      getPosts()
        .then((posts) => {
          if (!alive) return null;
          setServerPosts(posts);
          return Promise.all(
            posts.map((post) =>
              getPostReviews(getPostId(post))
                .then((reviews) => [String(getPostId(post)), reviews])
                .catch(() => [String(getPostId(post)), []])
            )
          ).then((entries) => ({ posts, entries }));
        })
        .then((result) => {
          if (!alive || !result) return;
          const reviewsByPostId = Object.fromEntries(result.entries);
          setGuideStats(buildGuideStats(result.posts, reviewsByPostId));
          setRealtimeReviews(
            sortReviewsByRecent(
              result.entries
                .flatMap(([, reviews]) => reviews)
                .filter((review) => review.postImages?.length > 0)
            )
          );
        })
        .catch((error) => console.error("게시물 목록 조회 실패", error));
    };

    loadPostsAndReviews();
    const reviewsTimer = window.setInterval(loadPostsAndReviews, 15000);

    getPopularGuides()
      .then((guides) => {
        if (alive) setServerGuides(guides.map(normalizeGuide));
      })
      .catch((error) => console.error("인기 가이드 조회 실패", error));

    getMyWishlists()
      .then((wishlists) => {
        if (alive) syncLikedPostsFromWishlists(wishlists);
      })
      .catch(() => {});

    return () => {
      alive = false;
      window.clearInterval(reviewsTimer);
    };
  }, []);

  const trendingPosts = serverPosts;
  const salePosts = serverPosts.filter((post) => Number(post.discountRate ?? post.discount_rate ?? 0) > 0);
  const emergingRegions = useMemo(
    () => filterEmergingRegionsByPosts(regionData, serverPosts),
    [serverPosts]
  );
  const popularGuides = useMemo(
    () =>
      serverGuides
        .map((guide) => {
          const guideId = getGuideId(guide);
          const stats = guideStats[String(guideId)] ?? {};
          return {
            ...guide,
            rating: stats.rating ?? guide.rating ?? 0,
            reviewCount: stats.reviewCount ?? guide.reviewCount ?? 0,
          };
        })
        .sort((a, b) => {
          const ratingDiff = Number(b.rating ?? 0) - Number(a.rating ?? 0);
          if (ratingDiff !== 0) return ratingDiff;
          return Number(b.reviewCount ?? 0) - Number(a.reviewCount ?? 0);
        })
        .slice(0, 5),
    [guideStats, serverGuides]
  );

  const openMore = (type) => {
    navigate(`/main-more/${type}`);
  };

  const openGuideProfile = (guide) => {
    const guideId = getGuideId(guide);
    if (!guideId) return;
    navigate(`/guide/${guideId}`, { state: { guide } });
  };

  const openReviewPost = (review) => {
    const post = serverPosts.find((item) => String(getPostId(item)) === String(review.postId));
    if (!post) return;

    const initialReviews = realtimeReviews.filter((item) => String(item.postId) === String(review.postId));
    sessionStorage.setItem("currentCoursePost", JSON.stringify(post));
    navigate("/course", { state: { post, initialTab: "review", initialReviews } });
  };

  const openCategorySearch = (category) => {
    if (!category) return;
    navigate("/search-result", { state: { category } });
  };

  const openEmergingRegion = (region) => {
    navigate("/destination", {
      state: {
        region,
        image: resolvePublicAsset(region.risingimg),
        cityName: region.translations,
        tags: region.tags,
      },
    });
  };

  return (
    <PageWrapper>
      <MainHeader />

      <TopSection>
        <Banner bannerData={bannerData} />
      </TopSection>

      <CategoryFilter onSelect={openCategorySearch} />

      <Section title="떠오르는 코스" onMore={() => openMore("trending-courses")}>
        <div style={SCROLL_ROW}>
          {trendingPosts.map((post, index) => (
            <PostCard key={getPostId(post) ?? `${post.title}-${index}`} post={post} />
          ))}
        </div>
      </Section>

      <Section title="떠오르는 여행지" path="/emergingDestination">
        <div style={SCROLL_ROW}>
          {emergingRegions.map((region) => (
            <RegionCard
              key={region.regionId}
              region={region}
              lang={lang}
              onClick={() => openEmergingRegion(region)}
            />
          ))}
        </div>
      </Section>

      {salePosts.length > 0 && (
        <Section title="할인중인 코스" onMore={() => openMore("sale-courses")}>
          <div style={SCROLL_ROW}>
            {salePosts.map((post, index) => (
              <PostCard key={getPostId(post) ?? `${post.title}-${index}`} post={post} isSale />
            ))}
          </div>
        </Section>
      )}

      <Section title="인기있는 가이드" onMore={() => openMore("popular-guides")}>
        <div style={SCROLL_ROW}>
          {popularGuides.map((guide, index) => (
            <GuideCard
              key={getGuideId(guide) ?? guide.nickName ?? `guide-${index}`}
              guide={guide}
              onClick={() => openGuideProfile(guide)}
            />
          ))}
        </div>
      </Section>

      <ReviewWrapper>
        <Section title="실시간 리뷰" onMore={() => openMore("realtime-reviews")}>
          <div style={SCROLL_ROW}>
            {realtimeReviews.slice(0, 5).map((review) => (
              <ReviewCard
                key={review.reviewId}
                review={review}
                onClick={() => openReviewPost(review)}
              />
            ))}
          </div>
        </Section>
      </ReviewWrapper>

      <BottomNav activeIndex={activeNav} onNavChange={setActiveNav} />
    </PageWrapper>
  );
}

const PageWrapper = styled.div`
  font-family: "Noto Sans KR", "Apple SD Gothic Neo", sans-serif;
  width: min(var(--app-page-width), 100vw);
  height: 100dvh;
  margin: 0 auto;
  background-color: #fff;
  overflow-x: hidden;
  overflow-y: auto;
  padding-bottom: var(--app-bottom-nav-reserved-space);
  position: relative;
  scrollbar-width: none;
`;

const TopSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 24px;
  z-index: 300;
`;

const ReviewWrapper = styled.div`
  background-color: #F3F4F3;
`;
