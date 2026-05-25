import React from "react";
import styled from "styled-components";
import ArrowIcon from "../assets/graynextarrow.svg";

/**
 * 사용 예시:
 *
 * const items = [
 *   { label: "나의 코스",    onClick: () => navigate("/my-course") },
 *   { label: "앱 언어",     value: "한국어", onClick: () => navigate("/language") }, // value 있으면 초록 텍스트 표시
 * ];
 *
 * <ActivitySection title="활동" items={items} />
 */
export default function ActivitySection({ title = "활동", items = [] }) {
  return (
    <Wrapper>
      <SectionTitle>{title}</SectionTitle>
      <ItemList>
        {items.map((item, index) => (
          <Row key={index} onClick={item.onClick}>
            <Label>{item.label}</Label>
            <RightGroup>
              {item.value && <ValueText>{item.value}</ValueText>}
              <ArrowImg src={ArrowIcon} alt=">" />
            </RightGroup>
          </Row>
        ))}
      </ItemList>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
`;

const SectionTitle = styled.span`
  color: #acacac;
  font-feature-settings: 'liga' off, 'clig' off;
  font-family: Pretendard;
  font-size: 12px;
  font-style: normal;
  font-weight: 500;
  line-height: 22px;
`;

const ItemList = styled.div`
  display: flex;
  padding: 0 0 0 4px;
  flex-direction: column;
  align-items: flex-start;
  gap: 24px;
  align-self: stretch;
`;

const Row = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  align-self: stretch;
  cursor: pointer;
`;

const Label = styled.span`
  color: #111;
  font-feature-settings: 'liga' off, 'clig' off;
  font-family: Pretendard;
  font-size: 14px;
  font-style: normal;
  font-weight: 500;
  line-height: 22px;
`;

const RightGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const ValueText = styled.span`
  color: #B1DD89;
  font-feature-settings: 'liga' off, 'clig' off;
  font-family: Pretendard;
  font-size: 14px;
  font-style: normal;
  font-weight: 500;
  line-height: 22px;
`;

const ArrowImg = styled.img`
  display: flex;
  width: 12px;
  height: 12px;
  padding: 5px;
  justify-content: center;
  align-items: center;
`;