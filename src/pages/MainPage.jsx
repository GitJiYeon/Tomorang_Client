import { useEffect, useState } from "react";
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

const normalizeGuide = (guide) => ({
  ...guide,
  profileImage: guide.profileImage ?? guide.image,
  nickname: guide.nickname ?? guide.nickName ?? guide.id,
  rating: guide.rating ?? guide.avgRating ?? 0,
});

export default function MainPage() {
  const navigate = useNavigate();
  const lang = "ko";
  const [activeNav, setActiveNav] = useState(0);
  const [serverPosts, setServerPosts] = useState([]);
  const [serverGuides, setServerGuides] = useState([]);
  const [realtimeReviews, setRealtimeReviews] = useState([]);

  useEffect(() => {
    let alive = true;

    getPosts()
      .then((posts) => {
        if (!alive) return null;
        setServerPosts(posts);
        return Promise.all(posts.slice(0, 8).map((post) => getPostReviews(getPostId(post)).catch(() => [])));
      })
      .then((reviewGroups) => {
        if (!alive || !reviewGroups) return;
        setRealtimeReviews(reviewGroups.flat().filter((review) => review.postImages?.length > 0));
      })
      .catch((error) => console.error("게시물 목록 조회 실패", error));

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
    };
  }, []);

  const trendingPosts = serverPosts;
  const salePosts = serverPosts.filter((post) => Number(post.discountRate ?? post.discount_rate ?? 0) > 0);

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

  return (
    <PageWrapper>
      <MainHeader />

      <TopSection>
        <Banner bannerData={bannerData} />
      </TopSection>

      <CategoryFilter onSelect={(cat) => console.log("selected:", cat)} />

      <Section title="떠오르는 코스" onMore={() => openMore("trending-courses")}>
        <div style={SCROLL_ROW}>
          {trendingPosts.map((post, index) => (
            <PostCard key={getPostId(post) ?? `${post.title}-${index}`} post={post} />
          ))}
        </div>
      </Section>

      <Section title="떠오르는 여행지" path="/emergingDestination">
        <div style={SCROLL_ROW}>
          {regionData.map((region) => (
            <RegionCard key={region.regionId} region={region} lang={lang} />
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
          {serverGuides.map((guide, index) => (
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
  width: min(390px, 100vw);
  height: 100dvh;
  margin: 0 auto;
  background-color: #fff;
  overflow-x: hidden;
  overflow-y: auto;
  padding-bottom: calc(90px + env(safe-area-inset-bottom));
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
