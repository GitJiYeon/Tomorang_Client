import React from "react";
import styled from "styled-components";

// 사용법:
// <ReservationCard
//   post={post}
//   date="2026-02-21"
//   time="12:00-13:00"
//   dateIcon={DateIcon}
//   clockIcon={Clocklogo}
//   nextIcon={NextButton}
//   onClick={() => {}}
// />

export default function ReservationCard({ post, date, time, dateIcon, clockIcon, nextIcon, onClick }) {
  const { title, subtitle, images } = post;

  return (
    <Card onClick={onClick}>
      <Thumbnail src={images?.[0]} alt={title} />
      <Info>
        <TopRow>
          <TextGroup>
            <Title>{title}</Title>
            <Subtitle>{subtitle}</Subtitle>
          </TextGroup>
          <img src={nextIcon} alt="next" width={6} />
        </TopRow>
        <BottomRow>
          <MetaItem>
            <img src={clockIcon} alt="clock" width={14} height={14} />
            <MetaText>{time}</MetaText>
          </MetaItem>
          <MetaItem>
            <img src={dateIcon} alt="date" width={14} height={14} />
            <MetaText>{date}</MetaText>
          </MetaItem>
        </BottomRow>
      </Info>
    </Card>
  );
}

const Card = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 12px;
  border: 1px solid #F3F4F3;
  background: #fff;
  cursor: pointer;
  width: 348px;
  box-sizing: border-box;
`;

const Thumbnail = styled.img`
  width: 100px;
  height: 100px;
  border-radius: 12px;
  object-fit: cover;
  flex-shrink: 0;
  background: #F3F4F3;
`;

const Info = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100px;
`;

const TopRow = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
`;

const TextGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const Title = styled.span`
  color: #111;
  font-feature-settings: 'liga' off, 'clig' off;
  font-family: Pretendard;
  font-size: 14px;
  font-weight: 600;
  line-height: 22px;
`;

const Subtitle = styled.span`
  color: #4E4E4E;
  font-feature-settings: 'liga' off, 'clig' off;
  font-family: Pretendard;
  font-size: 10px;
  font-weight: 400;
  line-height: 22px;
`;

const BottomRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const MetaText = styled.span`
  color: #4E4E4E;
  font-feature-settings: 'liga' off, 'clig' off;
  font-family: Pretendard;
  font-size: 10px;
  font-weight: 500;
  line-height: 22px;
`;