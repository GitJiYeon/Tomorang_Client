import { useEffect, useMemo, useState } from "react";
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
import { getPostDetail, getPosts } from "../api/tomorang";

const STATUS_OPTIONS = ["대기중", "확정됨", "완료됨", "취소/거절"];
const STATUS_LABEL = {
  PENDING: "대기중",
  CONFIRMED: "확정됨",
  COMPLETED: "완료됨",
  REJECTED: "취소/거절",
  CANCELED: "취소/거절",
  CANCELLED: "취소/거절",
};

const getReservationPostId = (reservation) =>
  reservation.postId ?? reservation.post_id ?? reservation.post?.postId ?? reservation.post?.post_id ?? reservation.post?.id;

const getReservationId = (reservation) =>
  reservation.reservationId ?? reservation.reservation_id ?? reservation.id;

export default function GuideReservationListPage() {
  const [selectedStatus, setSelectedStatus] = useState("확정됨");
  const [guidePostIds, setGuidePostIds] = useState(new Set());
  const [postMap, setPostMap] = useState({});
  const navigate = useNavigate();
  const { reservations, isLoading, errorMessage } = useReservations();
  const currentUserId = localStorage.getItem("userId");

  useEffect(() => {
    if (!currentUserId) return undefined;
    let alive = true;
    getPosts({ userId: currentUserId })
      .then((posts) => {
        if (!alive) return;
        setGuidePostIds(new Set(posts.map((post) => String(post.postId))));
        setPostMap((prev) => ({
          ...prev,
          ...Object.fromEntries(posts.map((post) => [String(post.postId), post])),
        }));
      })
      .catch(() => {
        if (alive) setGuidePostIds(new Set());
      });
    return () => {
      alive = false;
    };
  }, [currentUserId]);

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

  const guideReservations = useMemo(() => {
    return reservations
      .filter((reservation) => {
        const postId = getReservationPostId(reservation);
        return guidePostIds.size === 0 || guidePostIds.has(String(postId));
      })
      .filter((reservation) => (STATUS_LABEL[reservation.status] ?? reservation.status) === selectedStatus);
  }, [guidePostIds, reservations, selectedStatus]);

  return (
    <PageWrapper>
      <Header coment="예약" path="/guide" />
      <StatusFilter
        options={STATUS_OPTIONS}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
      />

      <CardList>
        {isLoading && <PlaceholderText>예약 목록을 불러오는 중입니다.</PlaceholderText>}
        {!isLoading && errorMessage && <PlaceholderText>{errorMessage}</PlaceholderText>}
        {!isLoading && !errorMessage && guideReservations.length > 0 ? (
          guideReservations.map((reservation) => {
            const postId = getReservationPostId(reservation);
            const post = reservation.post ?? postMap[String(postId)];
            if (!post) return null;

            return (
              <ReservationCard
                key={getReservationId(reservation)}
                post={post}
                date={reservation.date}
                time={reservation.time}
                dateIcon={DateIcon}
                clockIcon={Clocklogo}
                nextIcon={NextButton}
                onClick={() => navigate(`/reservation-status/${getReservationId(reservation)}`)}
              />
            );
          })
        ) : (
          !isLoading && !errorMessage && <PlaceholderText>예약 내역이 없습니다.</PlaceholderText>
        )}
      </CardList>

      <GuideBottomNav activeIndex={1} />
    </PageWrapper>
  );
}

const PageWrapper = styled.div`
  width: min(390px, 100vw);
  height: 100dvh;
  max-height: 100dvh;
  margin: 0 auto;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  background: #fff;
  overflow: hidden;
`;

const CardList = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 18px;
  padding: 20px;
  padding-bottom: calc(100px + env(safe-area-inset-bottom));
  background: #fff;
  min-height: 0;
  overflow-y: auto;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const PlaceholderText = styled.div`
  padding: 60px 0;
  color: #999;
  text-align: center;
  font-family: Pretendard, sans-serif;
  font-size: 14px;
`;
