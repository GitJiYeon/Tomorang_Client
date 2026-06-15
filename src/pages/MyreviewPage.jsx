import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styled from "styled-components";
import Header from "../components/Header";
import ReviewCard1 from "../components/ReviewCard1";
import { getMypage, getPostReviews, getPosts } from "../api/tomorang";

const getPostId = (post) => post?.postId ?? post?.post_id ?? post?.id;

const pickList = (value) => {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.reviews)) return value.reviews;
  if (Array.isArray(value?.myReviews)) return value.myReviews;
  if (Array.isArray(value?.reviewList)) return value.reviewList;
  if (Array.isArray(value?.content)) return value.content;
  if (Array.isArray(value?.data)) return value.data;
  if (Array.isArray(value?.items)) return value.items;
  if (Array.isArray(value?.value)) return value.value;
  return [];
};

export default function MyreviewPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const rawProfile = localStorage.getItem("profile");
  const profile = rawProfile ? JSON.parse(rawProfile) : null;
  const currentUserId = localStorage.getItem("userId") || profile?.id || profile?.userId;
  const currentGuideId = state?.guideId || currentUserId || profile?.guideId;
  const mode = state?.mode ?? "written";
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let alive = true;
    setIsLoading(true);
    setErrorMessage("");

    const loadPostReviews = (posts) =>
      Promise.all(
        posts.map((post) =>
          getPostReviews(getPostId(post))
            .then((postReviews) =>
              postReviews.map((review) => ({
                ...review,
                post,
                postId: review.postId ?? review.post_id ?? getPostId(post),
              }))
            )
            .catch(() => [])
        )
      ).then((groups) => groups.flat());

    const loadReviews =
      mode === "received"
        ? getPosts({ userId: currentGuideId, includeHidden: true }).then(loadPostReviews)
        : getMypage().then((mypage) => {
            const profileReviews = pickList(
              mypage?.reviews ?? mypage?.myReviews ?? mypage?.writtenReviews ?? []
            );
            if (profileReviews.length > 0) return profileReviews;

            return getPosts({ includeHidden: true })
              .then(loadPostReviews)
              .then((allReviews) =>
                allReviews.filter(
                  (review) => String(review.memberId ?? review.member_id) === String(currentUserId)
                )
              );
          });

    loadReviews
      .then((serverReviews) => {
        if (!alive) return;
        const myNickname =
          profile?.nickname ?? profile?.nickName ?? profile?.name ?? currentUserId ?? "사용자";
        const myProfile = profile?.profileImage ?? profile?.image ?? profile?.profile;
        setReviews(
          serverReviews.map((review) =>
            mode === "written"
              ? {
                  ...review,
                  nickname: review.nickname ?? review.memberNickName ?? myNickname,
                  profile: review.profile ?? review.memberImage ?? myProfile,
                }
              : review
          )
        );
      })
      .catch((error) => {
        if (alive) setErrorMessage(error.message || "리뷰 목록을 불러오지 못했습니다.");
      })
      .finally(() => {
        if (alive) setIsLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [currentGuideId, currentUserId, mode]);

  const title = mode === "received" ? "내가 받은 리뷰" : "내가 쓴 리뷰";

  const openReviewPost = (review) => {
    const post = review.post;
    const postId = review.postId ?? review.post_id ?? getPostId(post);
    if (!postId && !post) return;

    navigate("/course", {
      state: {
        post: post ?? { postId, id: postId, title: review.postTitle ?? "코스" },
        initialTab: "review",
        initialReviews: reviews.filter(
          (item) => String(item.postId ?? item.post_id) === String(postId)
        ),
      },
    });
  };

  return (
    <PageWrapper>
      <Header coment={title} />
      <ListWrapper>
        {isLoading && <EmptyText>리뷰 목록을 불러오는 중입니다.</EmptyText>}
        {!isLoading && errorMessage && <EmptyText>{errorMessage}</EmptyText>}
        {!isLoading && !errorMessage && reviews.length > 0 ? (
          reviews.map((review, index) => (
            <ReviewClickArea
              key={review.reviewId ?? review.id ?? index}
              type="button"
              onClick={() => openReviewPost(review)}
            >
              <ReviewCard1
                review={review}
                variant={mode === "received" ? "received" : "default"}
              />
            </ReviewClickArea>
          ))
        ) : (
          !isLoading &&
          !errorMessage && (
            <EmptyText>
              {mode === "received" ? "받은 리뷰가 없습니다." : "작성한 리뷰가 없습니다."}
            </EmptyText>
          )
        )}
      </ListWrapper>
    </PageWrapper>
  );
}

const PageWrapper = styled.div`
  width: min(390px, 100vw);
  height: 100dvh;
  max-height: 100dvh;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: #fff;
`;

const ListWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px 0;
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const ReviewClickArea = styled.button`
  width: 100%;
  border: 0;
  background: transparent;
  padding: 0;
  cursor: pointer;
`;

const EmptyText = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: #999;
  font-family: Pretendard, sans-serif;
  font-size: 14px;
`;
