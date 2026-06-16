import React from "react";
import { useState } from "react";
import styled from "styled-components";
import Greenstar from "../assets/greenstar.svg";
import Graystar from "../assets/graystar.svg";
import DefaultProfileIcon from "../assets/defaultProfile.svg";
import LikeIcon from "../assets/likeIcon.svg";
import { likeReview, unlikeReview } from "../api/tomorang";
import { resolvePublicAsset } from "../utils/publicAsset";

export default function ReviewCard1({ review, variant = "default" }) {
  const [previewImage, setPreviewImage] = useState("");
  const [liked, setLiked] = useState(Boolean(review.liked));
  const [likeCount, setLikeCount] = useState(Number(review.likeCount ?? 0) || 0);
  const [isLikeBusy, setIsLikeBusy] = useState(false);
  const isReceived = variant === "received";
  const reviewId = review.reviewId ?? review.id;
  const date = new Date(review.createdAt ?? Date.now());
  const postImages = (review.postImages ?? review.images ?? (review.postImage ? [review.postImage] : []))
    .map(resolvePublicAsset)
    .filter(Boolean);
  const rating = Number(review.rating ?? 0);
  const nickname = review.nickname ?? review.memberNickName ?? review.memberId ?? "사용자";
  const profile = resolvePublicAsset(review.profile ?? review.memberImage) || DefaultProfileIcon;
  const dateStr = `${String(date.getMonth() + 1).padStart(2, "0")}.${String(date.getDate()).padStart(2, "0")}`;
  const yearStr = `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}.${String(date.getDate()).padStart(2, "0")}`;

  const renderStars = (value) => {
    const filledCount = Math.floor(value);
    return Array.from({ length: 5 }, (_, i) => (
      <StarImg key={i} src={i < filledCount ? Greenstar : Graystar} alt="star" />
    ));
  };

  const handleLikeClick = async (event) => {
    event.stopPropagation();
    if (!reviewId || isLikeBusy) return;

    setIsLikeBusy(true);
    try {
      if (liked) {
        await unlikeReview(reviewId);
        setLiked(false);
        setLikeCount((prev) => Math.max(0, prev - 1));
      } else {
        await likeReview(reviewId);
        setLiked(true);
        setLikeCount((prev) => prev + 1);
      }
    } catch (error) {
      alert(error.message || "리뷰 좋아요 처리에 실패했습니다.");
    } finally {
      setIsLikeBusy(false);
    }
  };

  return (
    <Card $isReceived={isReceived}>
      <TopRow>
        <TopLeft>
          <Avatar src={profile} alt="profile" />
          <NameDateGroup>
            <NicknameRow>
              <Nickname>{nickname}</Nickname>
              <Stars>{renderStars(rating)}</Stars>
              <RatingNum>{rating.toFixed(1)}</RatingNum>
            </NicknameRow>
            <DateRow>
              <DateText>{dateStr}</DateText>
              <Separator>|</Separator>
              <DateText>12:00-18:00</DateText>
            </DateRow>
          </NameDateGroup>
        </TopLeft>
        <YearText>{yearStr}</YearText>
      </TopRow>

      {postImages.length > 0 && (
        <ImageRow>
          {postImages.map((image) => (
            <ImageButton
              key={image}
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                setPreviewImage(image);
              }}
            >
              <ReviewImage src={image} alt="review" $isReceived={isReceived} />
            </ImageButton>
          ))}
        </ImageRow>
      )}

      <ContentText>{review.content}</ContentText>

      <LikeRow>
        <LikeButton
          type="button"
          $active={liked}
          disabled={isLikeBusy}
          onClick={handleLikeClick}
        >
          <LikeImg src={LikeIcon} alt="like" />
          {likeCount}
        </LikeButton>
      </LikeRow>

      {previewImage && (
        <ImagePreviewOverlay
          role="button"
          tabIndex={0}
          onClick={(event) => {
            event.stopPropagation();
            setPreviewImage("");
          }}
          onKeyDown={(event) => {
            if (event.key === "Escape" || event.key === "Enter") setPreviewImage("");
          }}
        >
          <PreviewImage src={previewImage} alt="review preview" />
        </ImagePreviewOverlay>
      )}
    </Card>
  );
}

const Card = styled.div`
  width: min(var(--app-content-width), calc(100vw - 42px));
  max-height: 346px;
  border-radius: 12px;
  background: #fff;
  padding: 20px 16px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  box-sizing: border-box;
  overflow: hidden;
  margin: 0 auto 12px;
  border: 1px solid #DADADA;
`;

const TopRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 8px;
  min-width: 0;
`;

const TopLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 11px;
  min-width: 0;
`;

const Avatar = styled.img`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  object-fit: cover;
  background: #d9d9d9;
  flex-shrink: 0;
`;

const NameDateGroup = styled.div`
  display: flex;
  align-items: flex-start;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
`;

const NicknameRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
  max-width: 210px;
`;

const Nickname = styled.span`
  color: #111;
  font-feature-settings: 'liga' off, 'clig' off;
  font-family: Pretendard;
  font-size: 16px;
  font-style: normal;
  font-weight: 500;
  line-height: 22px;
  letter-spacing: 0.3px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const Stars = styled.div`
  display: flex;
  gap: 2px;
  flex-shrink: 0;
`;

const StarImg = styled.img`
  width: 13px;
  height: 13px;
`;

const RatingNum = styled.span`
  font-size: 13px;
  font-weight: 600;
  color: #333;
  flex-shrink: 0;
`;

const DateRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const DateText = styled.span`
  font-size: 12px;
  color: #999;
`;

const Separator = styled.span`
  font-size: 12px;
  color: #ccc;
`;

const YearText = styled.span`
  font-size: 11px;
  color: #bdbdbd;
  padding-top: 6px;
  white-space: nowrap;
  flex-shrink: 0;
`;

const ImageRow = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  overflow-x: auto;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const ReviewImage = styled.img`
  width: 110px;
  height: ${({ $isReceived }) => ($isReceived ? "132px" : "102px")};
  border-radius: 12px;
  object-fit: cover;
  flex-shrink: 0;
  background: #e0e0e0;
`;

const ImageButton = styled.button`
  border: 0;
  background: transparent;
  padding: 0;
  cursor: pointer;
  flex-shrink: 0;
`;

const ImagePreviewOverlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 1200;
  width: 100vw;
  height: 100dvh;
  background: rgba(0, 0, 0, 0.82);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  box-sizing: border-box;
  cursor: zoom-out;
`;

const PreviewImage = styled.img`
  max-width: min(100%, var(--app-page-width));
  max-height: 82dvh;
  object-fit: contain;
  border-radius: 12px;
`;

const ContentText = styled.p`
  color: #4e4e4e;
  font-feature-settings: "liga" off, "clig" off;
  font-family: Pretendard, sans-serif;
  font-size: 12px;
  font-style: normal;
  font-weight: 500;
  line-height: 16px;
  white-space: pre-line;
  margin: 0;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 6;
  -webkit-box-orient: vertical;
`;

const LikeRow = styled.div`
  display: flex;
  justify-content: flex-end;
`;

const LikeButton = styled.button`
  height: 26px;
  min-width: 48px;
  border-radius: 13px;
  border: 1px solid ${({ $active }) => ($active ? "#C5F598" : "#DADADA")};
  background: ${({ $active }) => ($active ? "#EDFCDF" : "#fff")};
  color: #4e4e4e;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 0 8px;
  font-family: Pretendard, sans-serif;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;

  &:disabled {
    cursor: default;
    opacity: 0.65;
  }
`;

const LikeImg = styled.img`
  width: 14px;
  height: 14px;
`;
