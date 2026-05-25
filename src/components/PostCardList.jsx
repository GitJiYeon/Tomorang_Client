// 호출방법: <PostCardList key={post.postId} post={post} />
import React, { useState } from "react";
import styled from "styled-components";
import Star from "../assets/star.svg";
import Thumb from "../assets/thumb.svg";
import Heart from "../assets/heart.svg";
import FilledHeart from "../assets/fillheart.svg";
import { useNavigate } from "react-router-dom";

const PostCardList = ({ post }) => {
  const { title, subtitle, price, rating, likeCount, images } = post;
  const navigate = useNavigate();

  // ✅ localStorage에서 초기 찜 상태 읽기
  const getLiked = () => {
    const liked = JSON.parse(localStorage.getItem("likedPosts") ?? "[]");
    return liked.includes(post.postId);
  };
  const [isLiked, setIsLiked] = useState(getLiked);

  const handleClick = () => {
    navigate("/course", { state: { post } });
  };

  const toggleHeart = (e) => {
    e.stopPropagation();
    const liked = JSON.parse(localStorage.getItem("likedPosts") ?? "[]");
    let updated;
    if (isLiked) {
      updated = liked.filter((id) => id !== post.postId);
    } else {
      updated = [...liked, post.postId];
    }
    localStorage.setItem("likedPosts", JSON.stringify(updated));
    setIsLiked(!isLiked);
  };

  return (
    <CardContainer onClick={handleClick}>
      <ImageWrapper>
        <Thumbnail src={images[0]} alt={title} />
        <HeartBadge onClick={toggleHeart}>
          <HeartIcon src={isLiked ? FilledHeart : Heart} alt="heart" />
        </HeartBadge>
      </ImageWrapper>

      <ContentSection>
        <Title>{title}</Title>
        <Subtitle>{subtitle}</Subtitle>
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
          <Price>{price}원</Price>
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