import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import Header from "../components/Header";
import styled from "styled-components";
import ReviewCard1 from "../components/ReviewCard1";
import { getMypage, getPostReviews, getPosts } from "../api/tomorang";

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
  const rawProfile = localStorage.getItem("profile");
  const profile = rawProfile ? JSON.parse(rawProfile) : null;
  const currentUserId = localStorage.getItem("userId") || profile?.id;
  const currentGuideId = state?.guideId || currentUserId || profile?.guideId;
  const mode = state?.mode ?? "written";
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let alive = true;
    setIsLoading(true);
    setErrorMessage("");

    const loadReviews =
      mode === "received"
        ? getPosts({ userId: currentGuideId }).then((posts) =>
            Promise.all(posts.map((post) => getPostReviews(post.postId).catch(() => []))).then((groups) =>
              groups.flat()
            )
          )
        : getMypage().then((profile) =>
            pickList(profile?.reviews ?? profile?.myReviews ?? profile?.writtenReviews ?? [])
          );

    loadReviews
      .then((serverReviews) => {
        if (alive) setReviews(serverReviews);
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
  }, [currentGuideId, mode]);

  const title = mode === "received" ? "내가 받은 리뷰" : "내가 쓴 리뷰";

  return (
    <PageWrapper>
      <Header coment={title} />
      <ListWrapper>
        {isLoading && <EmptyText>리뷰 목록을 불러오는 중입니다.</EmptyText>}
        {!isLoading && errorMessage && <EmptyText>{errorMessage}</EmptyText>}
        {!isLoading && !errorMessage && reviews.length > 0 ? (
          reviews.map((review, index) => (
            <ReviewCard1
              key={review.reviewId ?? review.id ?? index}
              review={review}
              variant={mode === "received" ? "received" : "default"}
            />
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

const EmptyText = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: #999;
  font-family: Pretendard, sans-serif;
  font-size: 14px;
`;
