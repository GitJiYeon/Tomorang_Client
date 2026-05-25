import React, { useState } from "react";
import styled from "styled-components";
import DateIcon from "../assets/reservation/DateIcon.svg";
import Clocklogo from "../assets/reservation/Clocklogo.svg";
import NextButton from "../assets/graynextlogo.svg";
import Header from "../components/Header";
import StatusFilter from "../components/reservation/StatusFilter";
import ReservationCard from "../components/reservation/ReservationCard";
import BottomNav from "../components/mainComponents/BottomNav";
import postData from "../data/postData.json";
import { useNavigate } from "react-router-dom";

const MOCK_RESERVATIONS = [
  { id: 1, postId: 7, date: "2026-02-21", time: "12:00-13:00", status: "확정됨" },
  { id: 2, postId: 2, date: "2026-02-21", time: "12:00-13:00", status: "확정됨" },
  { id: 3, postId: 1, date: "2026-04-03", time: "09:00-13:00", status: "대기중" },
  { id: 4, postId: 3, date: "2026-04-07", time: "09:00-14:00", status: "완료됨" },
  { id: 5, postId: 4, date: "2026-04-08", time: "12:00-15:00", status: "취소/거절" },
];

export default function ReservationListPage() {
  const [selectedStatus, setSelectedStatus] = useState("확정됨");
  const navigate = useNavigate();
  const filtered = MOCK_RESERVATIONS.filter((r) => r.status === selectedStatus);

  return (
    <PageWrapper>
      <Header coment="예약" />
      <StatusFilter
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
      />
      <CardList onClick={()=> navigate('/reservation-status/2')}>
        {filtered.length > 0 ? (
          filtered.map((reservation) => {
            const post = postData.find((p) => p.postId === reservation.postId);
            if (!post) return null;
            return (
              <ReservationCard
                key={reservation.id}
                post={post}
                date={reservation.date}
                time={reservation.time}
                dateIcon={DateIcon}
                clockIcon={Clocklogo}
                nextIcon={NextButton}
              />
            );
          })
        ) : (
          <PlaceholderText>예약 내역이 없습니다. 🥲</PlaceholderText>
        )}
      </CardList>
      <BottomNav activeIndex={2} />
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
  font-family: Pretendard;
  font-size: 14px;
`;
