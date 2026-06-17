/**
 * ReviewWritePage - 리뷰 작성 전용 페이지
 *
 * 라우터:
 * <Route path="/review-write/:reservationId" element={<ReviewWritePage />} />
 *
 * 이동:
 * navigate(`/review-write/${reservationId}`)
 */

import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { useReservations } from "../components/context/ReservationContext";
import Header from "../components/Header";
import StarFillIcon from "../assets/bookStatusIcons/starFill.svg";
import StarEmptyIcon from "../assets/bookStatusIcons/StarEmpty.svg";
import PlusIcon from "../assets/bookStatusIcons/plusIcon.svg";
import XSmallIcon from "../assets/bookStatusIcons/xSmall.svg";
import { createReview, getPostDetail } from "../api/tomorang";
import { getPostDescription, getPostImages } from "../utils/postDisplay";
import { useI18n } from "../i18n/I18nProvider";

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

const MAX_REVIEW_IMAGES = 5;
const REVIEW_IMAGE_MAX_SIZE = 1280;
const REVIEW_IMAGE_QUALITY = 0.75;

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("이미지를 불러오지 못했습니다."));
    };
    image.src = url;
  });
}

async function compressImageFile(file) {
  if (!file.type.startsWith("image/")) return null;

  const image = await loadImage(file);
  const scale = Math.min(1, REVIEW_IMAGE_MAX_SIZE / Math.max(image.width, image.height));
  const width = Math.max(1, Math.round(image.width * scale));
  const height = Math.max(1, Math.round(image.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");
  context.drawImage(image, 0, 0, width, height);

  const blob = await new Promise((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", REVIEW_IMAGE_QUALITY)
  );
  if (!blob) return file;

  const compressedName = file.name.replace(/\.[^.]+$/, ".jpg");
  return new File([blob], compressedName, {
    type: "image/jpeg",
    lastModified: Date.now(),
  });
}

export default function ReviewWritePage() {
  const { reservationId } = useParams();
  const navigate = useNavigate();
  const { t } = useI18n();
  const { reservations, completeAndSaveReview, isLoading } = useReservations();
  const [post, setPost] = useState(null);

  const reservation = reservations.find((r) => String(r.reservationId) === String(reservationId));

  const [reviewRating, setReviewRating] = useState(0);
  const [answers, setAnswers] = useState({});
  const [reviewText, setReviewText] = useState("");
  const [reviewImages, setReviewImages] = useState([]);
  const [reviewImageFiles, setReviewImageFiles] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);

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

  if (!reservation || !post) {
    return (
      <Wrapper>
        <div style={{ padding: 40, color: "#ACACAC" }}>
          {isLoading ? "예약 정보를 불러오는 중입니다." : "예약 정보를 찾을 수 없습니다."}
        </div>
      </Wrapper>
    );
  }

  const handleImageAdd = async (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = "";
    const remainCount = MAX_REVIEW_IMAGES - reviewImageFiles.length;
    if (remainCount <= 0) return;

    try {
      const compressedFiles = (
        await Promise.all(files.slice(0, remainCount).map(compressImageFile))
      ).filter(Boolean);
      const previews = compressedFiles.map((file) => URL.createObjectURL(file));

      setReviewImages((prev) => [...prev, ...previews].slice(0, MAX_REVIEW_IMAGES));
      setReviewImageFiles((prev) => [...prev, ...compressedFiles].slice(0, MAX_REVIEW_IMAGES));
    } catch (error) {
      console.error("리뷰 이미지 압축 실패", error);
      setErrorMessage(t("이미지를 처리하지 못했어요. 다른 사진으로 다시 시도해주세요."));
    }
  };

  const handleImageRemove = (idx) => {
    setReviewImages((prev) => {
      const removed = prev[idx];
      if (removed?.startsWith("blob:")) URL.revokeObjectURL(removed);
      return prev.filter((_, i) => i !== idx);
    });
    setReviewImageFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const canSubmit = reviewRating > 0;

  const handleSubmit = async () => {
    if (!canSubmit || isSubmitting) return;
    setIsSubmitting(true);
    setErrorMessage("");
    try {
      const savedProfile = JSON.parse(localStorage.getItem("profile") || "{}");
      const myNickname =
        savedProfile.nickname ??
        savedProfile.nickName ??
        savedProfile.name ??
        localStorage.getItem("userId") ??
        "사용자";
      const myProfile =
        savedProfile.profileImage ??
        savedProfile.image ??
        savedProfile.profile;
      const createdReview = await createReview(
        {
          postId: reservation.postId,
          rating: reviewRating,
          content: reviewText.trim() || Object.values(answers).join(" / "),
        },
        reviewImageFiles
      );

      await completeAndSaveReview(Number(reservationId), {
        ...createdReview,
        nickname: createdReview.nickname ?? createdReview.memberNickName ?? myNickname,
        profile: createdReview.profile ?? createdReview.memberImage ?? myProfile,
        rating: createdReview.rating ?? reviewRating,
        answers,
        content: createdReview.content ?? reviewText,
        images:
          createdReview.images?.length
            ? createdReview.images
            : createdReview.postImages?.length
              ? createdReview.postImages
              : reviewImages,
        createdAt: createdReview.createdAt ?? new Date().toISOString(),
      });
      // 제출 완료 → 예약현황 페이지로 이동 (이제 COMPLETED + myReview 있음)
      navigate(`/reservation-status/${reservationId}`, { replace: true });
    } catch (err) {
      console.error("리뷰 등록 실패", err);
      setErrorMessage(err.message || t("리뷰 등록에 실패했습니다."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Wrapper>
      <Header coment={t("리뷰 작성")} />

      <Content>
        {/* ── 게시물 썸네일 카드 ── */}
        <PostCard>
          <PostThumb
            src={post.thumbnail || getPostImages(post)[0]}
            alt={post.title}
            onError={(e) => { e.target.style.background = "#eee"; e.target.removeAttribute("src"); }}
          />
          <PostInfo>
            <PostTitle>{post.title}</PostTitle>
            <PostDesc>{post.description || getPostDescription(post)}</PostDesc>
            <PriceRow>
              {post.originalPrice && (
                <OriginalPrice>{post.originalPrice?.toLocaleString()}원</OriginalPrice>
              )}
              <SalePrice>
                {post.originalPrice && <SaleLabel>SALE </SaleLabel>}
                {Number(String(post.price ?? 0).replace(/,/g, "")).toLocaleString()}원
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
          <QuestionLabel>{t("가이드와 코스에 대한 솔직한 후기를 남겨주세요")}</QuestionLabel>
          <ReviewTextArea
            placeholder={t("세일러문 굿즈 위주로 보고 싶...")}
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            maxLength={500}
          />
        </Section>

        {/* ── 등록 버튼 ── */}
        {errorMessage && <ErrorText>{errorMessage}</ErrorText>}
        <SubmitBtn $disabled={!canSubmit || isSubmitting} onClick={handleSubmit}>
          {isSubmitting ? t("등록 중...") : t("후기 등록하기")}
        </SubmitBtn>
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
  width: var(--app-content-width);
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

const ErrorText = styled.p`
  margin: 0 0 10px;
  color: #d93025;
  font-size: 13px;
  font-weight: 500;
`;
