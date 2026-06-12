/**
 * NotificationCard - 알림 카드 컴포넌트
 *
 * 사용법:
 * <NotificationCard
 *   title="예약이 확정되었어요!"
 *   body="[구마모토 맛집 탐방] ..."
 *   timeLabel="2시간 전"
 *   isUnread={true}
 *   icon={NotiBellIcon}
 *   onClick={() => {}}
 * />
 */

import styled from "styled-components";

export default function NotificationCard({ title, body, timeLabel, isUnread, icon, onClick }) {
  return (
    <Card onClick={onClick}>
      <IconWrap>
        {icon && <img src={icon} alt="noti" width={20} height={15} />}
      </IconWrap>
      <TextWrap>
        <TopRow>
          <Title>{title}</Title>
          <RightRow>
            <TimeLabel>{timeLabel}</TimeLabel>
            {isUnread && <UnreadDot />}
          </RightRow>
        </TopRow>
        <Body>{body}</Body>
      </TextWrap>
    </Card>
  );
}

const Card = styled.div`
  width: 348px;
  height: 120px;
  background: #fff;
  border-radius: 16px;
  padding: 16px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
`;

const IconWrap = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #C5F598;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const TextWrap = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  overflow: hidden;
  align-self: stretch;
`;

const TopRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Title = styled.div`
  font-family: "Pretendard", sans-serif;
  font-size: 14px;
  font-weight: 600;
  line-height: 22px;
  color: #111;
  font-feature-settings: 'liga' off, 'clig' off;
`;

const RightRow = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  flex-shrink: 0;
`;

const TimeLabel = styled.div`
  font-family: "Pretendard", sans-serif;
  font-size: 12px;
  font-weight: 400;
  line-height: 22px;
  color: #ACACAC;
  font-feature-settings: 'liga' off, 'clig' off;
  white-space: nowrap;
`;

const UnreadDot = styled.div`
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #C5F598;
  flex-shrink: 0;
`;

const Body = styled.div`
  font-family: "Pretendard", sans-serif;
  font-size: 12px;
  font-weight: 400;
  line-height: 22px;
  color: #4E4E4E;
  font-feature-settings: 'liga' off, 'clig' off;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
`;
