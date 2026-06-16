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

export default function ReservationCard({ post, date, time, statusBadge, dateIcon, clockIcon, nextIcon, onClick }) {
  const { title, subtitle, images } = post;

  return (
    <Card onClick={onClick}>
      <ImageBox>
        <Thumbnail src={images?.[0]} alt={title} />
        {statusBadge && <StatusBadge>{statusBadge}</StatusBadge>}
      </ImageBox>
      <Info>
        <TopRow>
          <TextGroup>
            <Title>{title}</Title>
            <Subtitle>{subtitle}</Subtitle>
          </TextGroup>
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
      <NextIcon src={nextIcon} alt="next" />  {/* ← Info 밖으로 이동 */}
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
  width: var(--app-content-width);
  box-sizing: border-box;
`;
const NextIcon = styled.img`
  display: flex;
  width: 12px;
  height: 12px;
  padding: 5px;
  justify-content: center;
  align-items: center;
  flex-shrink: 0;
`;

const Thumbnail = styled.img`
  width: 100px;
  height: 100px;
  border-radius: 12px;
  object-fit: cover;
  flex-shrink: 0;
  background: #F3F4F3;
`;

const ImageBox = styled.div`
  position: relative;
  width: 100px;
  height: 100px;
  flex-shrink: 0;
`;

const StatusBadge = styled.span`
  position: absolute;
  top: 8px;
  left: 8px;
  height: 24px;
  padding: 0 8px;
  border-radius: 7px;
  background: #ffcba4;
  color: #fff;
  font-family: Pretendard, sans-serif;
  font-size: 11px;
  font-weight: 600;
  line-height: 24px;
`;

const Info = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100px;
`;

const TopRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  min-width: 0;
`;

const TextGroup = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const Title = styled.span`
  display: block;
  width: 100%;
  color: #111;
  font-feature-settings: 'liga' off, 'clig' off;
  font-family: Pretendard;
  font-size: 14px;
  font-weight: 600;
  line-height: 22px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
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
  align-items: center;
  gap: 16px;
  min-width: 0;
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
  white-space: nowrap;
`;
