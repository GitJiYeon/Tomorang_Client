import { useEffect, useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import NotificationCard from "../components/NotificationCard";
import NotiBellIcon from "../assets/notiIcons/notiBell.svg";
import { getMypage } from "../api/tomorang";

const pickNotifications = (profile) => {
  const candidates = [
    profile?.notifications,
    profile?.notificationList,
    profile?.alarms,
    profile?.messages,
  ];
  return candidates.find(Array.isArray) ?? [];
};

export default function NotificationPage() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem("accessToken")) return undefined;
    let alive = true;
    setIsLoading(true);
    getMypage()
      .then((profile) => {
        if (alive) setNotifications(pickNotifications(profile));
      })
      .catch(() => {
        if (alive) setNotifications([]);
      })
      .finally(() => {
        if (alive) setIsLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  const handleClick = (noti) => {
    const reservationId = noti.reservationId ?? noti.reservation_id;
    if (reservationId) {
      navigate(`/reservation-status/${reservationId}`);
    }
  };

  return (
    <Wrapper>
      <Header coment="알림" />
      <Content>
        {isLoading ? (
          <Empty>알림을 불러오는 중입니다.</Empty>
        ) : notifications.length === 0 ? (
          <Empty>알림이 없습니다.</Empty>
        ) : (
          notifications.map((noti, index) => (
            <NotificationCard
              key={noti.notificationId ?? noti.id ?? index}
              title={noti.title}
              body={noti.body ?? noti.content ?? noti.message}
              timeLabel={noti.timeLabel ?? noti.createdAt ?? noti.created_at}
              isUnread={noti.isUnread ?? !noti.read}
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
  color: #acacac;
`;
