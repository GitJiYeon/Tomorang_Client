import React from "react";
import styled from "styled-components";
import ArrowIcon from "../assets/graynextarrow.svg";

export default function ActivitySection({ title = "활동", items = [] }) {
  return (
    <Wrapper>
      <SectionTitle>{title}</SectionTitle>
      <ItemList>
        {items.map((item, index) => (
          <Row key={`${item.label}-${index}`} onClick={item.onClick}>
            <Label>{item.label}</Label>
            <RightGroup>
              {item.value && <ValueText>{item.value}</ValueText>}
              <ArrowImg src={ArrowIcon} alt="" />
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
  font-family: Pretendard;
  font-size: 12px;
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

const Row = styled.button`
  width: 100%;
  border: 0;
  background: transparent;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  align-self: stretch;
  cursor: pointer;
`;

const Label = styled.span`
  color: #111;
  font-family: Pretendard;
  font-size: 14px;
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
  font-family: Pretendard;
  font-size: 14px;
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
