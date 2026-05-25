import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import Header from "../components/Header";
import StatusFilter from "../components/reservation/StatusFilter";
import ReservationCard from "../components/reservation/ReservationCard";
import DateIcon from "../assets/reservation/DateIcon.svg";
import Clocklogo from "../assets/reservation/Clocklogo.svg";
import NextButton from "../assets/graynextlogo.svg";
import postData from "../data/postData.json";

const CHAT_OPTIONS = ["연락중", "완료됨"];

const MOCK_CHATS = [
  { id: 1, postId: 2, date: "2026-02-21", time: "12:00-13:00", status: "연락중" },
  { id: 2, postId: 2, date: "2026-02-21", time: "12:00-13:00", status: "연락중" },
  { id: 3, postId: 1, date: "2026-04-03", time: "09:00-13:00", status: "완료됨" },
];

export default function GuideChatPage() {
  const [selectedStatus, setSelectedStatus] = useState("연락중");
  const navigate = useNavigate();

  const filtered = MOCK_CHATS.filter((c) => c.status === selectedStatus);

  return (
    <PageWrapper>
      <Header coment="채팅" />
      <StatusFilter
        options={CHAT_OPTIONS}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
      />
      <CardList>
        {filtered.length > 0 ? (
          filtered.map((chat) => {
            const post = postData.find((p) => p.postId === chat.postId);
            if (!post) return null;
            return (
              <ReservationCard
                key={chat.id}
                post={post}
                date={chat.date}
                time={chat.time}
                dateIcon={DateIcon}
                clockIcon={Clocklogo}
                nextIcon={NextButton}
                onClick={() => navigate(`/chat/${chat.postId}`)}
              />
            );
          })
        ) : (
          <PlaceholderText>채팅 내역이 없습니다. 🥲</PlaceholderText>
        )}
      </CardList>
      {/* <BottomNav activeIndex={3} />  여기에 가이드 페이지 Nav달아주세요*/}
    </PageWrapper>
  );
}

const PageWrapper = styled.div`
  width: 390px;
  margin: 0 auto;
  background-color: #fff;
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  padding-bottom: 100px;
  box-sizing: border-box;
`;

const CardList = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  background-color: #fff;
  flex: 1;
`;

const PlaceholderText = styled.div`
  text-align: center;
  padding: 60px 0;
  color: #999;
  font-family: Pretendard;
  font-size: 14px;
`;