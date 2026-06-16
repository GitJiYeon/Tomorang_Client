import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import Header from "../components/Header";
import GuideBottomNav from "../components/mainComponents/GuideBottomNav";
import DateIcon from "../assets/reservation/DateIcon.svg";
import Clocklogo from "../assets/reservation/Clocklogo.svg";
import NextButton from "../assets/graynextlogo.svg";
import DefaultProfileIcon from "../assets/defaultProfile.svg";
import { getChatRooms, getMyReservations, getPostDetail, getPostReviews } from "../api/tomorang";
import { applyReviewCompletion, getEffectiveReservationStatus, STATUS } from "../utils/reservationFlow";

const CHAT_OPTIONS = ["연락중", "완료됨"];
const isPostId = (value) => /^\d+$/.test(String(value ?? ""));

const getRoomPostId = (room) =>
  room.postId ?? room.post_id ?? room.post?.postId ?? room.post?.post_id ?? room.post?.id;

const getRoomReservationId = (room) =>
  room.reservationId ?? room.reservation_id ?? room.reservation?.reservationId ?? room.reservation?.id;

const getReservationPostId = (reservation) =>
  reservation?.postId ?? reservation?.post_id ?? reservation?.post?.postId ?? reservation?.post?.post_id ?? reservation?.post?.id;

const getReservationId = (reservation) =>
  reservation?.reservationId ?? reservation?.reservation_id ?? reservation?.id;

const getReservationDate = (value) =>
  value?.date ??
  value?.slotDate ??
  value?.slot_date ??
  value?.scheduleDate ??
  value?.schedule_date ??
  value?.reservationDate ??
  value?.reservation_date ??
  value?.selectedDate ??
  value?.selected_date ??
  value?.startDate ??
  value?.start_date ??
  value?.tourDate ??
  value?.tour_date;

const getReservationTime = (value) =>
  value?.time ??
  value?.slotTime ??
  value?.slot_time ??
  value?.timeSlot ??
  value?.time_slot ??
  value?.reservationTime ??
  value?.reservation_time ??
  value?.selectedTime ??
  value?.selected_time ??
  value?.startTime ??
  value?.start_time ??
  value?.tourTime ??
  value?.tour_time;

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

const formatDate = (value) => {
  if (!value) return "";
  const raw = String(value);
  if (/^\d{4}-\d{2}-\d{2}/.test(raw)) return raw.slice(0, 10);
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return raw;
  return date.toISOString().slice(0, 10);
};

const formatTime = (value) => {
  if (!value) return "";
  const raw = String(value);
  if (/^\d{1,2}:\d{2}/.test(raw)) return raw;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return raw;
  return date.toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function GuideChatPage() {
  const [selectedStatus, setSelectedStatus] = useState("연락중");
  const [rooms, setRooms] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [postMap, setPostMap] = useState({});
  const [reviewMap, setReviewMap] = useState({});
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();
  const currentUserId = localStorage.getItem("userId");

  useEffect(() => {
    if (!currentUserId) return undefined;
    let alive = true;

    getChatRooms(currentUserId)
      .then((serverRooms) => {
        if (alive) setRooms(serverRooms);
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
    const missingPostIds = [
      ...new Set(
        rooms
          .map(getRoomPostId)
          .filter((postId) => isPostId(postId) && !postMap[String(postId)])
      ),
    ];

    Promise.all(
      missingPostIds.map((postId) =>
        getPostDetail(postId)
          .then((post) => [String(postId), post])
          .catch(() => null)
      )
    ).then((entries) => {
      if (!alive) return;
      const nextEntries = entries.filter(Boolean);
      if (nextEntries.length > 0) {
        setPostMap((prev) => ({ ...prev, ...Object.fromEntries(nextEntries) }));
      }
    });

    return () => {
      alive = false;
    };
  }, [postMap, rooms]);

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

  const reservationMap = useMemo(() => {
    return Object.fromEntries(
      reservations
        .map((reservation) => {
          const reservationId = getReservationId(reservation);
          if (!reservationId) return null;
          const postId = getReservationPostId(reservation);
          const effectiveReservation = applyReviewCompletion(
            reservation,
            reviewMap[String(postId)] ?? []
          );
          return [String(reservationId), effectiveReservation];
        })
        .filter(Boolean)
    );
  }, [reservations, reviewMap]);

  const reservationByPostMap = useMemo(() => {
    return Object.fromEntries(
      reservations
        .map((reservation) => {
          const postId = getReservationPostId(reservation);
          if (!postId) return null;
          const effectiveReservation = applyReviewCompletion(
            reservation,
            reviewMap[String(postId)] ?? []
          );
          return [String(postId), effectiveReservation];
        })
        .filter(Boolean)
    );
  }, [reservations, reviewMap]);

  const filteredRooms = useMemo(
    () => rooms.filter((room) => getRoomStatus(room, reservationMap, reservationByPostMap) === selectedStatus),
    [reservationByPostMap, reservationMap, rooms, selectedStatus]
  );

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

      <CardList>
        {errorMessage && <PlaceholderText>{errorMessage}</PlaceholderText>}
        {!errorMessage && filteredRooms.length > 0 ? (
          filteredRooms.map((room) => {
            const roomId = room.roomId ?? room.id;
            const rawPostId = getRoomPostId(room);
            const postId = isPostId(rawPostId) ? rawPostId : null;
            const roomReservation = room.reservation ?? room.reservationDTO ?? room.reservationDto;
            const reservation =
              reservationMap[String(getRoomReservationId(room))] ??
              reservationByPostMap[String(postId)] ??
              roomReservation;
            const roomStatus = getRoomStatus(room, reservationMap, reservationByPostMap);
            const isCompletedRoom = roomStatus === "완료됨";
            const otherUserId = room.otherUserId ?? room.otherUser ?? room.userId ?? room.participantId;
            const post = room.post ?? postMap[String(postId)] ?? {
              title: room.postTitle ?? room.title ?? "채팅",
              subtitle: room.postSubtitle ?? room.subtitle ?? room.lastMessage ?? "아직 메시지가 없습니다.",
              images: [room.thumbnailUrl ?? room.imageUrl ?? DefaultProfileIcon],
            };
            const chatRouteId = postId ?? roomId;
            const cardDate = formatDate(
              getReservationDate(reservation) ??
                getReservationDate(roomReservation) ??
                getReservationDate(room)
            );
            const cardTime = formatTime(
              getReservationTime(reservation) ??
                getReservationTime(roomReservation) ??
                getReservationTime(room)
            );

            if (!chatRouteId) return null;

            return (
              <ChatCard
                key={roomId ?? `${postId}-${otherUserId ?? ""}`}
                type="button"
                onClick={() =>
                  navigate(`/chat/${chatRouteId}`, {
                    state: {
                      post,
                      postId,
                      postTitle: post.title,
                      roomId,
                      otherUserId,
                      reservation,
                      isCompleted: isCompletedRoom,
                    },
                  })
                }
              >
                <CardMainRow>
                  <Thumbnail src={post.images?.[0] ?? DefaultProfileIcon} alt={post.title} />
                  <CardInfo>
                    <CardText>
                      <CardTitle>{post.title}</CardTitle>
                      <CardSubtitle>{post.subtitle}</CardSubtitle>
                    </CardText>
                    {(cardTime || cardDate) && (
                      <MetaRow>
                        {cardTime && (
                          <MetaItem>
                            <MetaIcon src={Clocklogo} alt="" />
                            <MetaText>{cardTime}</MetaText>
                          </MetaItem>
                        )}
                        {cardDate && (
                          <MetaItem>
                            <MetaIcon src={DateIcon} alt="" />
                            <MetaText>{cardDate}</MetaText>
                          </MetaItem>
                        )}
                      </MetaRow>
                    )}
                  </CardInfo>
                  <NextIcon src={NextButton} alt="" />
                </CardMainRow>
              </ChatCard>
            );
          })
        ) : (
          !errorMessage && <PlaceholderText>채팅 내역이 없습니다.</PlaceholderText>
        )}
      </CardList>
      <GuideBottomNav activeIndex={2} />
    </PageWrapper>
  );
}

const PageWrapper = styled.div`
  width: min(var(--app-page-width), 100vw);
  margin: 0 auto;
  background-color: #fff;
  height: 100dvh;
  max-height: 100dvh;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  overflow: hidden;
`;

const CardList = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 16px 21px;
  padding-bottom: var(--app-bottom-nav-reserved-space);
  background-color: #fff;
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const Tabs = styled.div`
  height: 82px;
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
  height: 52px;
  padding: 0 18px;
  border-radius: 999px;
  border: 1px solid ${({ $active }) => ($active ? "#c5f598" : "#dadada")};
  background: ${({ $active }) => ($active ? "#c5f598" : "#fff")};
  color: ${({ $active }) => ($active ? "#111" : "#4e4e4e")};
  font-family: Pretendard, sans-serif;
  font-size: 15px;
  font-weight: 600;
  line-height: 20px;
  cursor: pointer;
`;

const ChatCard = styled.button`
  display: flex;
  width: var(--app-content-width);
  min-height: 122px;
  padding: 12px;
  align-items: center;
  gap: 12px;
  border-radius: 14px;
  border: 1px solid #eeeeee;
  background: #fff;
  box-sizing: border-box;
  text-align: left;
  cursor: pointer;
  box-shadow: 0 1px 2px rgba(17, 17, 17, 0.03);
`;

const CardMainRow = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 14px;
`;

const Thumbnail = styled.img`
  width: 100px;
  height: 100px;
  border-radius: 12px;
  object-fit: cover;
  background: #f3f4f3;
  flex-shrink: 0;
`;

const CardInfo = styled.div`
  min-width: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 16px;
`;

const CardText = styled.div`
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const CardTitle = styled.span`
  color: #111;
  font-family: Pretendard, sans-serif;
  font-size: 16px;
  font-weight: 700;
  line-height: 22px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const CardSubtitle = styled.span`
  color: #4e4e4e;
  font-family: Pretendard, sans-serif;
  font-size: 13px;
  font-weight: 400;
  line-height: 18px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const MetaRow = styled.div`
  display: flex;
  align-items: center;
  gap: 18px;
  min-width: 0;
`;

const MetaItem = styled.span`
  min-width: 0;
  display: inline-flex;
  align-items: center;
  gap: 5px;
`;

const MetaIcon = styled.img`
  width: 14px;
  height: 14px;
  flex-shrink: 0;
`;

const MetaText = styled.span`
  color: #4e4e4e;
  font-family: Pretendard, sans-serif;
  font-size: 12px;
  font-weight: 500;
  line-height: 18px;
  white-space: nowrap;
`;

const NextIcon = styled.img`
  width: 13px;
  height: 13px;
  flex-shrink: 0;
`;

const PlaceholderText = styled.div`
  text-align: center;
  padding: 60px 0;
  color: #999;
  font-family: Pretendard, sans-serif;
  font-size: 14px;
`;
