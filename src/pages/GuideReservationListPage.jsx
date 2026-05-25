import { useMemo, useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import DateIcon from "../assets/reservation/DateIcon.svg";
import Clocklogo from "../assets/reservation/Clocklogo.svg";
import NextButton from "../assets/graynextlogo.svg";
import Header from "../components/Header";
import GuideBottomNav from "../components/mainComponents/GuideBottomNav";
import StatusFilter from "../components/reservation/StatusFilter";
import ReservationCard from "../components/reservation/ReservationCard";
import { useReservations } from "../components/context/ReservationContext";
import guideData from "../data/guideData.json";
import postData from "../data/postData.json";

const STATUS_LABEL = {
  PENDING: "대기중",
  CONFIRMED: "확정됨",
  COMPLETED: "완료됨",
  REJECTED: "취소/거절",
  CANCELED: "취소/거절",
};

export default function GuideReservationListPage() {
  const [selectedStatus, setSelectedStatus] = useState("확정됨");
  const navigate = useNavigate();
  const { reservations } = useReservations();
  const currentUserKey = localStorage.getItem("userId") || "1";
  const currentGuide =
    guideData.find((guide) => String(guide.id) === String(currentUserKey)) ||
    guideData.find((guide) => guide.username === currentUserKey) ||
    guideData[0];

  const guideReservations = useMemo(() => {
    const guidePostIds = new Set(currentGuide.postIds);

    return reservations
      .filter((reservation) => guidePostIds.has(reservation.postId))
      .filter((reservation) => STATUS_LABEL[reservation.status] === selectedStatus);
  }, [currentGuide, reservations, selectedStatus]);

  return (
    <PageWrapper>
      <Header coment="예약" path="/guide" />
      <StatusFilter
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
      />

      <CardList>
        {guideReservations.length > 0 ? (
          guideReservations.map((reservation) => {
            const post = postData.find((p) => p.postId === reservation.postId);
            if (!post) return null;

            return (
              <ReservationCard
                key={reservation.reservationId}
                post={post}
                date={reservation.date}
                time={reservation.time}
                dateIcon={DateIcon}
                clockIcon={Clocklogo}
                nextIcon={NextButton}
                onClick={() => navigate(`/reservation-status/${reservation.reservationId}`)}
              />
            );
          })
        ) : (
          <PlaceholderText>예약 내역이 없습니다.</PlaceholderText>
        )}
      </CardList>

      <GuideBottomNav activeIndex={1} />
    </PageWrapper>
  );
}

const PageWrapper = styled.div`
  width: 390px;
  min-height: 100dvh;
  margin: 0 auto;
  padding-bottom: 100px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  background: #fff;
`;

const CardList = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 18px;
  padding: 20px;
  background: #fff;
`;

const PlaceholderText = styled.div`
  padding: 60px 0;
  color: #999;
  text-align: center;
  font-family: Pretendard, sans-serif;
  font-size: 14px;
`;
