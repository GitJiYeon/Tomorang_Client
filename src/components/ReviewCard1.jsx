import React from "react";
import styled from "styled-components";
import Greenstar from "../assets/greenstar.svg";
import Graystar from "../assets/graystar.svg";

export default function ReviewCard1({ review }) {
  const date = new Date(review.createdAt);
  const dateStr = `${String(date.getMonth() + 1).padStart(2, "0")}.${String(date.getDate()).padStart(2, "0")}`;
  const yearStr = `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}.${String(date.getDate()).padStart(2, "0")}`;

  const renderStars = (rating) => {
    const filledCount = Math.floor(rating);
    return Array.from({ length: 5 }, (_, i) => (
      <StarImg key={i} src={i < filledCount ? Greenstar : Graystar} alt="star" />
    ));
  };

  return (
    <Card>
      {/* 상단 영역 */}
      <TopRow>
        <TopLeft>
          <Avatar src={review.profile} alt="profile" />
          <NameDateGroup>
            {/* 이름 + 별점 */}
            <NicknameRow>
              <Nickname>{review.nickname}</Nickname>
              <Stars>{renderStars(review.rating)}</Stars>
              <RatingNum>{review.rating.toFixed(1)}</RatingNum>
            </NicknameRow>
            {/* 날짜 + 시간 */}
            <DateRow>
              <DateText>{dateStr}</DateText>
              <Separator>|</Separator>
              <DateText>12:00-18:00</DateText>
            </DateRow>
          </NameDateGroup>
        </TopLeft>
        <YearText>{yearStr}</YearText>
      </TopRow>

      {/* 이미지 슬라이드 */}
      {review.postImage && (
        <ImageRow>
          <ReviewImage $src={review.postImage} />
          <ReviewImage $src={review.postImage} />
          <ReviewImage $src={review.postImage} />
        </ImageRow>
      )}

      {/* 본문 */}
      <ContentText>{review.content}</ContentText>
    </Card>
  );
}

/* ── Styled Components ── */

const Card = styled.div`
  width: 348px;
  height: 346px;
  border-radius: 12px;
  background: #fff;
  padding: 20px 16px;
  display: flex;
  flex-direction: column;
  gap: 21px;
  box-sizing: border-box;
  overflow: hidden;
  margin-bottom: 12px;
  border-radius: 12px;
  border: 1px solid #DADADA;
  
`;

const TopRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;  /* center → flex-start */
`;

const TopLeft = styled.div`
  display: inline-flex;
  justify-content: center;
  align-items: center;  /* center로 아바타와 텍스트 수직 중앙 정렬 */
  gap: 11px;
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
  gap: 4px;  /* 51px → 4px */
`;

const NicknameRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const Nickname = styled.span`
  color: #111;
  text-align: center;
  font-feature-settings: 'liga' off, 'clig' off;
  font-family: Pretendard;
  font-size: 16px;
  font-style: normal;
  font-weight: 500;
  line-height: 22px; /* 137.5% */
  letter-spacing: 0.3px;
`;

const Stars = styled.div`
  display: flex;
  gap: 2px;
`;

const StarImg = styled.img`
  width: 13px;
  height: 13px;
`;

const RatingNum = styled.span`
  font-size: 13px;
  font-weight: 600;
  color: #333;
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
  padding-top: 6px;  /* 닉네임 텍스트 높이에 맞게 조정 */
  white-space: nowrap;
`;

const ImageRow = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 12px;
  overflow-x: auto;
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }
`;

const ReviewImage = styled.div`
  width: 110px;
  height: 102px;
  border-radius: 12px;
  background: url(${({ $src }) => $src}) lightgray 50% / cover no-repeat;
  flex-shrink: 0;
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