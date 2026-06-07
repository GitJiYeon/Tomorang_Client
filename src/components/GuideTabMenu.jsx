import React from "react";
import styled from "styled-components";

const GUIDE_PROFILE_TABS = ["\uCF54\uC2A4", "\uB9AC\uBDF0", "\uC815\uBCF4"];

export default function GuideTabMenu({ activeTab, onTabChange }) {
  return (
    <MenuContainer>
      {GUIDE_PROFILE_TABS.map((tab) => (
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

const MenuContainer = styled.div`
  display: flex;
  align-items: center;
  border-radius: 140px;
  background: #222;
  padding: 7px 6px;
  width: 350px;
  height: 56px;
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
  transition: all 0.2s ease-in-out;
`;
