import React from "react";
import styled from "styled-components";

export default function CourseTabMenu({ activeTab, onTabChange }) {
  const tabs = ["코스설명", "리뷰", "가이드"];

  return (
    <MenuContainer>
      {tabs.map((tab) => (
        <TabButton
          key={tab}
          $isActive={activeTab === tab}
          onClick={() => onTabChange(tab)}
        >
          {tab}
        </TabButton>
      ))}
    </MenuContainer>
  );
}

// --- Styled Components ---

const MenuContainer = styled.div`
  display: flex;
  align-items: center;
  border-radius: 140px;
  background: #222;
  padding: 7px 8px;
  width: 350px;
  height: 56px;
  
  /* 이 부분을 추가하면 부모 요소 안에서 가로 중앙 정렬이 됩니다! */
  margin: 0 auto;
`;

const TabButton = styled.button`
  flex: 1;
  width: 111px;
  height: 42px;
  border: none;
  border-radius: 70px;
  background-color: ${(props) => (props.$isActive ? "#C5F598" : "transparent")};
  color: ${(props) => (props.$isActive ? "#111111" : "#FFFFFF")};
  font-size: 14px;
  font-weight: 500;
  font-family: "Pretendard", sans-serif;
  cursor: pointer;
  line-height: 22px;
  transition: all 0.3s ease-in-out;
`;