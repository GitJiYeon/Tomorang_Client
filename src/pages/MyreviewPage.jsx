import { useLocation } from "react-router-dom";
import Header from "../components/Header";
import styled from "styled-components";
import ReviewCard1 from "../components/ReviewCard1";
import reviews from "../data/reviews.json";

export default function MyreviewPage() {
  const { state } = useLocation();
  const rawProfile = localStorage.getItem("profile");
  const profile = rawProfile ? JSON.parse(rawProfile) : null;
  const currentGuideId = state?.guideId || localStorage.getItem("userId") || profile?.guideId || profile?.id || "1";
  
  const myReceivedReviews = reviews.filter(
    (review) => String(review.guideId) === String(currentGuideId)
  );

  return (
    <PageWrapper>
      <Header coment={"내가 받은 리뷰"} />
      <ListWrapper>
        {myReceivedReviews.length > 0 ? (
          myReceivedReviews.map((review) => (
            <ReviewCard1 key={review.reviewId} review={review} />
          ))
        ) : (
          <EmptyText>받은 리뷰가 없습니다.</EmptyText>
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
