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
  sendChatMessage,
  translateText,
} from "../api/tomorang";
import {
  createChatSocketClient,
  getRoomTopic,
  publishChatMessage,
} from "../api/chatSocket";
import { getEffectiveReservationStatus, STATUS } from "../utils/reservationFlow";

const parseChatTime = (value) => {
  if (!value) return new Date();
  if (Array.isArray(value)) {
    const [year, month, day, hour = 0, minute = 0, second = 0] = value;
    return new Date(year, Number(month) - 1, day, hour, minute, second);
  }
  if (typeof value === "string") {
    const hasTimezone = /(?:Z|[+-]\d{2}:?\d{2})$/.test(value);
    return new Date(hasTimezone ? value : `${value}Z`);
  }
  return new Date(value);
};

const formatTime = (value) =>
  parseChatTime(value).toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
  });

const normalizeId = (value) => String(value ?? "").trim();

const isImageContent = (content) =>
  /^data:image\//.test(content) || /^https?:\/\/.+\.(png|jpe?g|gif|webp|bmp|svg)(\?.*)?$/i.test(content);

const getTargetLang = () => {
  try {
    const profile = JSON.parse(localStorage.getItem("profile") || "{}");
    const firstLanguage = Array.isArray(profile.languages) ? profile.languages[0] : "";
    const code = typeof firstLanguage === "object" ? firstLanguage.code ?? firstLanguage.language : firstLanguage;
    const normalized = String(code || "").toUpperCase();
    if (["JA", "JP", "JAPANESE"].includes(normalized)) return "JA";
    if (["EN", "ENGLISH"].includes(normalized)) return "EN";
  } catch {
    // Keep Korean as the default app language.
  }
  return "KO";
};

const extractTranslation = (data) =>
  typeof data === "string"
    ? data
    : data?.translatedText ?? data?.translation ?? data?.text ?? data?.result ?? "";

const toChatMessage = (message, currentUserId, index = 0) => {
  const timestamp = message.timestamp ?? message.createdAt ?? message.created_at;
  const sender = message.sender ?? message.senderId ?? message.sender_id;
  const recipient = message.recipient ?? message.recipientId ?? message.recipient_id;
  const content = message.content ?? message.message ?? "";
  const imageUrl = message.imageUrl ?? message.image_url ?? (isImageContent(content) ? content : "");
  const current = normalizeId(currentUserId);
  const normalizedSender = normalizeId(sender);

  return {
    id:
      message.messageId ??
      message.message_id ??
      message.id ??
      `${timestamp || Date.now()}_${sender || "unknown"}_${content}_${index}`,
    sender,
    recipient,
    type: normalizedSender && normalizedSender === current ? "me" : "other",
    message: imageUrl ? "" : content,
    imageUrl,
    translation: message.translation ?? message.translatedText ?? "",
    time: formatTime(timestamp),
  };
};

const upsertMessage = (messages, nextMessage) => {
  if (messages.some((message) => String(message.id) === String(nextMessage.id))) {
    return messages.map((message) =>
      String(message.id) === String(nextMessage.id) ? nextMessage : message
    );
  }

  const duplicateIndex = messages.findIndex((message) =>
    message.pending &&
    message.type === nextMessage.type &&
    message.sender === nextMessage.sender &&
    message.message === nextMessage.message &&
    message.imageUrl === nextMessage.imageUrl
  );

  if (duplicateIndex >= 0) {
    return messages.map((message, index) => (index === duplicateIndex ? nextMessage : message));
  }

  return [...messages, nextMessage];
};

export default function Chat() {
  const { postId } = useParams();
  const { state } = useLocation();
  const routeId = postId;
  const isRoutePostId = /^\d+$/.test(String(routeId ?? ""));
  const currentUserId = localStorage.getItem("userId");
  const roomId = state?.roomId ?? (!isRoutePostId ? routeId : null);

  const [post, setPost] = useState(state?.post ?? null);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [showReport, setShowReport] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [activeRoomId, setActiveRoomId] = useState(roomId);
  const [translatingIds, setTranslatingIds] = useState(() => new Set());
  const bottomRef = useRef(null);
  const chatClientRef = useRef(null);

  const otherUserId = state?.otherUserId ?? post?.userId ?? post?.user_id;
  const headerName = otherUserId ?? post?.userId ?? "가이드";
  const headerSubtitle = state?.postTitle ?? state?.post?.title ?? post?.title ?? "";
  const isCompletedChat =
    Boolean(state?.isCompleted) ||
    getEffectiveReservationStatus(state?.reservation ?? { status: state?.status }) === STATUS.COMPLETED;

  useEffect(() => {
    if (roomId) setActiveRoomId(roomId);
  }, [roomId]);

  useEffect(() => {
    if (!isRoutePostId || !routeId) return undefined;
    let alive = true;
    getPostDetail(routeId)
      .then((post) => {
        if (alive) setPost(post);
      })
      .catch(() => {});

    return () => {
      alive = false;
    };
  }, [isRoutePostId, routeId]);

  useEffect(() => {
    if (!currentUserId) return;

    let alive = true;
    const loadMessages = roomId
      ? getChatHistoryByRoom(roomId).then((history) => {
          if (!alive) return;
          setActiveRoomId(roomId);
          setMessages(
            history.map((message, index) => toChatMessage(message, currentUserId, index))
          );
          markChatRoomRead(roomId, currentUserId).catch(() => {});
        })
      : otherUserId
        ? createOrGetChatRoom(currentUserId, otherUserId)
      .then((room) => {
        if (!alive) return;
        const nextRoomId = room.roomId || room.id || "";
        if (nextRoomId) setActiveRoomId(nextRoomId);
        const historyRequest = nextRoomId
          ? getChatHistoryByRoom(nextRoomId)
          : getChatHistory(currentUserId, otherUserId);

        return historyRequest.then((history) => {
          if (!alive) return;
          setMessages(
            history.map((message, index) => toChatMessage(message, currentUserId, index))
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
  }, [currentUserId, otherUserId, roomId]);

  useEffect(() => {
    if (!activeRoomId || !currentUserId) return undefined;

    let subscription;
    const client = createChatSocketClient({
      onConnect: () => {
        setErrorMessage("");
        subscription = client.subscribe(getRoomTopic(activeRoomId), (frame) => {
          try {
            const received = JSON.parse(frame.body);
            const nextMessage = toChatMessage(received, currentUserId);
            setMessages((prev) => upsertMessage(prev, nextMessage));
            markChatRoomRead(activeRoomId, currentUserId).catch(() => {});
          } catch {
            setErrorMessage("채팅 메시지를 읽지 못했습니다.");
          }
        });
      },
      onStompError: () => {
        setErrorMessage("채팅 서버 연결 중 오류가 발생했습니다.");
      },
      onWebSocketError: () => {
        setErrorMessage("채팅 서버에 연결하지 못했습니다.");
      },
    });

    chatClientRef.current = client;
    client.activate();

    return () => {
      subscription?.unsubscribe();
      if (chatClientRef.current === client) {
        chatClientRef.current = null;
      }
      client.deactivate();
    };
  }, [activeRoomId, currentUserId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleTranslate = async (messageId) => {
    const targetMessage = messages.find((message) => String(message.id) === String(messageId));
    if (!targetMessage?.message || targetMessage.translation) return;

    setTranslatingIds((prev) => new Set(prev).add(String(messageId)));
    try {
      const data = await translateText(targetMessage.message, getTargetLang());
      const translation = extractTranslation(data);
      if (!translation) return;
      setMessages((prev) =>
        prev.map((message) =>
          String(message.id) === String(messageId)
            ? { ...message, translation }
            : message
        )
      );
    } catch {
      setErrorMessage("번역에 실패했습니다.");
    } finally {
      setTranslatingIds((prev) => {
        const next = new Set(prev);
        next.delete(String(messageId));
        return next;
      });
    }
  };

  const sendMessage = async (text) => {
    if (isCompletedChat) {
      setErrorMessage("완료된 투어의 채팅은 더 이상 보낼 수 없어요.");
      return;
    }
    if (!text.trim()) return;
    if (!currentUserId) {
      setErrorMessage("로그인 후 채팅을 사용할 수 있습니다.");
      return;
    }
    if (!activeRoomId) {
      setErrorMessage("채팅방을 준비하는 중입니다. 잠시 후 다시 시도해주세요.");
      return;
    }

    const client = chatClientRef.current;
    const payload = {
      roomId: activeRoomId,
      sender: currentUserId,
      recipient: otherUserId,
      content: text.trim(),
      type: "CHAT",
    };

    if (client?.connected && otherUserId) {
      try {
        publishChatMessage(client, payload);
        setMessages((prev) =>
          upsertMessage(prev, {
            id: `pending_${Date.now()}`,
            type: "me",
            sender: currentUserId,
            recipient: otherUserId,
            message: isImageContent(payload.content) ? "" : payload.content,
            imageUrl: isImageContent(payload.content) ? payload.content : "",
            time: formatTime(),
            pending: true,
          })
        );
        setInputValue("");
        return;
      } catch {
        // REST fallback below keeps the message saved even if STOMP publish fails.
      }
    }

    try {
      const savedMessage = await sendChatMessage(payload);
      setMessages((prev) => upsertMessage(prev, toChatMessage(savedMessage, currentUserId)));
      setInputValue("");
      setErrorMessage("");
    } catch (error) {
      setErrorMessage(error.message || "메시지를 전송하지 못했습니다.");
    }
  };

  const sendImage = async (file) => {
    if (isCompletedChat) {
      setErrorMessage("완료된 투어의 채팅은 더 이상 보낼 수 없어요.");
      return;
    }
    if (!file.type.startsWith("image/")) return;

    const reader = new FileReader();
    reader.onload = () => {
      const imageUrl = String(reader.result || "");
      if (imageUrl) sendMessage(imageUrl);
    };
    reader.onerror = () => setErrorMessage("사진을 불러오지 못했습니다.");
    reader.readAsDataURL(file);
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
        name={headerName}
        subtitle={headerSubtitle}
        onFlag={() => setShowReport(true)}
      />

      <MessageList>
        {errorMessage && <ErrorText>{errorMessage}</ErrorText>}
        {!currentUserId && <ErrorText>로그인 후 채팅을 사용할 수 있습니다.</ErrorText>}
        {messages.map((msg) =>
          msg.type === "me" ? (
            <Mybubble key={msg.id} message={msg.message} imageUrl={msg.imageUrl} time={msg.time} />
          ) : (
            <Otherbubble
              key={msg.id}
              message={msg.message}
              translation={msg.translation}
              imageUrl={msg.imageUrl}
              time={msg.time}
              changeIcon={ChangeIcon}
              onTranslate={() => handleTranslate(msg.id)}
              isTranslating={translatingIds.has(String(msg.id))}
            />
          )
        )}
        {messages.length === 0 && !errorMessage && (
          <EmptyText>아직 메시지가 없습니다.</EmptyText>
        )}
        <div ref={bottomRef} />
      </MessageList>

      <BottomArea>
        {isCompletedChat ? (
          <CompletedNotice>완료된 투어의 채팅입니다.</CompletedNotice>
        ) : (
          <Quickreply onSelect={(text) => setInputValue(text)} />
        )}
        <Divider />
        <MessageInput
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onSend={() => sendMessage(inputValue)}
          onKeyDown={handleKeyDown}
          onImageSelect={sendImage}
          addIcon={AddIcon}
          sendIcon={SendIcon}
          disabled={isCompletedChat}
        />
      </BottomArea>

      <ReportSystem
        isOpen={showReport}
        onClose={() => setShowReport(false)}
        targetType="USER"
        targetId={otherUserId}
        hiddenGuide={{
          id: otherUserId,
          userId: otherUserId,
          nickname: otherUserId,
          bio: post?.title ?? "",
        }}
      />
    </PageWrapper>
  );
}

const PageWrapper = styled.div`
  width: var(--app-page-width);
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

const CompletedNotice = styled.div`
  padding: 12px 16px;
  color: #acacac;
  font-family: Pretendard, sans-serif;
  font-size: 13px;
  text-align: center;
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
