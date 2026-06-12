import { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import DateIcon from "../assets/reservation/DateIcon.svg";
import Clocklogo from "../assets/reservation/Clocklogo.svg";
import NextButton from "../assets/graynextlogo.svg";
import Header from "../components/Header";
import StatusFilter from "../components/reservation/StatusFilter";
import ReservationCard from "../components/reservation/ReservationCard";
import BottomNav from "../components/mainComponents/BottomNav";
import { useReservations } from "../components/context/ReservationContext";
import { getPostDetail, getPostReviews } from "../api/tomorang";
import { applyReviewCompletion, getReservationStatusLabel } from "../utils/reservationFlow";

const STATUS_OPTIONS = ["대기중", "확정됨", "완료됨", "취소/거절"];

const getReservationPostId = (reservation) =>
  reservation.postId ?? reservation.post_id ?? reservation.post?.postId ?? reservation.post?.post_id ?? reservation.post?.id;

const getReservationId = (reservation) =>
  reservation.reservationId ?? reservation.reservation_id ?? reservation.id;

export default function ReservationListPage() {
  const [selectedStatus, setSelectedStatus] = useState("대기중");
  const [postMap, setPostMap] = useState({});
  const [reviewMap, setReviewMap] = useState({});
  const navigate = useNavigate();
  const { reservations, isLoading, errorMessage } = useReservations();

  useEffect(() => {
    let alive = true;
    const missingPostIds = [
      ...new Set(
        reservations
          .map(getReservationPostId)
          .filter((postId) => postId && !postMap[String(postId)])
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
  }, [postMap, reservations]);

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

  const filtered = useMemo(
    () =>
      reservations
        .map((reservation) => {
          const postId = getReservationPostId(reservation);
          return applyReviewCompletion(reservation, reviewMap[String(postId)] ?? []);
        })
        .filter((reservation) => {
          const statusLabel = getReservationStatusLabel(reservation);
          if (selectedStatus === "취소/거절") {
            return statusLabel === "거절됨" || statusLabel === "취소됨";
          }
          return statusLabel === selectedStatus;
        }),
    [reservations, reviewMap, selectedStatus]
  );

  return (
    <PageWrapper>
      <Header coment="예약" />
      <StatusFilter
        options={STATUS_OPTIONS}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
      />
      <CardList>
        {isLoading && <PlaceholderText>예약 목록을 불러오는 중입니다.</PlaceholderText>}
        {!isLoading && errorMessage && <PlaceholderText>{errorMessage}</PlaceholderText>}
        {!isLoading && !errorMessage && filtered.length > 0 ? (
          filtered.map((reservation) => {
            const postId = getReservationPostId(reservation);
            const post = reservation.post ?? postMap[String(postId)];
            if (!post) return null;
            return (
              <ReservationCard
                key={getReservationId(reservation)}
                post={post}
                date={reservation.date}
                time={reservation.time}
                statusBadge={selectedStatus === "취소/거절" ? "취소/거절" : ""}
                dateIcon={DateIcon}
                clockIcon={Clocklogo}
                nextIcon={NextButton}
                onClick={() =>
                  navigate(`/reservation-status/${getReservationId(reservation)}`, {
                    state: { reservation, post },
                  })
                }
              />
            );
          })
        ) : (
          !isLoading && !errorMessage && <PlaceholderText>예약 내역이 없습니다.</PlaceholderText>
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
  font-family: Pretendard, sans-serif;
  font-size: 14px;
`;
