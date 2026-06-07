import React from "react";
import styled from "styled-components";
import Greenstar from "../assets/greenstar.svg";
import Graystar from "../assets/graystar.svg";

export default function ReviewCard1({ review, variant = "default" }) {
  const isReceived = variant === "received";
  const date = new Date(review.createdAt);
  const postImages = review.postImages ?? (review.postImage ? [review.postImage] : []);
  const rating = Number(review.rating ?? 0);
  const dateStr = `${String(date.getMonth() + 1).padStart(2, "0")}.${String(date.getDate()).padStart(2, "0")}`;
  const yearStr = `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}.${String(date.getDate()).padStart(2, "0")}`;

  const renderStars = (value) => {
    const filledCount = Math.floor(value);
    return Array.from({ length: 5 }, (_, i) => (
      <StarImg key={i} src={i < filledCount ? Greenstar : Graystar} alt="star" />
    ));
  };

  return (
    <Card $isReceived={isReceived}>
      <TopRow>
        <TopLeft>
          <Avatar src={review.profile} alt="profile" />
          <NameDateGroup>
            <NicknameRow>
              <Nickname>{review.nickname}</Nickname>
              <Stars>{renderStars(rating)}</Stars>
              <RatingNum>{rating.toFixed(1)}</RatingNum>
            </NicknameRow>
            <DateRow>
              <DateText>{dateStr}</DateText>
              <Separator>|</Separator>
              <DateText>12:00-18:00</DateText>
            </DateRow>
          </NameDateGroup>
        </TopLeft>
        <YearText>{yearStr}</YearText>
      </TopRow>

      {postImages.length > 0 && (
        <ImageRow>
          {postImages.map((image) => (
            <ReviewImage key={image} src={image} alt="review" $isReceived={isReceived} />
          ))}
        </ImageRow>
      )}

      <ContentText>{review.content}</ContentText>
    </Card>
  );
}

const Card = styled.div`
  width: min(348px, calc(100vw - 42px));
  height: ${({ $isReceived }) => ($isReceived ? "378px" : "346px")};
  border-radius: 12px;
  background: #fff;
  padding: 20px 16px;
  display: flex;
  flex-direction: column;
  gap: 21px;
  box-sizing: border-box;
  overflow: hidden;
  margin: 0 auto 12px;
  border: 1px solid #DADADA;
`;

const TopRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 8px;
  min-width: 0;
`;

const TopLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 11px;
  min-width: 0;
`;

const Avatar = styled.img`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  object-fit: cover;
  background: #d9d9d9;
  flex-shrink: 0;
`;

const NameDateGroup = styled.div`
  display: flex;
  align-items: flex-start;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
`;

const NicknameRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
  max-width: 210px;
`;

const Nickname = styled.span`
  color: #111;
  font-feature-settings: 'liga' off, 'clig' off;
  font-family: Pretendard;
  font-size: 16px;
  font-style: normal;
  font-weight: 500;
  line-height: 22px;
  letter-spacing: 0.3px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const Stars = styled.div`
  display: flex;
  gap: 2px;
  flex-shrink: 0;
`;

const StarImg = styled.img`
  width: 13px;
  height: 13px;
`;

const RatingNum = styled.span`
  font-size: 13px;
  font-weight: 600;
  color: #333;
  flex-shrink: 0;
`;

const DateRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const DateText = styled.span`
  font-size: 12px;
  color: #999;
`;

const Separator = styled.span`
  font-size: 12px;
  color: #ccc;
`;

const YearText = styled.span`
  font-size: 11px;
  color: #bdbdbd;
  padding-top: 6px;
  white-space: nowrap;
  flex-shrink: 0;
`;

const ImageRow = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  overflow-x: auto;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const ReviewImage = styled.img`
  width: 110px;
  height: ${({ $isReceived }) => ($isReceived ? "132px" : "102px")};
  border-radius: 12px;
  object-fit: cover;
  flex-shrink: 0;
  background: #e0e0e0;
`;

const ContentText = styled.p`
  color: #4e4e4e;
  font-feature-settings: "liga" off, "clig" off;
  font-family: Pretendard, sans-serif;
  font-size: 12px;
  font-style: normal;
  font-weight: 500;
  line-height: 16px;
  white-space: pre-line;
  margin: 0;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
`;
