import React, { useState, useRef, useEffect } from "react";
import { useLocation, useParams } from "react-router-dom";
import styled from "styled-components";
import Mybubble from "../components/chatComponents/Mybubble";
import Otherbubble from "../components/chatComponents/Otherbubble";
import Quickreply from "../components/chatComponents/Quickreply";
import ChatHeader from "../components/chatComponents/ChatHeader";
import MessageInput from "../components/chatComponents/MessageInput";
import ReportSystem from "../components/ReportModal";
import AddIcon from "../assets/chatimg/AddIcon.svg";
import SendIcon from "../assets/chatimg/sendIcon.svg";
import ChangeIcon from "../assets/chatimg/Change.svg";
import {
  createOrGetChatRoom,
  getChatHistory,
  getChatHistoryByRoom,
  getPostDetail,
  markChatRoomRead,
} from "../api/tomorang";

const formatTime = (value) =>
  new Date(value || Date.now()).toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
  });

export default function Chat() {
  const { postId } = useParams();
  const { state } = useLocation();

  const [post, setPost] = useState(state?.post ?? null);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [showReport, setShowReport] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const bottomRef = useRef(null);

  const currentUserId = localStorage.getItem("userId");
  const roomIdFromState = state?.roomId;
  const otherUserId = state?.otherUserId ?? post?.userId ?? post?.user_id;

  useEffect(() => {
    if (!postId) return undefined;
    let alive = true;
    getPostDetail(postId)
      .then((post) => {
        if (alive) setPost(post);
      })
      .catch(() => {});

    return () => {
      alive = false;
    };
  }, [postId]);

  useEffect(() => {
    if (!currentUserId) return;

    let alive = true;
    const loadMessages = roomIdFromState
      ? getChatHistoryByRoom(roomIdFromState).then((history) => {
          if (!alive) return;
          setMessages(
            history.map((message, index) => ({
              id: `${message.timestamp || Date.now()}_${index}`,
              type: message.sender === currentUserId ? "me" : "other",
              message: message.content,
              time: formatTime(message.timestamp),
            }))
          );
          markChatRoomRead(roomIdFromState, currentUserId).catch(() => {});
        })
      : otherUserId
        ? createOrGetChatRoom(currentUserId, otherUserId)
      .then((room) => {
        if (!alive) return;
        const nextRoomId = room.roomId || room.id || "";
        return getChatHistory(currentUserId, otherUserId).then((history) => {
          if (!alive) return;
          setMessages(
            history.map((message, index) => ({
              id: `${message.timestamp || Date.now()}_${index}`,
              type: message.sender === currentUserId ? "me" : "other",
              message: message.content,
              time: formatTime(message.timestamp),
            }))
          );

          if (nextRoomId) {
            markChatRoomRead(nextRoomId, currentUserId).catch(() => {});
          }
        });
      })
        : Promise.resolve();

    loadMessages
      .catch((error) => {
        if (alive) setErrorMessage(error.message || "채팅방을 불러오지 못했습니다.");
      });

    return () => {
      alive = false;
    };
  }, [currentUserId, otherUserId, roomIdFromState]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = (text) => {
    if (!text.trim()) return;

    const now = new Date().toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" });
    const newMsg = {
      id: Date.now(),
      type: "me",
      message: text.trim(),
      time: now,
      pending: true,
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputValue("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputValue);
    }
  };

  return (
    <PageWrapper>
      <ChatHeader
        name={post?.userId ?? "가이드"}
        subtitle={post?.title ?? otherUserId ?? ""}
        onFlag={() => setShowReport(true)}
      />

      <MessageList>
        {errorMessage && <ErrorText>{errorMessage}</ErrorText>}
        {!currentUserId && <ErrorText>로그인 후 채팅을 사용할 수 있습니다.</ErrorText>}
        {messages.map((msg) =>
          msg.type === "me" ? (
            <Mybubble key={msg.id} message={msg.message} time={msg.time} />
          ) : (
            <Otherbubble
              key={msg.id}
              message={msg.message}
              translation={msg.translation}
              time={msg.time}
              changeIcon={ChangeIcon}
            />
          )
        )}
        {messages.length === 0 && !errorMessage && (
          <EmptyText>아직 메시지가 없습니다.</EmptyText>
        )}
        <div ref={bottomRef} />
      </MessageList>

      <BottomArea>
        <Quickreply onSelect={(text) => setInputValue(text)} />
        <Divider />
        <MessageInput
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onSend={() => sendMessage(inputValue)}
          onKeyDown={handleKeyDown}
          addIcon={AddIcon}
          sendIcon={SendIcon}
        />
      </BottomArea>

      <ReportSystem
        isOpen={showReport}
        onClose={() => setShowReport(false)}
      />
    </PageWrapper>
  );
}

const PageWrapper = styled.div`
  width: 390px;
  height: 100dvh;
  margin: 0 auto;
  background-color: #fff;
  display: flex;
  flex-direction: column;
`;

const MessageList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 16px 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
  scrollbar-width: none;
  &::-webkit-scrollbar { display: none; }
`;

const BottomArea = styled.div`
  background-color: #fff;
`;

const Divider = styled.div`
  width: 100%;
  height: 1px;
  background: #F3F4F3;
`;

const ErrorText = styled.p`
  margin: 8px 16px;
  color: #d93025;
  font-size: 13px;
  font-weight: 500;
`;

const EmptyText = styled.div`
  padding: 40px 16px;
  color: #acacac;
  font-size: 13px;
  text-align: center;
`;
