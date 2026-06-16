import React from "react";
import styled from "styled-components";

const tabs = [
  { key: "course", label: "코스설명" },
  { key: "review", label: "리뷰" },
  { key: "guide", label: "가이드" },
];

export default function CourseTabMenu({ activeTab, onTabChange }) {
  return (
    <MenuContainer>
      {tabs.map((tab) => (
        <TabButton
          key={tab.key}
          $isActive={activeTab === tab.key}
          onClick={() => onTabChange(tab.key)}
        >
          {tab.label}
        </TabButton>
      ))}
    </MenuContainer>
  );
}

const MenuContainer = styled.div`
  display: flex;
  align-items: center;
  border-radius: 140px;
  background: #222;
  padding: 7px 8px;
  width: var(--app-bottom-nav-width);
  height: 56px;
  margin: 0 auto;
  box-sizing: border-box;
`;

const TabButton = styled.button`
  flex: 1;
  height: 42px;
  border: none;
  border-radius: 70px;
  background-color: ${({ $isActive }) => ($isActive ? "#C5F598" : "transparent")};
  color: ${({ $isActive }) => ($isActive ? "#111" : "#fff")};
  font-size: 14px;
  font-weight: 500;
  font-family: Pretendard, sans-serif;
  cursor: pointer;
  line-height: 22px;
`;
