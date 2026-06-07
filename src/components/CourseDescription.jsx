import { useEffect, useState } from "react";
import styled from "styled-components";
import Greenstar from "../assets/greenstar.svg";
import Graystar from "../assets/graystar.svg";
import Flag from "../assets/flag.svg";
import Heart from "../assets/heart.svg";
import Filledheart from "../assets/fillheart.svg";
import ReportSystem from "../components/ReportModal";
import { addWishlist, removeWishlist } from "../api/tomorang";
import { getPostId, isPostLiked, setPostLiked, subscribeWishlistChanges } from "../utils/wishlist";

export default function CourseDescription({ post }) {
  const postId = getPostId(post);
  const [liked, setLiked] = useState(() => isPostLiked(postId));
  const [isReportOpen, setIsReportOpen] = useState(false);

  useEffect(() => {
    setLiked(isPostLiked(postId));
    return subscribeWishlistChanges(() => setLiked(isPostLiked(postId)));
  }, [postId]);

  const toggleLike = async () => {
    if (!postId) return;
    const nextLiked = !liked;

    try {
      if (nextLiked) {
        await addWishlist(postId);
      } else {
        await removeWishlist(postId);
      }
      setPostLiked(postId, nextLiked);
      setLiked(nextLiked);
    } catch (error) {
      console.error("찜 변경 실패", error);
      alert(error.message || "찜 변경에 실패했습니다.");
    }
  };

  if (!post) return null;

  const images = Array.isArray(post.images) ? post.images.filter(Boolean) : [];
  const rating = Number(post.rating ?? 0);
  const discountRate = Number(post.discountRate ?? post.discount_rate ?? 0);
  const originalPriceNum = Number(String(post.price ?? 0).replace(/,/g, ""));
  const discountedPrice = discountRate > 0
    ? Math.round(originalPriceNum * (1 - discountRate / 100))
    : originalPriceNum;
  const subImages = images.slice(1);
  const visibleSubImages = subImages.slice(0, 4);
  const isMoreThanFour = subImages.length > 4;
  const extraCount = subImages.length - 3;

  const renderStars = (value) => {
    const filledCount = Math.floor(value);
    return Array.from({ length: 5 }, (_, i) => (
      <StarImg key={i} src={i < filledCount ? Greenstar : Graystar} alt="star" />
    ));
  };

  return (
    <Card>
      <MainImageWrapper>
        {images[0] ? (
          <MainImage src={images[0]} alt={post.title} />
        ) : (
          <ImagePlaceholder>이미지 없음</ImagePlaceholder>
        )}
        <FlagButton onClick={() => setIsReportOpen(true)}>
          <FlagIcon src={Flag} alt="report" />
        </FlagButton>
      </MainImageWrapper>

      <Body>
        <TitleRow>
          <TitleGroup>
            <Title>{post.title}</Title>
            <Subtitle>{post.subtitle}</Subtitle>
          </TitleGroup>
          <SaveButton onClick={toggleLike}>
            <HeartIcon src={liked ? Filledheart : Heart} alt="heart" />
            <SaveText>저장</SaveText>
          </SaveButton>
        </TitleRow>

        <PriceRatingRow>
          <PriceGroup>
            {discountRate > 0 && (
              <OriginalPrice>{originalPriceNum.toLocaleString()}원</OriginalPrice>
            )}
            <CurrentPriceArea>
              {discountRate > 0 && <SaleLabel>SALE</SaleLabel>}
              <CurrentPrice>{discountedPrice.toLocaleString()}원</CurrentPrice>
            </CurrentPriceArea>
          </PriceGroup>

          <RatingGroup>
            <Stars>{renderStars(rating)}</Stars>
            <RatingNumber>{rating.toFixed(1)}</RatingNumber>
          </RatingGroup>
        </PriceRatingRow>
      </Body>

      {visibleSubImages.length > 0 && (
        <SubImageRow>
          {visibleSubImages.map((img, idx) => (
            <SubImageWrapper key={`${img}-${idx}`}>
              <SubImage src={img} alt={`sub-${idx}`} />
              {idx === 3 && isMoreThanFour && (
                <ExtraOverlay>{extraCount}+</ExtraOverlay>
              )}
            </SubImageWrapper>
          ))}
        </SubImageRow>
      )}

      <ReportSystem
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
      />
    </Card>
  );
}

const Card = styled.div`
  width: 390px;
  margin: 0 auto;
  padding: 0 24px 24px 24px;
  background: #fff;
  font-family: "Pretendard", sans-serif;
  box-sizing: border-box;
`;

const MainImageWrapper = styled.div`
  position: relative;
  width: 345px;
  height: 220px;
  margin-bottom: 21px;
`;

const MainImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 20px;
`;

const ImagePlaceholder = styled.div`
  width: 100%;
  height: 100%;
  border-radius: 20px;
  background: #f3f4f3;
  color: #acacac;
  font-size: 13px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const FlagButton = styled.button`
  position: absolute;
  top: 15px;
  right: 15px;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: #fff;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);
`;

const FlagIcon = styled.img`
  width: 14px;
  height: 14px;
`;

const Body = styled.div`
  margin-bottom: 20px;
`;

const TitleRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
`;

const TitleGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const Title = styled.h2`
  color: #111;
  font-size: 19px;
  font-weight: 700;
  margin: 0;
`;

const Subtitle = styled.p`
  color: #4E4E4E;
  font-size: 13px;
  font-weight: 400;
  margin: 0;
`;

const SaveButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background: #fff;
  border: 1px solid #eee;
  border-radius: 20px;
  padding: 6px 14px;
  cursor: pointer;
`;

const HeartIcon = styled.img`
  width: 14px;
  height: 14px;
`;

const SaveText = styled.span`
  color: #4E4E4E;
  font-size: 12px;
  font-weight: 500;
`;

const PriceRatingRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-top: 10px;
`;

const PriceGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const OriginalPrice = styled.span`
  color: #DADADA;
  font-size: 11px;
  text-decoration: line-through;
`;

const CurrentPriceArea = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const SaleLabel = styled.span`
  color: #B1DD89;
  font-size: 18px;
  font-weight: 800;
`;

const CurrentPrice = styled.span`
  font-size: 20px;
  font-weight: 800;
  color: #111;
`;

const RatingGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const Stars = styled.div`
  display: flex;
  gap: 1px;
`;

const StarImg = styled.img`
  width: 15px;
  height: 15px;
`;

const RatingNumber = styled.span`
  font-size: 15px;
  font-weight: 600;
  color: #333;
`;

const SubImageRow = styled.div`
  display: flex;
  gap: 12px;
`;

const SubImageWrapper = styled.div`
  position: relative;
  width: 76px;
  height: 76px;
  border-radius: 12px;
  overflow: hidden;
`;

const SubImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const ExtraOverlay = styled.div`
  position: absolute;
  inset: 0;
  background: rgba(30, 30, 30, 0.65);
  backdrop-filter: blur(1px);
  color: #FFF;
  font-size: 17px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
`;
