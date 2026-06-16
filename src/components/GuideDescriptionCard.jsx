import React from "react";
import styled from "styled-components";

export default function GuideDescriptionCard({ guide }) {
  const description =
    guide.description ??
    guide.guideDescription ??
    guide.guide_description ??
    guide.bio ??
    guide.oneWord ??
    guide.introduction;

  if (!description) return null;

  return (
    <Card>
      <DescTitle>가이드 설명</DescTitle>
      <DescText>{description}</DescText>
    </Card>
  );
}

const Card = styled.div`
  width: var(--app-content-width);
  border-radius: 12px;
  background: #fff;
  padding: 20px 16px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  box-sizing: border-box;
  margin: 0 auto;
`;

const DescTitle = styled.h2`
  color: #111;
font-feature-settings: 'liga' off, 'clig' off;
font-family: Pretendard;
font-size: 16px;
font-style: normal;
font-weight: 600;
line-height: 22px; /* 137.5% */
`;

const DescText = styled.p`
  color: #4E4E4E;
    font-feature-settings: 'liga' off, 'clig' off;
    font-family: Pretendard;
    font-size: 14px;
    font-style: normal;
    font-weight: 400;
    line-height: 19px; /* 135.714% */
    letter-spacing: 0.3px;
`;
