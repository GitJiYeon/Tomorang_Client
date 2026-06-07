import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import Header from "../components/Header";
import GuideBottomNav from "../components/mainComponents/GuideBottomNav";
import StatusFilter from "../components/reservation/StatusFilter";
import ReservationCard from "../components/reservation/ReservationCard";
import DateIcon from "../assets/reservation/DateIcon.svg";
import Clocklogo from "../assets/reservation/Clocklogo.svg";
import NextButton from "../assets/graynextlogo.svg";
import { getChatRooms, getPostDetail } from "../api/tomorang";

const CHAT_OPTIONS = ["연락중", "완료됨"];

const getRoomPostId = (room) =>
  room.postId ?? room.post_id ?? room.post?.postId ?? room.post?.post_id ?? room.post?.id;

const getRoomStatus = (room) => {
  const status = String(room.status ?? room.roomStatus ?? "").toUpperCase();
  return status.includes("CLOSE") || status.includes("COMPLETE") ? "완료됨" : "연락중";
};

export default function GuideChatPage() {
  const [selectedStatus, setSelectedStatus] = useState("연락중");
  const [rooms, setRooms] = useState([]);
  const [postMap, setPostMap] = useState({});
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
    return () => {
      alive = false;
    };
  }, [currentUserId]);

  useEffect(() => {
    let alive = true;
    const missingPostIds = [
      ...new Set(rooms.map(getRoomPostId).filter((postId) => postId && !postMap[String(postId)])),
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

  const filtered = useMemo(
    () => rooms.filter((room) => getRoomStatus(room) === selectedStatus),
    [rooms, selectedStatus]
  );

  return (
    <PageWrapper>
      <Header coment="채팅" />
      <StatusFilter
        options={CHAT_OPTIONS}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
      />
      <CardList>
        {errorMessage && <PlaceholderText>{errorMessage}</PlaceholderText>}
        {!errorMessage && filtered.length > 0 ? (
          filtered.map((room) => {
            const postId = getRoomPostId(room);
            const post = room.post ?? postMap[String(postId)];
            if (!post) return null;
            return (
              <ReservationCard
                key={room.roomId ?? room.id ?? `${postId}-${room.otherUserId ?? ""}`}
                post={post}
                date={room.date ?? room.lastMessageDate ?? ""}
                time={room.time ?? room.lastMessageTime ?? ""}
                dateIcon={DateIcon}
                clockIcon={Clocklogo}
                nextIcon={NextButton}
                onClick={() =>
                  navigate(`/chat/${postId}`, {
                    state: {
                      post,
                      roomId: room.roomId ?? room.id,
                      otherUserId: room.otherUserId ?? room.userId ?? room.participantId,
                    },
                  })
                }
              />
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
  width: min(390px, 100vw);
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
  gap: 12px;
  padding: 16px 20px;
  padding-bottom: calc(100px + env(safe-area-inset-bottom));
  background-color: #fff;
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const PlaceholderText = styled.div`
  text-align: center;
  padding: 60px 0;
  color: #999;
  font-family: Pretendard, sans-serif;
  font-size: 14px;
`;
