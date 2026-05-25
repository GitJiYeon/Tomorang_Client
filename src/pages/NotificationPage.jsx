/**
 * NotificationPage - 알림 페이지
 *
 * 라우터:
 * <Route path="/notifications" element={<NotificationPage />} />
 */

import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import NotificationCard from "../components/NotificationCard";
import NotiBellIcon from "../assets/notiIcons/notiBell.svg";
import notificationsData from "../data/notifications.json";

export default function NotificationPage() {
  const navigate = useNavigate();

  // 실제 API 연동 시 useState + useEffect로 fetch 교체
  const notifications = notificationsData;

  const handleClick = (noti) => {
    if (noti.reservationId) {
      navigate(`/reservation-status/2`);
    }
  };

  return (
    <Wrapper>
      <Header coment="알림" />
      <Content>
        {notifications.length === 0 ? (
          <Empty>알림이 없습니다.</Empty>
        ) : (
          notifications.map((noti) => (
            <NotificationCard
              key={noti.notificationId}
              title={noti.title}
              body={noti.body}
              timeLabel={noti.timeLabel}
              isUnread={noti.isUnread}
              icon={NotiBellIcon}
              onClick={() => handleClick(noti)}
            />
          ))
        )}
      </Content>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  width: min(390px, 100vw);
  margin: 0 auto;
  height: 100dvh;
  max-height: 100dvh;
  background: #f8f8f8;
  font-family: "Pretendard", sans-serif;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const Content = styled.div`
  padding: 12px 21px 48px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: center;
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const Empty = styled.div`
  padding: 80px 0;
  text-align: center;
  font-size: 14px;
  color: #ACACAC;
`;
