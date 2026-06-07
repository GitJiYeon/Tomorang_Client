import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import HeartIcon from "../../assets/heart.svg";
import StarIcon from "../../assets/mapStar.svg";
import LikeIcon from "../../assets/likeIcon.svg";
import { addWishlist, removeWishlist } from "../../api/tomorang";
import { getPostDescription, getPostImages } from "../../utils/postDisplay";
import { isPostLiked, setPostLiked, subscribeWishlistChanges } from "../../utils/wishlist";

export default function PostCard({
  post,
  isSale = false,
  showHeart = true,
  showStats = false,
  fullWidth = false,
}) {
  const navigate = useNavigate();
  const postId = post.postId ?? post.post_id ?? post.id;
  const [liked, setLiked] = useState(() => isPostLiked(postId));
  const image = getPostImages(post)[0];
  const description = getPostDescription(post);

  useEffect(() => {
    setLiked(isPostLiked(postId));
    return subscribeWishlistChanges(() => setLiked(isPostLiked(postId)));
  }, [postId]);

  const handleLike = async (event) => {
    event.stopPropagation();
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

  const rawPrice = parseInt(String(post.price ?? 0).replace(/,/g, ""), 10) || 0;
  const discountRate = post.discountRate ?? post.discount_rate ?? 0;
  const discountedPrice = isSale && discountRate
    ? Math.round(rawPrice * (1 - discountRate / 100))
    : rawPrice;

  return (
    <Card
      $fullWidth={fullWidth}
      onClick={() => {
        sessionStorage.setItem("currentCoursePost", JSON.stringify(post));
        navigate("/course", { state: { post } });
      }}
    >
      <ImageWrap>
        {image ? (
          <Img
            src={image}
            alt={post.title}
            onError={(event) => {
              event.currentTarget.style.display = "none";
            }}
          />
        ) : (
          <ImagePlaceholder>이미지 없음</ImagePlaceholder>
        )}
        {isSale && <SaleBadge>SALE</SaleBadge>}
        {showHeart && (
          <HeartBtn onClick={handleLike}>
            <img src={HeartIcon} alt="heart" style={{ width: 12, height: 11 }} />
          </HeartBtn>
        )}
      </ImageWrap>

      <Info>
        <Title>{post.title}</Title>
        <Subtitle>{description}</Subtitle>
        {showStats && (
          <BadgeRow>
            <StatBadge $filled>
              <img src={StarIcon} alt="bookmark" width={15} height={15} />
              <StatText>{post.reviewCount ?? post.rating ?? 0}</StatText>
            </StatBadge>
            <StatBadge>
              <img src={LikeIcon} alt="like" width={15} height={15} />
              <StatText>{post.likeCount ?? 0}</StatText>
            </StatBadge>
          </BadgeRow>
        )}
        <PriceArea>
          {isSale && discountRate > 0 && (
            <OriginalPrice>{rawPrice.toLocaleString()}원</OriginalPrice>
          )}
          <Price>{discountedPrice.toLocaleString()}원</Price>
        </PriceArea>
      </Info>
    </Card>
  );
}

const Card = styled.div`
  width: ${({ $fullWidth }) => ($fullWidth ? "100%" : "200px")};
  flex-shrink: 0;
  cursor: pointer;
  border-radius: 12px;
  border: 0.3px solid #f3f4f3;
  background: #fff;
`;

const ImageWrap = styled.div`
  position: relative;
  width: 100%;
  height: 120px;
  border-radius: 12px;
  overflow: hidden;
  background: #eee;
`;

const Img = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
`;

const ImagePlaceholder = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #acacac;
  font-size: 12px;
`;

const SaleBadge = styled.div`
  position: absolute;
  top: 8px;
  left: 8px;
  height: 26px;
  border-radius: 70px;
  padding: 6px 10px;
  box-sizing: border-box;
  background: #C5F598;
  font-family: Pretendard, sans-serif;
  font-weight: 700;
  font-size: 11px;
  color: #111;
  display: flex;
  align-items: center;
`;

const HeartBtn = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  width: 28px;
  height: 28px;
  background: rgba(255, 255, 255, 0.88);
  border: none;
  border-radius: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
  padding: 0;
`;

const Info = styled.div`
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Title = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: #111;
  line-height: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const Subtitle = styled.div`
  font-size: 10px;
  font-weight: 400;
  color: #acacac;
  line-height: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const BadgeRow = styled.div`
  display: flex;
  gap: 4px;
  align-items: center;
`;

const StatBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 3px;
  border-radius: 2px;
  padding: ${({ $filled }) => ($filled ? "3px 4px" : "4px")};
  background: ${({ $filled }) => ($filled ? "#C5F598" : "#fff")};
  border: ${({ $filled }) => ($filled ? "none" : "1px solid #C5F598")};
  box-sizing: border-box;
`;

const StatText = styled.span`
  font-family: Pretendard, sans-serif;
  font-weight: 500;
  font-size: 10px;
  color: #111;
`;

const PriceArea = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding-bottom: 16px;
`;

const OriginalPrice = styled.div`
  font-family: Pretendard, sans-serif;
  font-weight: 400;
  font-size: 10px;
  text-decoration: line-through;
  color: #DADADA;
`;

const Price = styled.div`
  font-size: 14px;
  font-weight: 700;
  color: #111;
`;
