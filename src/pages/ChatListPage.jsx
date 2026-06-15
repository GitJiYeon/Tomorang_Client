import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import Header from "../components/Header";
import BottomNav from "../components/mainComponents/BottomNav";
import { getChatRooms, getMyReservations, getPostReviews } from "../api/tomorang";
import DefaultProfileIcon from "../assets/defaultProfile.svg";
import { applyReviewCompletion, getEffectiveReservationStatus, STATUS } from "../utils/reservationFlow";

const CHAT_OPTIONS = ["연락중", "완료됨"];

const formatTime = (value) => {
  if (!value) return "";

  return new Date(value).toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getRoomPostId = (room) =>
  room.postId ?? room.post_id ?? room.post?.postId ?? room.post?.post_id ?? room.post?.id;

const getRoomReservationId = (room) =>
  room.reservationId ?? room.reservation_id ?? room.reservation?.reservationId ?? room.reservation?.id;

const getReservationPostId = (reservation) =>
  reservation?.postId ?? reservation?.post_id ?? reservation?.post?.postId ?? reservation?.post?.post_id ?? reservation?.post?.id;

const getReservationId = (reservation) =>
  reservation?.reservationId ?? reservation?.reservation_id ?? reservation?.id;

const getRoomStatus = (room, reservationMap, reservationByPostMap) => {
  const postId = getRoomPostId(room);
  const reservation =
    reservationMap[String(getRoomReservationId(room))] ??
    reservationByPostMap[String(postId)] ??
    room.reservation ??
    room.reservationDTO ??
    room.reservationDto;
  const status = getEffectiveReservationStatus(reservation ?? { status: room.status ?? room.roomStatus });

  return status === STATUS.COMPLETED || status.includes("COMPLETE") || status.includes("DONE")
    ? "완료됨"
    : "연락중";
};

export default function ChatListPage() {
  const navigate = useNavigate();
  const currentUserId = localStorage.getItem("userId");
  const [selectedStatus, setSelectedStatus] = useState("연락중");
  const [rooms, setRooms] = useState(null);
  const [reservations, setReservations] = useState([]);
  const [reviewMap, setReviewMap] = useState({});
  const [errorMessage, setErrorMessage] = useState("");
  const authErrorMessage = currentUserId ? "" : "로그인 후 채팅을 사용할 수 있습니다.";

  useEffect(() => {
    if (!currentUserId) {
      return;
    }

    let alive = true;

    getChatRooms(currentUserId)
      .then((rooms) => {
        if (alive) setRooms(rooms);
      })
      .catch((error) => {
        if (alive) setErrorMessage(error.message || "채팅 목록을 불러오지 못했습니다.");
      });

    getMyReservations()
      .then((serverReservations) => {
        if (alive) setReservations(serverReservations);
      })
      .catch(() => {
        if (alive) setReservations([]);
      });

    return () => {
      alive = false;
    };
  }, [currentUserId]);

  useEffect(() => {
    let alive = true;
    const postIds = [
      ...new Set(
        reservations
          .map(getReservationPostId)
          .filter((postId) => postId && !reviewMap[String(postId)])
      ),
    ];

    Promise.all(
      postIds.map((postId) =>
        getPostReviews(postId)
          .then((reviews) => [String(postId), reviews])
          .catch(() => [String(postId), []])
      )
    ).then((entries) => {
      if (!alive || entries.length === 0) return;
      setReviewMap((prev) => ({ ...prev, ...Object.fromEntries(entries) }));
    });

    return () => {
      alive = false;
    };
  }, [reservations, reviewMap]);

  const reservationMap = Object.fromEntries(
    reservations
      .map((reservation) => {
        const reservationId = getReservationId(reservation);
        if (!reservationId) return null;
        const postId = getReservationPostId(reservation);
        const effectiveReservation = applyReviewCompletion(reservation, reviewMap[String(postId)] ?? []);
        return [String(reservationId), effectiveReservation];
      })
      .filter(Boolean)
  );

  const reservationByPostMap = Object.fromEntries(
    reservations
      .map((reservation) => {
        const postId = getReservationPostId(reservation);
        if (!postId) return null;
        const effectiveReservation = applyReviewCompletion(reservation, reviewMap[String(postId)] ?? []);
        return [String(postId), effectiveReservation];
      })
      .filter(Boolean)
  );

  const filteredRooms = (rooms ?? []).filter(
    (room) => getRoomStatus(room, reservationMap, reservationByPostMap) === selectedStatus
  );

  const openRoom = (room) => {
    const otherUserId = room.otherUserId ?? room.otherUser;
    const postId = getRoomPostId(room);
    const reservation =
      reservationMap[String(getRoomReservationId(room))] ??
      reservationByPostMap[String(postId)] ??
      room.reservation ??
      room.reservationDTO ??
      room.reservationDto;
    const isCompletedRoom = getRoomStatus(room, reservationMap, reservationByPostMap) === "완료됨";
    navigate(`/chat/${room.roomId}`, {
      state: {
        roomId: room.roomId,
        otherUserId,
        postId,
        postTitle: room.postTitle ?? room.title,
        reservation,
        isCompleted: isCompletedRoom,
        post: room.postTitle
          ? {
              postId,
              title: room.postTitle,
              images: [room.thumbnailUrl].filter(Boolean),
            }
          : undefined,
      },
    });
  };

  return (
    <PageWrapper>
      <Header coment="채팅" />
      <Tabs>
        {CHAT_OPTIONS.map((status) => (
          <TabButton
            key={status}
            type="button"
            $active={selectedStatus === status}
            onClick={() => setSelectedStatus(status)}
          >
            {status}
          </TabButton>
        ))}
      </Tabs>
      <Content>
        {currentUserId && !errorMessage && rooms === null && (
          <PlaceholderText>채팅 목록을 불러오는 중입니다.</PlaceholderText>
        )}
        {(authErrorMessage || errorMessage) && (
          <ErrorText>{authErrorMessage || errorMessage}</ErrorText>
        )}
        {!authErrorMessage && !errorMessage && rooms?.length === 0 && (
          <PlaceholderText>채팅 내역이 없습니다.</PlaceholderText>
        )}
        {filteredRooms.map((room, index) => (
          <RoomButton
            key={room.roomId ?? `${room.otherUser}-${index}`}
            type="button"
            onClick={() => openRoom(room)}
          >
            <Avatar src={DefaultProfileIcon} alt="" />
            <RoomInfo>
              <TopRow>
                <Name>{room.otherUser ?? "상대방"}</Name>
                <Time>{formatTime(room.lastMessageTime)}</Time>
              </TopRow>
              <LastMessage>{room.lastMessage || "아직 메시지가 없습니다."}</LastMessage>
            </RoomInfo>
            {Number(room.unreadCount) > 0 && <Unread>{room.unreadCount}</Unread>}
          </RoomButton>
        ))}
      </Content>
      <BottomNav activeIndex={3} />
    </PageWrapper>
  );
}

const PageWrapper = styled.div`
  width: min(390px, 100vw);
  height: 100dvh;
  margin: 0 auto;
  background: #fff;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const Content = styled.div`
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 12px 16px calc(100px + env(safe-area-inset-bottom));
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const Tabs = styled.div`
  height: 72px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 24px;
  border-bottom: 1px solid #f3f4f3;
  background: #fff;
  box-sizing: border-box;
  flex-shrink: 0;
`;

const TabButton = styled.button`
  height: 44px;
  padding: 0 18px;
  border-radius: 999px;
  border: 1px solid ${({ $active }) => ($active ? "#c5f598" : "#dadada")};
  background: ${({ $active }) => ($active ? "#c5f598" : "#fff")};
  color: ${({ $active }) => ($active ? "#111" : "#4e4e4e")};
  font-family: Pretendard, sans-serif;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
`;

const RoomButton = styled.button`
  width: 100%;
  min-height: 76px;
  padding: 12px 0;
  border: none;
  border-bottom: 1px solid #f3f4f3;
  background: #fff;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  text-align: left;
`;

const Avatar = styled.img`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #f3f4f3;
  flex-shrink: 0;
`;

const RoomInfo = styled.div`
  min-width: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const TopRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
`;

const Name = styled.span`
  color: #111;
  font-size: 15px;
  font-weight: 700;
`;

const Time = styled.span`
  color: #acacac;
  font-size: 11px;
  flex-shrink: 0;
`;

const LastMessage = styled.span`
  color: #4e4e4e;
  font-size: 13px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const Unread = styled.span`
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  border-radius: 10px;
  background: #c5f598;
  color: #111;
  font-size: 11px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const PlaceholderText = styled.div`
  padding: 60px 0;
  color: #999;
  font-size: 14px;
  text-align: center;
`;

const ErrorText = styled.p`
  margin: 24px 0;
  color: #d93025;
  font-size: 13px;
  font-weight: 500;
  text-align: center;
`;
