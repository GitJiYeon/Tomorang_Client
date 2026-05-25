import { useState } from "react";
import Header from "../components/Header";
import styled from "styled-components";
import ReviewCard1 from "../components/ReviewCard1";
import reviews from "../data/reviews.json";

export default function MyreviewPage() {
  return (
    <>
      <Header coment={"내가 쓴 리뷰"} />
      <ListWrapper>
        {reviews.map((review) => (
          <ReviewCard1 key={review.id} review={review} />
        ))}
      </ListWrapper>
    </>
  );
}

const ListWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px 0;
`;