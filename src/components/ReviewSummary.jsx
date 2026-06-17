import React from "react";
import styled from "styled-components";
import Greenstar from "../assets/greenstar.svg";
import Graystar from "../assets/graystar.svg";
import { useI18n } from "../i18n/I18nProvider";

function ReviewSummary({ rating = 4.2, reviewCount = 15 }) {
  const { t } = useI18n();
  const renderStars = () => {
    const activeStars = Math.floor(rating); 
    
    return [1, 2, 3, 4, 5].map((num) => (
      <StarImg 
        key={num} 
        src={num <= activeStars ? Greenstar : Graystar} 
        alt={num <= activeStars ? t("채워진 별") : t("빈 별")} 
      />
    ));
  };

  return (
    <SummaryContainer>
      <RatingSection>
        <RatingValue>{rating.toFixed(1)}</RatingValue>
        <RatingMax>/5</RatingMax>
      </RatingSection>

      <VerticalDivider />

      <InfoSection>
        <StarsWrapper>{renderStars()}</StarsWrapper>
        <CountText>{reviewCount}{t("명의 발견자의 후기")}</CountText>
      </InfoSection>
    </SummaryContainer>
  );
}

export default ReviewSummary;

// --- Styled Components ---

const SummaryContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 0;
  background-color: #fff;
`;

const RatingSection = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: flex-end;
  flex: 1;
  padding-right: 30px;
`;

const RatingValue = styled.span`
  font-size: 48px;
  font-weight: 700;
  color: #111;
`;

const RatingMax = styled.span`
  font-size: 24px;
  color: #999;
  margin-left: 4px;
`;

const VerticalDivider = styled.div`
  width: 1px;
  height: 60px;
  background-color: #eee;
`;

const InfoSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  flex: 1;
  padding-left: 30px;
`;

const StarsWrapper = styled.div`
  display: flex;
  gap: 4px;
  margin-bottom: 8px;
`;

const StarImg = styled.img`
  width: 18px; /* 이미지 크기에 맞춰 조절하세요 */
  height: 18px;
`;

const CountText = styled.span`
  font-size: 14px;
  font-weight: 500;
  color: #111;
`;
