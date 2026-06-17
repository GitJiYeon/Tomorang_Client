/**
 * ReservationStatusPage - 예약 현황 페이지
 * status: PENDING | CONFIRMED | REJECTED | COMPLETED
 */

import { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { useReservations } from "../components/context/ReservationContext";
import { acceptReservation, createOrGetChatRoom, getPostDetail, rejectReservation } from "../api/tomorang";
import { isOwnPost } from "../utils/postOwner";
import { getRequesterId, STATUS } from "../utils/reservationFlow";
import StatusHeader from "../components/statusComponents/StatusHeader";
import MeetingPointCard from "../components/statusComponents/MeetingPointCard";
import MyReviewCard from "../components/statusComponents/MyReviewCard";
import Header from "../components/Header";
import ChatIcon from "../assets/navIcons/message.svg";
import ChatIcon2 from "../assets/navIcons/messageBlack.svg";
import { useI18n } from "../i18n/I18nProvider";

const firstText = (...values) =>
  values.find((value) => typeof value === "string" && value.trim())?.trim() ?? "";

const extractMeetingAddressFromBlocks = (post) => {
  const textBlocks = [
    ...(Array.isArray(post?.contentBlocks) ? post.contentBlocks : []),
    ...(Array.isArray(post?.content_blocks) ? post.content_blocks : []),
  ]
    .map((block) => (typeof block === "string" ? block : block?.value ?? block?.content ?? block?.text ?? ""))
    .filter(Boolean);

  const meetingText = textBlocks
    .join("\n")
    .match(/만남\s*장소\s*\n+(.+)/)?.[1];

  return meetingText?.trim() ?? "";
};

export default function ReservationStatusPage() {
  const { reservationId } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();
  const { language, t } = useI18n();
  const { reservations, isLoading, upsertReservation } = useReservations();
  const savedState = (() => {
    try {
      return JSON.parse(sessionStorage.getItem(`reservationStatus:${reservationId}`) || "null");
    } catch {
      return null;
    }
  })();
  const initialReservation = state?.reservation ?? savedState?.reservation ?? null;
  const [post, setPost] = useState(() => state?.post ?? initialReservation?.post ?? savedState?.post ?? null);
  const [localStatus, setLocalStatus] = useState(null);
  const [actionError, setActionError] = useState("");
  const [isActionBusy, setIsActionBusy] = useState(false);

  const normalizeReservationView = (source) =>
    source
      ? {
          ...source,
          reservationId: source.reservationId ?? source.reservation_id ?? source.id ?? reservationId,
          postId:
            source.postId ??
            source.post_id ??
            source.post?.postId ??
            source.post?.post_id ??
            source.post?.id,
          date: source.date ?? source.slotDate ?? source.slot_date,
          time: source.time ?? source.slotTime ?? source.slot_time,
          adults: source.adults ?? source.adultCount ?? source.adult_count ?? 1,
          children: source.children ?? source.childCount ?? source.child_count ?? 0,
          request: source.request ?? source.memo ?? source.message ?? "",
          status: source.status ?? STATUS.PENDING,
        }
      : null;

  const contextReservation = reservations.find((r) => String(r.reservationId) === String(reservationId));
  const normalizedContextReservation = normalizeReservationView(contextReservation);
  const normalizedInitialReservation = normalizeReservationView(initialReservation);
  const reservation = normalizedContextReservation
    ? {
        ...normalizedContextReservation,
        ...(normalizedInitialReservation &&
        String(normalizedInitialReservation.reservationId) === String(normalizedContextReservation.reservationId)
          ? normalizedInitialReservation
          : {}),
      }
    : normalizedInitialReservation;

  useEffect(() => {
    if (!reservation) return undefined;
    if (reservation.post) {
      setPost(reservation.post);
      return undefined;
    }

    let alive = true;
    getPostDetail(reservation.postId)
      .then((post) => {
        if (alive) setPost(post);
      })
      .catch(() => {
        if (alive) setPost(null);
      });

    return () => {
      alive = false;
    };
  }, [reservation]);

  if (!reservation || !post)
    return (
      <Wrapper>
        <div style={{ padding: 40, color: "#ACACAC" }}>
          {isLoading ? t("예약 정보를 불러오는 중입니다.") : t("예약 정보를 찾을 수 없습니다.")}
        </div>
      </Wrapper>
    );

  const {
    status: reservationStatus, date, time, adults, children, request,
    meetingPoint, meetingPointAddress, meetingPointLat, meetingPointLng,
    myReview,
  } = reservation;
  const status = localStatus ?? reservationStatus ?? STATUS.PENDING;
  const isGuideView = isOwnPost(post);
  const requesterId = getRequesterId(reservation);
  const chatOtherUserId = isGuideView ? requesterId : post.userId ?? post.user_id;
  const chatRoomId = reservation.chatRoomId ?? reservation.chat_room_id;

  const handleStatusChange = async (nextStatus) => {
    if (isActionBusy) return;
    setIsActionBusy(true);
    setActionError("");

    try {
      const updatedReservation =
        nextStatus === STATUS.CONFIRMED
          ? await acceptReservation(reservationId)
          : await rejectReservation(reservationId);
      const normalizedReservation = upsertReservation({
        ...reservation,
        ...updatedReservation,
        status: updatedReservation.status ?? nextStatus,
      });

      setLocalStatus(normalizedReservation.status);
      sessionStorage.setItem(
        `reservationStatus:${reservationId}`,
        JSON.stringify({ reservation: normalizedReservation, post })
      );

      if (normalizedReservation.status === STATUS.CONFIRMED && requesterId && !normalizedReservation.chatRoomId) {
        createOrGetChatRoom(localStorage.getItem("userId"), requesterId)
          .then((room) => {
            const nextRoomId = room.roomId ?? room.id;
            if (!nextRoomId) return;
            upsertReservation({ ...normalizedReservation, chatRoomId: nextRoomId });
          })
          .catch(() => {});
      }
    } catch (error) {
      setActionError(error.message || t("예약 상태 변경에 실패했습니다."));
    } finally {
      setIsActionBusy(false);
    }
  };

  const isConfirmedOrCompleted = status === "CONFIRMED" || status === "COMPLETED";
  const resolvedMeetingAddress = firstText(
    meetingPointAddress,
    reservation.meeting_point_address,
    reservation.meetingAddress,
    reservation.meeting_address,
    reservation.address,
    post.meetingPointAddress,
    post.meeting_point_address,
    post.meetingAddress,
    post.meeting_address,
    extractMeetingAddressFromBlocks(post)
  );
  const resolvedMeetingPoint = firstText(
    meetingPoint,
    reservation.meeting_point,
    reservation.placeName,
    reservation.place_name,
    post.meetingPoint,
    post.meeting_point,
    post.meetingPlace?.label,
    post.meeting_place?.label,
    resolvedMeetingAddress,
    post.cityName,
    post.city_name
  );
  const meetingLat = Number(
    meetingPointLat ??
      reservation.meeting_point_lat ??
      reservation.lat ??
      reservation.latitude ??
      post.meetingPointLat ??
      post.meeting_point_lat ??
      post.lat ??
      post.latitude
  );
  const meetingLng = Number(
    meetingPointLng ??
      reservation.meeting_point_lng ??
      reservation.lng ??
      reservation.longitude ??
      post.meetingPointLng ??
      post.meeting_point_lng ??
      post.lng ??
      post.longitude
  );
  const hasMeetingPoint = Number.isFinite(meetingLat) && Number.isFinite(meetingLng);

  const openPostReview = () => {
    if (!post) return;
    sessionStorage.setItem("currentCoursePost", JSON.stringify(post));
    navigate("/course", {
      state: {
        post,
        initialTab: "review",
        initialReviews: myReview ? [myReview] : undefined,
      },
    });
  };

  const formatDate = (d) => {
    const obj = new Date(d);
    return language === "ja"
      ? `${obj.getFullYear()}年 ${obj.getMonth() + 1}月 ${obj.getDate()}日`
      : `${obj.getFullYear()}년 ${obj.getMonth() + 1}월 ${obj.getDate()}일`;
  };

  return (
    <Wrapper>
      <Header coment={t("예약 현황")} path={isGuideView ? "/guide-reservations" : "/main"}/>
      <Content>

        {/* 상태 헤더 */}
        <StatusHeader status={status} isGuideView={isGuideView} path={'/main'} />

        {/* 만남 장소 */}
        <Section>
          <MeetingPointCard
            locked={!isConfirmedOrCompleted || !hasMeetingPoint}
            address={resolvedMeetingAddress}
            meetingPoint={resolvedMeetingPoint}
            lat={meetingLat}
            lng={meetingLng}
          />
        </Section>

        {/* 예약 신청 정보 */}
        <Section>
          <InfoCard>
            <InfoTitle>{t("예약신청 정보")}</InfoTitle>
            <InfoRow>
              <InfoLabel>{t("날짜")}</InfoLabel>
              <InfoValue>{formatDate(date)}</InfoValue>
            </InfoRow>
            <InfoRow>
              <InfoLabel>{t("시간")}</InfoLabel>
              <InfoValue>{time}</InfoValue>
            </InfoRow>
            <InfoRow>
              <InfoLabel>{t("인원 수")}</InfoLabel>
              <InfoValue>{t("어른")} {adults}{t("명")} / {t("어린이")} {children}{t("명")}</InfoValue>
            </InfoRow>
          </InfoCard>
        </Section>

        {/* 요청사항 */}
        <Section>
          <RequestCard>
            <InfoTitle>{t("요청사항")}</InfoTitle>
            <RequestText>{request}</RequestText>
          </RequestCard>
        </Section>

        {/* 후기 (COMPLETED + 작성된 경우) */}
        {status === "COMPLETED" && myReview && (
          <Section>
            <InfoTitle>{isGuideView ? t("발견자의 후기") : t("나의 후기")}</InfoTitle>
            <MyReviewCard review={myReview} time={time} onClick={openPostReview} />
          </Section>
        )}
        {actionError && <ErrorText>{actionError}</ErrorText>}

        {/* 하단 버튼 */}
        {status === "PENDING" && isGuideView && (
          <ButtonRow>
            <RejectBtn type="button" disabled={isActionBusy} onClick={() => handleStatusChange(STATUS.REJECTED)}>
              {isActionBusy ? t("처리중...") : t("거절하기")}
            </RejectBtn>
            <AcceptBtn type="button" disabled={isActionBusy} onClick={() => handleStatusChange(STATUS.CONFIRMED)}>
              {isActionBusy ? t("처리중...") : t("수락하기")}
            </AcceptBtn>
          </ButtonRow>
        )}
        {status === "PENDING" && !isGuideView && (
          <ActionBtn $disabled>
            <img src={ChatIcon} alt="chat" width={21} height={20}/>
            {t("채팅하기")}
          </ActionBtn>
        )}
        {status === "CONFIRMED" && (
          <>
            {!isGuideView && (
              <ActionBtn onClick={() => navigate(`/review-write/${reservationId}`)}>
                {t("투어 완료하기")}
              </ActionBtn>
            )}
            <ChatBtn
              onClick={() =>
                navigate(`/chat/${chatRoomId ?? post.postId}`, {
                  state: { post, roomId: chatRoomId, otherUserId: chatOtherUserId },
                })
              }
            >
              <img src={ChatIcon2} alt="chat" width={19} height={15} />
              {t("채팅하기")}
            </ChatBtn>
          </>
        )}
        {status === "REJECTED" && !isGuideView && (
          <ActionBtn onClick={() => navigate("/main")}>{t("다른 코스 찾아보기")}</ActionBtn>
        )}
        {status === "COMPLETED" && !myReview && !isGuideView && (
          <ActionBtn onClick={() => navigate(`/review-write/${reservationId}`)}>
            {t("후기 등록하기")}
          </ActionBtn>
        )}

      </Content>
    </Wrapper>
  );
}

/* ─── Styled Components ─── */

const Wrapper = styled.div`
  max-width: var(--app-page-width);
  margin: 0 auto;
  min-height: 100vh;
  background: #fff;
  font-family: "Pretendard", sans-serif;
`;

const Content = styled.div`
  padding: 16px 21px 18px;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

/* Divider 제거, Section 간격으로 대체 */
const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const InfoCard = styled.div`
  width: var(--app-content-width);
  border-radius: 12px;
  border: 1px solid #DADADA;
  background: #FFF;
  padding: 26px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const InfoTitle = styled.div`
  font-family: "Pretendard", sans-serif;
  font-weight: 700;
  font-size: 16px;
  letter-spacing: -0.016px;
  color: #4E4E4E;
`;

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const InfoLabel = styled.div`
  font-family: "Pretendard", sans-serif;
  font-weight: 500;
  font-size: 14px;
  letter-spacing: -0.49px;
  color: #4E4E4E;
`;

const InfoValue = styled.div`
  font-family: "Pretendard", sans-serif;
  font-weight: 600;
  font-size: 14px;
  letter-spacing: -0.49px;
  color: #111;
  text-align: right;
`;

const RequestCard = styled.div`
  width: var(--app-content-width);
  height: 133px;
  border-radius: 12px;
  border: 1px solid #DADADA;
  background: #FFF;
  padding: 28px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const RequestText = styled.div`
  width:260px;
  font-family: "Pretendard", sans-serif;
  font-size: 14px;
  font-weight: 500;
  line-height: 21px;
  letter-spacing: -0.07px;
  color: #4E4E4E;
`;

const ErrorText = styled.p`
  width: var(--app-content-width);
  margin: 0 auto;
  color: #d93025;
  font-size: 13px;
  font-weight: 500;
`;

/* 버튼 */
const ActionBtn = styled.button`
  width: var(--app-content-width);
  height: 56px;
  border-radius: 12px;
  background: ${({ $disabled }) => ($disabled ? "#EDFCDF" : "#C5F598")};
  border: none;
  cursor: ${({ $disabled }) => ($disabled ? "default" : "pointer")};
  font-family: "Pretendard", sans-serif;
  color: ${({ $disabled }) => ($disabled ? "#fff" : "#111")};
  margin-top: 4px;
  text-align: center;
  font-size: 14px;
  font-style: normal;
  font-weight: 500;
  display: flex;
  line-height: normal;
  align-items: center;
  justify-content: center;
  gap: 10px;
  align-self: center;
`;

const ButtonRow = styled.div`
  width: var(--app-content-width);
  display: flex;
  gap: 12px;
  align-self: center;
`;

const AcceptBtn = styled.button`
  flex: 1;
  height: 56px;
  border-radius: 12px;
  background: #C5F598;
  border: none;
  cursor: pointer;
  font-family: "Pretendard", sans-serif;
  color: #111;
  text-align: center;
  font-size: 14px;
  font-weight: 500;
  &:disabled {
    cursor: default;
    opacity: 0.7;
  }
`;

const RejectBtn = styled.button`
  width: 108px;
  height: 56px;
  border-radius: 12px;
  background: #DADADA;
  border: none;
  cursor: pointer;
  font-family: "Pretendard", sans-serif;
  color: #111;
  text-align: center;
  font-size: 14px;
  font-weight: 500;
  &:disabled {
    cursor: default;
    opacity: 0.7;
  }
`;

const ChatBtn = styled.button`
  width: var(--app-content-width);
  height: 56px;
  border-radius: 12px;
  background: #fff;
  border: 1.5px solid #111;
  cursor: pointer;
  font-family: "Pretendard", sans-serif;
  color: #111;
  text-align: center;
  font-size: 14px;
  font-style: normal;
  font-weight: 500;
  line-height: normal;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  align-self: center;
  margin-top:-3px;
`;
