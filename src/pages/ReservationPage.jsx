/**
 * ReservationPage - 예약하기 페이지
 *
 * 사용법:
 * <Route path="/reservation/:postId" element={<ReservationPage />} />
 *
 * 또는 navigate로 이동 시:
 * navigate(`/reservation/${post.postId}`, { state: { post } })
 */

import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import postData from "../data/postData.json";
import styled from "styled-components";
import CounterInput from "../components/bookComponents/CounterInput";
import WarningBanner from "../components/WarningBanner";
import Header from "../components/Header";

const DAYS = ["일", "월", "화", "수", "목", "금", "토"];

export default function ReservationPage() {
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(1);
  const [request, setRequest] = useState("");

  const { postId } = useParams();
  const post = postData.find((p) => p.postId === Number(postId));
  const navigate = useNavigate();
  if (!post) return <div>포스트를 찾을 수 없습니다.</div>;

  const rawPrice = parseInt(post.price.replace(/,/g, ""), 10);
  const discountedPrice = post.discountRate
    ? Math.round(rawPrice * (1 - post.discountRate / 100))
    : null;

  // 선택된 날짜의 timeSlots
  const currentSlots = selectedDate
    ? post.availableSchedules.find((s) => s.date === selectedDate)?.timeSlots || []
    : [];

  return (
    <Wrapper>
      <Header coment="예약하기" />

      <Content>
        {/* ── 상단 게시물 카드 ── */}
        <PostCard>
          <PostImage
            src={post.images?.[0]}
            alt={post.title}
            onError={(e) => { e.target.style.background = "#ddd"; e.target.removeAttribute("src"); }}
          />
          <PostInfo>
            <PostTitle>{post.title}</PostTitle>
            <PostSubtitle>{post.subtitle}</PostSubtitle>
            <PriceArea>
              {post.discountRate > 0 && (
                <OriginalPrice>{rawPrice.toLocaleString()}원</OriginalPrice>
              )}
              <PriceRow>
                {post.discountRate > 0 && <SaleLabel>SALE</SaleLabel>}
                <FinalPrice>{(discountedPrice ?? rawPrice).toLocaleString()}원</FinalPrice>
              </PriceRow>
            </PriceArea>
          </PostInfo>
        </PostCard>


        {/* ── 안내 문구 ── */}
        <GuideArea>
          <GuideTitle>투어를 시작할{"\n"}날짜와 시간을 선택해주세요</GuideTitle>
          <GuideDesc>예약 창에서 예약 내용을 확인해 볼 수 있어요</GuideDesc>
        </GuideArea>

        <Gap1/>

        {/* ── 날짜 선택 ── */}
        <Section>
          <SectionLabel>날짜 선택</SectionLabel>
          <DateRow>
            {post.availableSchedules.map((schedule) => {
              const dateObj = new Date(schedule.date);
              const day = dateObj.getDate();
              const dow = DAYS[dateObj.getDay()];
              const isSelected = selectedDate === schedule.date;
              return (
                <DateCard
                  key={schedule.date}
                  $selected={isSelected}
                  onClick={() => {
                    setSelectedDate(schedule.date);
                    setSelectedSlot(null);
                  }}
                >
                  <DateNum $selected={isSelected}>{day}일</DateNum>
                  <DateDow $selected={isSelected}>{dow}요일</DateDow>
                </DateCard>
              );
            })}
          </DateRow>
        </Section>

        <Gap/>

        {/* ── 시간 선택 ── */}
        <Section>
          <SectionLabel>시간 선택</SectionLabel>
          <TimeGrid>
            {currentSlots.length === 0 ? (
              <EmptySlot>날짜를 먼저 선택해주세요</EmptySlot>
            ) : (
              currentSlots.map((slot, idx) => {
                const isSelected = selectedSlot?.id === slot.id;
                const isClosed = slot.status === "CLOSED";
                return (
                  <TimeCard
                    key={slot.id}
                    $selected={isSelected}
                    $closed={isClosed}
                    onClick={() => !isClosed && setSelectedSlot(slot)}
                  >
                    <TimeText $selected={isSelected} $closed={isClosed}>{slot.time}</TimeText>
                    <TimeSession $selected={isSelected} $closed={isClosed}>{idx + 1}회차</TimeSession>
                  </TimeCard>
                );
              })
            )}
          </TimeGrid>
        </Section>

        <Gap/>

        {/* ── 인원 선택 ── */}
        <Section>
          <SectionLabel>인원 선택</SectionLabel>
          <CounterInput
            label="성인"
            description="만 13세 이상"
            value={adults}
            onChange={setAdults}
            min={1}
            max={post.maxParticipants}
          />
          <CounterInput
            label="어린이"
            description="만 13세 미만"
            value={children}
            onChange={setChildren}
            min={0}
            max={post.maxParticipants}
          />
        </Section>

        <Gap/>

        {/* ── 요청 사항 ── */}
        <Section>
          <SectionLabel>요청 사항</SectionLabel>
          <RequestInput
            placeholder="세일러문 굿즈 위주로 보고 싶..."
            value={request}
            onChange={(e) => setRequest(e.target.value)}
            maxLength={200}
          />
        </Section>

        {/* ── 경고 배너 ── */}
        <WarningBanner message="결제는 만남 후 현장에서 가이드와 직접 진행됩니다." />

        {/* ── 예약하기 버튼 ── */}
        <ReserveBtn
          disabled={!selectedDate || !selectedSlot}
          onClick={() => {
            navigate('/reservation-status/1');
            // TODO: 예약 API 연결
            console.log({ post, selectedDate, selectedSlot, adults, children, request });
          }}
        >
          예약하기
        </ReserveBtn>
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
  padding: 0 21px 21px;
  display: flex;
  flex-direction: column;
  gap: 0;
`;

/* 상단 카드 */
const PostCard = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  height: 152px;
  border-bottom: solid 1px #F3F4F3;
  padding-top:3px;
  padding-bottom:3px;
  margin-bottom: 21px;
  
`;

const PostImage = styled.img`
  width: 120px;
  height: 120px;
  border-radius: 12px;
  object-fit: cover;
  flex-shrink: 0;
  background: #eee;
`;

const PostInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 16px;
  width: 217px;
`;

const PostTitle = styled.div`
  font-weight: 600;
  font-size: 16px;
  line-height: 22px;
  color: #111;
  align-self: stretch;
`;

const PostSubtitle = styled.div`
  font-weight: 400;
  font-size: 12px;
  line-height: 22px;
  color: #4E4E4E;
  align-self: stretch;
  margin-top: -12px;
`;

const PriceArea = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const OriginalPrice = styled.div`
  font-weight: 400;
  font-size: 10px;
  letter-spacing: -0.01px;
  color: #DADADA;
  text-decoration: line-through;
`;

const PriceRow = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const SaleLabel = styled.span`
  font-weight: 700;
  font-size: 18px;
  letter-spacing: -0.018px;
  color: #B1DD89;
  width: 47px;
`;

const FinalPrice = styled.span`
  font-weight: 700;
  font-size: 18px;
  letter-spacing: -0.018px;
  color: #111;
`;

const Gap = styled.div`
  width: 100%;
  height: 26px;
`;
const Gap1 = styled.div`
  width: 100%;
  height: 33px;
`;

/* 안내 */
const GuideArea = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const GuideTitle = styled.div`
  font-weight: 700;
  font-size: 21px;
  line-height: 29px;
  letter-spacing: -0.735px;
  color: #111;
  white-space: pre-line;
`;

const GuideDesc = styled.div`
  font-weight: 400;
  font-size: 14px;
  letter-spacing: -0.49px;
  color: #ACACAC;
`;

const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const SectionLabel = styled.div`
  font-weight: 600;
  font-size: 16px;
  color: #111;
  letter-spacing: -0.49px;
`;

/* 날짜 */
const DateRow = styled.div`
  display: flex;
  gap: 8px;
  overflow-x: auto;
  scrollbar-width: none;
  padding-bottom: 4px;
`;

const DateCard = styled.div`
  width: 86px;
  height: 100px;
  border-radius: 12px;
  border: 1px solid ${({ $selected }) => ($selected ? "#B1DD89" : "#DADADA")};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  flex-shrink: 0;
  cursor: pointer;
  padding: 12px 8px;
  box-sizing: border-box;
`;

const DateNum = styled.div`
  font-weight: 500;
  font-size: 14px;
  letter-spacing: -0.49px;
  color: ${({ $selected }) => ($selected ? "#94B872" : "#111")};
  text-align: center;
`;

const DateDow = styled.div`
  font-weight: 400;
  font-size: 10px;
  letter-spacing: -0.35px;
  color: ${({ $selected }) => ($selected ? "#94B872" : "#ACACAC")};
  text-align: center;
`;

/* 시간 */
const TimeGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const TimeCard = styled.div`
  width: 108px;
  height: 72px;
  border-radius: 12px;
  border: 1px solid ${({ $selected, $closed }) =>
    $closed ? "#DADADA" : $selected ? "#B1DD89" : "#DADADA"};
  background: ${({ $closed }) => ($closed ? "#F3F4F3" : "#FFF")};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  cursor: ${({ $closed }) => ($closed ? "default" : "pointer")};
`;

const TimeText = styled.div`
  font-weight: 500;
  font-size: 14px;
  letter-spacing: -0.49px;
  color: ${({ $selected, $closed }) =>
    $closed ? "#ACACAC" : $selected ? "#94B872" : "#111"};
  text-align: center;
`;

const TimeSession = styled.div`
  font-weight: 400;
  font-size: 10px;
  letter-spacing: -0.35px;
  color: ${({ $selected, $closed }) =>
    $closed ? "#ACACAC" : $selected ? "#94B872" : "#ACACAC"};
  text-align: center;
`;

const EmptySlot = styled.div`
  font-size: 13px;
  color: #ACACAC;
  padding: 12px 0;
`;


/* 요청사항 */
const RequestInput = styled.textarea`
  width: 347px;
  height: 110px;
  border-radius: 12px;
  border: 1px solid #DADADA;
  background: #fff;
  padding: 12px 14px;
  box-sizing: border-box;
  margin-bottom: 16px;
  resize: none;
  font-family: "Pretendard", sans-serif;
  font-weight: 400;
  font-size: 14px;
  color: #111;
  outline: none;
  &::placeholder { color: #ACACAC; }
`;

/* 예약 버튼 */
const ReserveBtn = styled.button`
  width: 100%;
  height: 52px;
  border-radius: 12px;
  background: ${({ disabled }) => (disabled ? "#EDFCDF" : "#C5F598")};
  border: none;
  cursor: ${({ disabled }) => (disabled ? "default" : "pointer")};
  font-family: "Pretendard", sans-serif;
  text-align: center;
  font-size: 14px;
  font-style: normal;
  font-weight: 500;
  line-height: normal;
  color: ${({ disabled }) => (disabled ? "#fff" : "#111")};
  margin-top: 18px;
  transition: background 0.2s;
`;