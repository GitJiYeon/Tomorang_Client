import { useState } from "react";
import styled from "styled-components";
import Greenstar from "../assets/greenstar.svg";
import Graystar from "../assets/graystar.svg";
import Flag from "../assets/flag.svg";
import Heart from "../assets/heart.svg";
import Filledheart from "../assets/fillheart.svg";
import ReportSystem from "../components/ReportModal";

export default function CourseDescription({ post }) {
  const [liked, setLiked] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);

  if (!post) return null;

  const originalPriceNum = Number(post.price.replace(/,/g, ""));
  const discountedPrice = post.discountRate > 0
    ? Math.round(originalPriceNum * (1 - post.discountRate / 100))
    : originalPriceNum;

  const renderStars = (rating) => {
    const filledCount = Math.floor(rating);
    return Array.from({ length: 5 }, (_, i) => (
      <StarImg key={i} src={i < filledCount ? Greenstar : Graystar} alt="star" />
    ));
  };

  // 사진 로직 수정
  const subImages = post.images.slice(1); // 메인 제외한 나머지 사진들
  const visibleSubImages = subImages.slice(0, 4); // 최대 4개까지만 렌더링
  const isMoreThanFour = subImages.length > 4; // 서브 사진이 4개보다 많은지 확인
  const extraCount = subImages.length - 3; // 4번째 칸에 표시될 숫자 (3개는 선명, 4번째부터 묶음)

  return (
    <Card>
      <MainImageWrapper>
        <MainImage src={post.images[0]} alt={post.title} />
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
          <SaveButton onClick={() => setLiked(!liked)}>
            <HeartIcon src={liked ? Filledheart : Heart} alt="heart" />
            <SaveText>저장</SaveText>
          </SaveButton>
        </TitleRow>

        <PriceRatingRow>
          <PriceGroup>
            {post.discountRate > 0 && (
              <OriginalPrice>{originalPriceNum.toLocaleString()}원</OriginalPrice>
            )}
            <CurrentPriceArea>
              {post.discountRate > 0 && <SaleLabel>SALE</SaleLabel>}
              <CurrentPrice>{discountedPrice.toLocaleString()}원</CurrentPrice>
            </CurrentPriceArea>
          </PriceGroup>

          <RatingGroup>
            <Stars>{renderStars(post.rating)}</Stars>
            <RatingNumber>{post.rating.toFixed(1)}</RatingNumber>
          </RatingGroup>
        </PriceRatingRow>
      </Body>

      <SubImageRow>
        {visibleSubImages.map((img, idx) => (
          <SubImageWrapper key={idx}>
            <SubImage src={img} alt={`sub-${idx}`} />
            {/* 4번째 사진(idx 3)이면서 전체 개수가 4개보다 많을 때만 어두운 효과 적용 */}
            {idx === 3 && isMoreThanFour && (
              <ExtraOverlay>
                {extraCount}+
              </ExtraOverlay>
            )}
          </SubImageWrapper>
        ))}
      </SubImageRow>

      <ReportSystem 
        isOpen={isReportOpen} 
        onClose={() => setIsReportOpen(false)} 
      />
    </Card>
  );
}

// --- Styled Components ---

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
  gap: 12px; /* 사진 사이 간격 */
`;

const SubImageWrapper = styled.div`
  position: relative;
  width: 76px; /* 고정 크기 또는 flex: 1 */
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
  background: rgba(30, 30, 30, 0.65); /* 어두운 효과 */
  backdrop-filter: blur(1px); /* 살짝 흐릿하게 */
  color: #FFF;
  font-size: 17px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
`;