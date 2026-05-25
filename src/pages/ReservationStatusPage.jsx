/**
 * ReservationStatusPage - 예약 현황 페이지
 * status: PENDING | CONFIRMED | REJECTED | COMPLETED
 */

import { useParams, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { useReservations } from "../components/context/ReservationContext";
import postData from "../data/postData.json";
import StatusHeader from "../components/statusComponents/StatusHeader";
import MeetingPointCard from "../components/statusComponents/MeetingPointCard";
import MyReviewCard from "../components/statusComponents/MyReviewCard";
import Header from "../components/Header";
import ChatIcon from "../assets/navIcons/message.svg";
import ChatIcon2 from "../assets/navIcons/messageBlack.svg";

export default function ReservationStatusPage() {
  const { reservationId } = useParams();
  const navigate = useNavigate();
  const { reservations } = useReservations();

  const reservation = reservations.find((r) => r.reservationId === Number(reservationId));
  const post = reservation ? postData.find((p) => p.postId === reservation.postId) : null;

  if (!reservation || !post)
    return <Wrapper><div style={{ padding: 40, color: "#ACACAC" }}>예약 정보를 찾을 수 없습니다.</div></Wrapper>;

  const {
    status, date, time, adults, children, request,
    meetingPoint, meetingPointAddress, meetingPointLat, meetingPointLng,
    myReview,
  } = reservation;

  const isConfirmedOrCompleted = status === "CONFIRMED" || status === "COMPLETED";

  const formatDate = (d) => {
    const obj = new Date(d);
    return `${obj.getFullYear()}년 ${obj.getMonth() + 1}월 ${obj.getDate()}일`;
  };

  return (
    <Wrapper>
      <Header coment="예약 현황" path={'/main'}/>
      <Content>

        {/* 상태 헤더 */}
        <StatusHeader status={status} path={'/main'} />

        {/* 만남 장소 */}
        <Section>
          <MeetingPointCard
            locked={!isConfirmedOrCompleted}
            address={meetingPointAddress}
            meetingPoint={meetingPoint}
            lat={meetingPointLat}
            lng={meetingPointLng}
          />
        </Section>

        {/* 예약 신청 정보 */}
        <Section>
          <InfoCard>
            <InfoTitle>예약신청 정보</InfoTitle>
            <InfoRow>
              <InfoLabel>날짜</InfoLabel>
              <InfoValue>{formatDate(date)}</InfoValue>
            </InfoRow>
            <InfoRow>
              <InfoLabel>시간</InfoLabel>
              <InfoValue>{time}</InfoValue>
            </InfoRow>
            <InfoRow>
              <InfoLabel>인원 수</InfoLabel>
              <InfoValue>어른 {adults}명 / 어린이 {children}명</InfoValue>
            </InfoRow>
          </InfoCard>
        </Section>

        {/* 요청사항 */}
        <Section>
          <RequestCard>
            <InfoTitle>요청사항</InfoTitle>
            <RequestText>{request}</RequestText>
          </RequestCard>
        </Section>

        {/* 나의 후기 (COMPLETED + 작성된 경우) */}
        {status === "COMPLETED" && myReview && (
          <Section>
            <InfoTitle>나의 후기</InfoTitle>
            <MyReviewCard review={myReview} time={time} />
          </Section>
        )}

        {/* 하단 버튼 */}
        {status === "PENDING" && (
          <ActionBtn $disabled>
            <img src={ChatIcon} alt="chat" width={21} height={20}/>
            채팅하기
          </ActionBtn>
        )}
        {status === "CONFIRMED" && (
          <>
            <ActionBtn onClick={() => navigate(`/review-write/${reservationId}`)}>
              투어 완료하기
            </ActionBtn>
            <ChatBtn onClick={()=>navigate('/chat/1')}>
              <img src={ChatIcon2} alt="chat" width={19} height={15} />
              채팅하기
            </ChatBtn>
          </>
        )}
        {status === "REJECTED" && (
          <ActionBtn onClick={() => navigate("/main")}>다른 코스 찾아보기</ActionBtn>
        )}
        {status === "COMPLETED" && !myReview && (
          <ActionBtn onClick={() => navigate(`/review-write/${4}`)}>
            후기 등록하기
          </ActionBtn>
        )}

      </Content>
    </Wrapper>
  );
}

/* ─── Styled Components ─── */

const Wrapper = styled.div`
  max-width: 390px;
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
  width: 348px;
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
  width: 348px;
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

/* 버튼 */
const ActionBtn = styled.button`
  width: 348px;
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

const ChatBtn = styled.button`
  width: 348px;
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