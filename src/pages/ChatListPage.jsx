import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import Header from "../components/Header";
import BottomNav from "../components/mainComponents/BottomNav";
import { getChatRooms } from "../api/tomorang";
import DefaultProfileIcon from "../assets/defaultProfile.svg";

const formatTime = (value) => {
  if (!value) return "";

  return new Date(value).toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function ChatListPage() {
  const navigate = useNavigate();
  const currentUserId = localStorage.getItem("userId");
  const [rooms, setRooms] = useState(null);
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
      })

    return () => {
      alive = false;
    };
  }, [currentUserId]);

  const openRoom = (room) => {
    navigate(`/chat/${room.roomId}`, {
      state: {
        roomId: room.roomId,
        otherUserId: room.otherUser,
      },
    });
  };

  return (
    <PageWrapper>
      <Header coment="채팅" />
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
        {(rooms ?? []).map((room, index) => (
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
