import React, { useEffect, useState } from "react";
import styled from "styled-components";
import Star from "../assets/star.svg";
import Thumb from "../assets/thumb.svg";
import Heart from "../assets/heart.svg";
import FilledHeart from "../assets/fillheart.svg";
import { useNavigate } from "react-router-dom";
import { addWishlist, removeWishlist } from "../api/tomorang";
import { getPostDescription, getPostImages } from "../utils/postDisplay";
import { isPostLiked, setPostLiked, subscribeWishlistChanges } from "../utils/wishlist";

const PostCardList = ({ post }) => {
  const { title, price, rating, likeCount } = post;
  const navigate = useNavigate();
  const postId = post.postId ?? post.post_id ?? post.id;
  const images = getPostImages(post);
  const description = getPostDescription(post);
  const [isLiked, setIsLiked] = useState(() => isPostLiked(postId));

  useEffect(() => {
    setIsLiked(isPostLiked(postId));
    return subscribeWishlistChanges(() => setIsLiked(isPostLiked(postId)));
  }, [postId]);

  const handleClick = () => {
    navigate("/course", { state: { post } });
  };

  const toggleHeart = async (event) => {
    event.stopPropagation();
    if (!postId) return;

    try {
      if (isLiked) {
        await removeWishlist(postId);
      } else {
        await addWishlist(postId);
      }
      setPostLiked(postId, !isLiked);
      setIsLiked(!isLiked);
    } catch (error) {
      console.error("찜 변경 실패", error);
      alert(error.message || "찜 변경에 실패했습니다.");
    }
  };

  return (
    <CardContainer onClick={handleClick}>
      <ImageWrapper>
        {images[0] ? (
          <Thumbnail src={images[0]} alt={title} />
        ) : (
          <ThumbnailPlaceholder>이미지 없음</ThumbnailPlaceholder>
        )}
        <HeartBadge onClick={toggleHeart}>
          <HeartIcon src={isLiked ? FilledHeart : Heart} alt="heart" />
        </HeartBadge>
      </ImageWrapper>

      <ContentSection>
        <Title>{title}</Title>
        <Subtitle>{description}</Subtitle>
        <Footer>
          <BadgeGroup>
            <RatingBadge>
              <Icon src={Star} alt="star" />
              {rating}
            </RatingBadge>
            <LikeBadge>
              <Icon src={Thumb} alt="thumb" />
              {likeCount}
            </LikeBadge>
          </BadgeGroup>
          <Price>{Number(String(price ?? 0).replace(/,/g, "")).toLocaleString()}원</Price>
        </Footer>
      </ContentSection>
    </CardContainer>
  );
};

export default PostCardList;

const CardContainer = styled.div`
  width: 348px;
  height: 240px;
  background: #ffffff;
  border-radius: 24px;
  border: 1px solid #DADADA;
  overflow: hidden;
  font-family: "Pretendard", sans-serif;
  margin-bottom: 16px;
`;

const ImageWrapper = styled.div`
  position: relative;
  height: 130px;
`;

const Thumbnail = styled.img`
  width: 100%;
  height: 130px;
  object-fit: cover;
`;

const ThumbnailPlaceholder = styled.div`
  width: 100%;
  height: 130px;
  background: #f3f4f3;
  color: #acacac;
  font-size: 13px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const HeartBadge = styled.div`
  position: absolute;
  top: 12px;
  right: 12px;
  width: 28px;
  height: 28px;
  background: #ffffff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  cursor: pointer;
  z-index: 5;
`;

const HeartIcon = styled.img`
  width: 12px;
  height: 11px;
`;

const ContentSection = styled.div`
  padding: 16px 24px 19px 24px;
`;

const Title = styled.h3`
  color: #111;
  font-feature-settings: 'liga' off, 'clig' off;
  font-family: Pretendard;
  font-size: 14px;
  font-style: normal;
  font-weight: 600;
  line-height: 22px;
  margin: 0;
`;

const Subtitle = styled.p`
  padding-bottom: 9px;
  overflow: hidden;
  color: #ACACAC;
  font-feature-settings: 'liga' off, 'clig' off;
  font-family: Pretendard;
  font-size: 12px;
  font-style: normal;
  font-weight: 400;
  line-height: 22px;
  margin: 0;
  white-space: nowrap;
  text-overflow: ellipsis;
`;

const Footer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const BadgeGroup = styled.div`
  display: flex;
  gap: 4px;
`;

const Icon = styled.img`
  stroke-width: 1px;
  stroke: #4E4E4E;
  width: 15px;
  height: 15px;
`;

const RatingBadge = styled.div`
  width: 43px;
  height: 22px;
  display: flex;
  padding: 3px 4px 4px 4px;
  align-items: center;
  gap: 3px;
  border-radius: 2px;
  background: #C5F598;
  color: #4E4E4E;
  font-family: "SF Pro";
  font-size: 10px;
  font-style: normal;
  font-weight: 590;
  line-height: normal;
  letter-spacing: 0.1px;
  justify-content: center;
`;

const LikeBadge = styled.div`
  width: 44px;
  height: 22px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 3px;
  background-color: #ffffff;
  padding: 4px 4px 3px 4px;
  border-radius: 2px;
  border: 1px solid #C5F598;
  color: #4E4E4E;
  font-family: Pretendard;
  font-size: 10px;
  font-style: normal;
  font-weight: 500;
  line-height: normal;
  letter-spacing: 0.1px;
`;

const Price = styled.div`
  color: #111;
  text-align: right;
  font-feature-settings: 'liga' off, 'clig' off;
  font-family: Pretendard;
  font-size: 16px;
  font-style: normal;
  font-weight: 700;
  line-height: normal;
  letter-spacing: -0.016px;
`;
