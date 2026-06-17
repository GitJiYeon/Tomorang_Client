import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styled from "styled-components";
import Header from "../components/Header";
import GuideCard from "../components/mainComponents/GuideCard";
import ReviewCard from "../components/mainComponents/ReviewCard";
import PostCardList from "../components/PostCardList";
import { getPopularGuides, getPostReviews, getPosts } from "../api/tomorang";
import { useI18n } from "../i18n/I18nProvider";
import { sortReviewsByRecent } from "../utils/reviews";

const PAGE_META = {
  "trending-courses": { title: "떠오르는 코스", kind: "posts" },
  "sale-courses": { title: "할인중인 코스", kind: "posts" },
  "popular-guides": { title: "인기있는 가이드", kind: "guides" },
  "realtime-reviews": { title: "실시간 리뷰", kind: "reviews" },
};

const getGuideId = (guide) => guide?.id ?? guide?.guideId ?? guide?.userId ?? guide?.username;
const getPostId = (post) => post?.postId ?? post?.post_id ?? post?.id;

const normalizeGuide = (guide) => ({
  ...guide,
  profileImage: guide.profileImage ?? guide.image,
  nickname: guide.nickname ?? guide.nickName ?? guide.id,
  rating: guide.rating ?? guide.avgRating ?? 0,
});

export default function MainMorePage() {
  const { type } = useParams();
  const navigate = useNavigate();
  const { t } = useI18n();
  const meta = PAGE_META[type] ?? PAGE_META["trending-courses"];
  const [posts, setPosts] = useState([]);
  const [guides, setGuides] = useState([]);
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    let alive = true;

    const loadPostsAndReviews = () => {
      getPosts()
        .then((items) => {
          if (!alive) return null;
          setPosts(items);
          return Promise.all(items.map((post) => getPostReviews(getPostId(post)).catch(() => [])));
        })
        .then((reviewGroups) => {
          if (alive && reviewGroups) {
            setReviews(sortReviewsByRecent(reviewGroups.flat().filter((review) => review.postImages?.length > 0)));
          }
        })
        .catch((error) => console.error("게시물 목록 조회 실패", error));
    };

    loadPostsAndReviews();
    const reviewsTimer = type === "realtime-reviews" ? window.setInterval(loadPostsAndReviews, 15000) : null;

    getPopularGuides()
      .then((items) => {
        if (alive) setGuides(items.map(normalizeGuide));
      })
      .catch((error) => console.error("인기 가이드 조회 실패", error));

    return () => {
      alive = false;
      if (reviewsTimer) window.clearInterval(reviewsTimer);
    };
  }, [type]);

  const visiblePosts = useMemo(() => {
    if (type === "sale-courses") {
      return posts.filter((post) => Number(post.discountRate ?? post.discount_rate ?? 0) > 0);
    }
    return posts;
  }, [posts, type]);

  const openGuideProfile = (guide) => {
    const guideId = getGuideId(guide);
    if (!guideId) return;
    navigate(`/guide/${guideId}`, { state: { guide } });
  };

  const openReviewPost = (review) => {
    const post = posts.find((item) => String(getPostId(item)) === String(review.postId));
    if (!post) return;
    const initialReviews = reviews.filter((item) => String(item.postId) === String(review.postId));
    sessionStorage.setItem("currentCoursePost", JSON.stringify(post));
    navigate("/course", { state: { post, initialTab: "review", initialReviews } });
  };

  return (
    <PageWrapper>
      <Header coment={t(meta.title)} />

      {meta.kind === "posts" && (
        <PostList>
          {visiblePosts.length > 0 ? (
            visiblePosts.map((post, index) => (
              <PostCardList key={getPostId(post) ?? `${post.title}-${index}`} post={post} />
            ))
          ) : (
            <EmptyText>{t("표시할 코스가 없습니다.")}</EmptyText>
          )}
        </PostList>
      )}

      {meta.kind === "guides" && (
        <GuideGrid>
          {guides.length > 0 ? (
            guides.map((guide, index) => (
              <GuideCard
                key={getGuideId(guide) ?? `guide-${index}`}
                guide={guide}
                onClick={() => openGuideProfile(guide)}
              />
            ))
          ) : (
            <EmptyText>{t("표시할 가이드가 없습니다.")}</EmptyText>
          )}
        </GuideGrid>
      )}

      {meta.kind === "reviews" && (
        <ReviewList>
          {reviews.length > 0 ? (
            reviews.map((review) => (
              <ReviewClickArea key={review.reviewId} onClick={() => openReviewPost(review)}>
                <ReviewCard review={review} />
              </ReviewClickArea>
            ))
          ) : (
            <EmptyText>{t("표시할 리뷰가 없습니다.")}</EmptyText>
          )}
        </ReviewList>
      )}
    </PageWrapper>
  );
}

const PageWrapper = styled.div`
  width: min(var(--app-page-width), 100vw);
  min-height: 100vh;
  margin: 0 auto;
  background: #fff;
  font-family: "Noto Sans KR", "Apple SD Gothic Neo", sans-serif;
`;

const PostList = styled.div`
  padding: 16px 21px 40px;
`;

const GuideGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 100px);
  gap: 18px 20px;
  justify-content: center;
  padding: 24px 20px 48px;
`;

const ReviewList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 18px 21px 48px;
  background: #F3F4F3;
  min-height: calc(100vh - 56px);
  box-sizing: border-box;
`;

const ReviewClickArea = styled.div`
  cursor: pointer;
`;

const EmptyText = styled.div`
  padding: 80px 0;
  color: #999;
  font-size: 14px;
  text-align: center;
`;
