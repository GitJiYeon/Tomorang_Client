import { useEffect, useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import NotificationCard from "../components/NotificationCard";
import NotiBellIcon from "../assets/notiIcons/notibell.svg";
import { getNotifications, markNotificationRead } from "../api/tomorang";

const formatTimeLabel = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);

  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.max(0, Math.floor(diffMs / 60000));
  if (diffMinutes < 1) return "방금 전";
  if (diffMinutes < 60) return `${diffMinutes}분 전`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}시간 전`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}일 전`;

  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}.${String(date.getDate()).padStart(2, "0")}`;
};

const getNotificationId = (notification) =>
  notification.notificationId ?? notification.notification_id ?? notification.id;

const getTargetPostId = (notification) => notification.postId ?? notification.post_id;

const getTargetReservationId = (notification) => notification.reservationId ?? notification.reservation_id;

const getNotificationType = (notification) => String(notification.type ?? "").toUpperCase();

const FALLBACK_BY_TYPE = {
  RESERVATION_REQUESTED: {
    title: "예약 요청이 왔어요!",
    body: "발견자가 예약을 신청했어요. 요청사항과 예약 정보를 확인해주세요.",
  },
  RESERVATION_CONFIRMED: {
    title: "예약이 확정되었어요!",
    body: "안내자가 예약을 확정했어요.",
  },
  RESERVATION_REJECTED: {
    title: "예약이 거절되었어요",
    body: "안내자가 예약을 거절했어요.",
  },
  REVIEW_CREATED: {
    title: "새 리뷰가 등록되었어요!",
    body: "발견자가 코스에 리뷰를 남겼어요.",
  },
};

const getNotificationTitle = (notification) => {
  const title = notification.title ?? "";
  if (title.trim()) return title;
  return FALLBACK_BY_TYPE[getNotificationType(notification)]?.title ?? "알림이 도착했어요";
};

const getNotificationBody = (notification) => {
  const body = notification.message ?? notification.body ?? notification.content ?? "";
  if (String(body).trim()) return body;
  return FALLBACK_BY_TYPE[getNotificationType(notification)]?.body ?? "";
};

const isUnreadNotification = (notification) => {
  if (notification.isUnread !== undefined) return Boolean(notification.isUnread);
  return !Boolean(notification.isRead ?? notification.is_read ?? notification.read);
};

export default function NotificationPage() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (!localStorage.getItem("accessToken") || !userId) return undefined;
    let alive = true;
    setIsLoading(true);
    getNotifications(userId)
      .then((items) => {
        if (alive) setNotifications(items);
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

  const handleClick = async (noti) => {
    const notificationId = getNotificationId(noti);
    if (notificationId && isUnreadNotification(noti)) {
      setNotifications((items) =>
        items.map((item) =>
          getNotificationId(item) === notificationId ? { ...item, isRead: true, isUnread: false } : item
        )
      );
      markNotificationRead(notificationId).catch(() => {});
    }

    const type = getNotificationType(noti);
    const postId = getTargetPostId(noti);

    if (type.includes("REVIEW") && postId) {
      sessionStorage.setItem("currentCoursePost", JSON.stringify({ postId }));
      navigate("/course", {
        state: {
          post: { postId },
          initialTab: "review",
        },
      });
      return;
    }

    const reservationId = getTargetReservationId(noti);
    if (reservationId) {
      navigate(`/reservation-status/${reservationId}`);
      return;
    }

    if (type === "RESERVATION_REQUESTED") {
      navigate("/guide-reservations");
      return;
    }

    if (postId) {
      sessionStorage.setItem("currentCoursePost", JSON.stringify({ postId }));
      navigate("/course", {
        state: {
          post: { postId },
          initialTab: String(noti.type ?? "").includes("REVIEW") ? "review" : "course",
        },
      });
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
              title={getNotificationTitle(noti)}
              body={getNotificationBody(noti)}
              timeLabel={noti.timeLabel ?? formatTimeLabel(noti.createdAt ?? noti.created_at)}
              isUnread={isUnreadNotification(noti)}
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
  width: min(var(--app-page-width), 100vw);
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
