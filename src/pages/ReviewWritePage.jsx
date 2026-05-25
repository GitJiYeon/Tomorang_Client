/**
 * ReviewWritePage - 리뷰 작성 전용 페이지
 *
 * 라우터:
 * <Route path="/review-write/:reservationId" element={<ReviewWritePage />} />
 *
 * 이동:
 * navigate(`/review-write/${reservationId}`)
 */

import { useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { useReservations } from "../components/context/ReservationContext";
import postData from "../data/postData.json";
import Header from "../components/Header";
import StarFillIcon from "../assets/bookStatusIcons/starFill.svg";
import StarEmptyIcon from "../assets/bookStatusIcons/starEmpty.svg";
import PlusIcon from "../assets/bookStatusIcons/plusIcon.svg";
import XSmallIcon from "../assets/bookStatusIcons/xSmall.svg";

const REVIEW_QUESTIONS = [
  {
    id: "tourQuality",
    label: "투어의 구성은 어떠셨나요?",
    options: ["빈약", "적당", "과다"],
  },
  {
    id: "guideAttitude",
    label: "안내자의 태도는 어떠셨나요?",
    options: ["최악", "보통", "최고"],
  },
  {
    id: "willReturn",
    label: "이 코스를 다시 이용하실 의향이 있으신가요?",
    options: ["아뇨", "글쎄요", "당연하죠"],
  },
];

export default function ReviewWritePage() {
  const { reservationId } = useParams();
  const navigate = useNavigate();
  const { reservations, completeAndSaveReview } = useReservations();

  const reservation = reservations.find((r) => r.reservationId === Number(reservationId));
  const post = reservation ? postData.find((p) => p.postId === reservation.postId) : null;

  const [reviewRating, setReviewRating] = useState(0);
  const [answers, setAnswers] = useState({});
  const [reviewText, setReviewText] = useState("");
  const [reviewImages, setReviewImages] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  if (!reservation || !post) {
    return (
      <Wrapper>
        <div style={{ padding: 40, color: "#ACACAC" }}>예약 정보를 찾을 수 없습니다.</div>
      </Wrapper>
    );
  }

  const handleImageAdd = (e) => {
    const files = Array.from(e.target.files);
    const previews = files.map((f) => URL.createObjectURL(f));
    setReviewImages((prev) => [...prev, ...previews].slice(0, 5));
  };

  const handleImageRemove = (idx) => {
    setReviewImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const canSubmit = reviewRating > 0;

  const handleSubmit = async () => {
    if (!canSubmit || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await completeAndSaveReview(Number(reservationId), {
        rating: reviewRating,
        answers,
        content: reviewText,
        images: reviewImages,
        createdAt: new Date().toISOString(),
      });
      // 제출 완료 → 예약현황 페이지로 이동 (이제 COMPLETED + myReview 있음)
      navigate(`/reservation-status/${7}`, { replace: true });
    } catch (err) {
      console.error("리뷰 등록 실패", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Wrapper>
      <Header coment="리뷰 작성" />

      <Content>
        {/* ── 게시물 썸네일 카드 ── */}
        <PostCard>
          <PostThumb
            src={post.thumbnail || post.images?.[0]}
            alt={post.title}
            onError={(e) => { e.target.style.background = "#eee"; e.target.removeAttribute("src"); }}
          />
          <PostInfo>
            <PostTitle>{post.title}</PostTitle>
            <PostDesc>{post.description}</PostDesc>
            <PriceRow>
              {post.originalPrice && (
                <OriginalPrice>{post.originalPrice?.toLocaleString()}원</OriginalPrice>
              )}
              <SalePrice>
                {post.originalPrice && <SaleLabel>SALE </SaleLabel>}
                {post.price?.toLocaleString()}원
              </SalePrice>
            </PriceRow>
          </PostInfo>
        </PostCard>

        <Divider />

        {/* ── 별점 ── */}
        <Section>
          <SectionTitle>투어는 어떠셨나요</SectionTitle>
          <StarRow>
            {[1, 2, 3, 4, 5].map((s) => (
              <StarBtn key={s} onClick={() => setReviewRating(s)}>
                <img
                  src={s <= reviewRating ? StarFillIcon : StarEmptyIcon}
                  alt="star"
                  width={44}
                  height={44}
                />
              </StarBtn>
            ))}
          </StarRow>
        </Section>

        <Divider />

        {/* ── 선택형 질문들 ── */}
        {REVIEW_QUESTIONS.map((q) => (
          <QuestionBlock key={q.id}>
            <QuestionLabel>{q.label}</QuestionLabel>
            <OptionTrack>
              {q.options.map((opt) => (
                <OptionItem
                  key={opt}
                  $selected={answers[q.id] === opt}
                  onClick={() =>
                    setAnswers((prev) => ({ ...prev, [q.id]: opt }))
                  }
                >
                  {opt}
                </OptionItem>
              ))}
            </OptionTrack>
          </QuestionBlock>
        ))}

        <Divider />

        {/* ── 이미지 추가 ── */}
        <Section>
          <QuestionLabel>사진을 첨부해주세요</QuestionLabel>
          <ImageRow>
            <AddImageBtn onClick={() => fileInputRef.current?.click()}>
              <img src={PlusIcon} alt="add" width={24} height={24} style={{ opacity: 0.35 }} />
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                style={{ display: "none" }}
                onChange={handleImageAdd}
              />
            </AddImageBtn>
            {reviewImages.map((src, idx) => (
              <ImageThumb key={idx}>
                <ThumbImg src={src} alt="preview" />
                <RemoveBtn onClick={() => handleImageRemove(idx)}>
                  <img src={XSmallIcon} alt="remove" width={7} height={7} />
                </RemoveBtn>
              </ImageThumb>
            ))}
          </ImageRow>
        </Section>

        <Divider />

        {/* ── 텍스트 후기 ── */}
        <Section>
          <QuestionLabel>가이드와 코스에 대한 솔직한 후기를 남겨주세요</QuestionLabel>
          <ReviewTextArea
            placeholder="세일러문 굿즈 위주로 보고 싶..."
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            maxLength={500}
          />
        </Section>

        {/* ── 등록 버튼 ── */}
        <SubmitBtn $disabled={!canSubmit || isSubmitting} onClick={handleSubmit}>
          {isSubmitting ? "등록 중..." : "후기 등록하기"}
        </SubmitBtn>
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
  padding: 16px 21px 20px;
  display: flex;
  flex-direction: column;
  gap: 0;
`;

const Divider = styled.div`
  width: 100%;
  height: 1px;
  background: #F3F4F3;
  margin: 20px 0;
`;

/* 게시물 카드 */
const PostCard = styled.div`
  display: flex;
  gap: 12px;
  align-items: flex-start;
`;

const PostThumb = styled.img`
  width: 80px;
  height: 80px;
  border-radius: 10px;
  object-fit: cover;
  background: #eee;
  flex-shrink: 0;
`;

const PostInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
`;

const PostTitle = styled.div`
  font-weight: 700;
  font-size: 14px;
  color: #111;
  line-height: 1.4;
`;

const PostDesc = styled.div`
  font-weight: 400;
  font-size: 12px;
  color: #ACACAC;
  line-height: 1.4;
`;

const PriceRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 4px;
`;

const OriginalPrice = styled.div`
  font-weight: 400;
  font-size: 12px;
  color: #DADADA;
  text-decoration: line-through;
`;

const SalePrice = styled.div`
  font-weight: 700;
  font-size: 14px;
  color: #111;
`;

const SaleLabel = styled.span`
  color: #4CAF50;
  font-weight: 700;
`;

/* 섹션 공통 */
const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

const SectionTitle = styled.div`
  font-weight: 700;
  font-size: 18px;
  color: #111;
  text-align: center;
`;

const StarRow = styled.div`
  display: flex;
  justify-content: center;
  gap: 0px;
`;

const StarBtn = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 2px;
`;

/* 선택형 질문 */
const QuestionBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 16px;
`;

const QuestionLabel = styled.div`
  font-weight: 600;
  font-size: 14px;
  color: #4E4E4E;
  letter-spacing: -0.3px;
`;

const OptionTrack = styled.div`
  width: 100%;
  height: 72px;
  border-radius: 140px;
  background: #222;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 6px;
  box-sizing: border-box;
`;

const OptionItem = styled.div`
  flex: 1;
  height: 60px;
  border-radius: 70px;
  background: ${({ $selected }) => ($selected ? "#C5F598" : "transparent")};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-weight: 500;
  font-size: 14px;
  letter-spacing: 0.5px;
  color: ${({ $selected }) => ($selected ? "#111" : "#fff")};
  transition: background 0.18s, color 0.18s;
  user-select: none;
`;

/* 이미지 첨부 */
const ImageRow = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

const AddImageBtn = styled.button`
  width: 80px;
  height: 80px;
  border-radius: 12px;
  border: 1px solid #DADADA;
  background: #F3F4F3;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
`;

const ImageThumb = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 12px;
  position: relative;
  flex-shrink: 0;
`;

const ThumbImg = styled.img`
  width: 100%;
  height: 100%;
  border-radius: 12px;
  object-fit: cover;
`;

const RemoveBtn = styled.button`
  position: absolute;
  top: 4px;
  right: 4px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: rgba(0,0,0,0.45);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
`;

/* 텍스트 후기 */
const ReviewTextArea = styled.textarea`
  width: 100%;
  height: 110px;
  border-radius: 12px;
  border: 1px solid #DADADA;
  background: #FFF;
  padding: 12px 14px;
  box-sizing: border-box;
  resize: none;
  font-family: "Pretendard", sans-serif;
  font-weight: 400;
  font-size: 14px;
  color: #111;
  outline: none;
  &::placeholder {
    color: #ACACAC;
  }
  
  margin-bottom: 10px;
`;

/* 등록 버튼 */
const SubmitBtn = styled.button`
  width: 348px;
  height: 56px;
  border-radius: 12px;
  background: ${({ $disabled }) => ($disabled ? "#EDFCDF" : "#C5F598")};
  border: none;
  cursor: ${({ $disabled }) => ($disabled ? "default" : "pointer")};
  font-family: "Pretendard", sans-serif;
  color: ${({ $disabled }) => ($disabled ? "#fff" : "#111")};
  margin-top: 4px;
  font-size: 14px;
  font-style: normal;
  font-weight: 500;
  line-height: normal;
`;