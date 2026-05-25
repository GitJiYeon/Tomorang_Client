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
      navigate(`/reservation-status/4`);
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
  max-width: 390px;
  margin: 0 auto;
  min-height: 100vh;
  background: #f8f8f8;
  font-family: "Pretendard", sans-serif;
`;

const Content = styled.div`
  padding: 12px 21px 48px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: center;
`;

const Empty = styled.div`
  padding: 80px 0;
  text-align: center;
  font-size: 14px;
  color: #ACACAC;
`;