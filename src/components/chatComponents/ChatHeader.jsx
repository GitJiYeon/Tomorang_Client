import React from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";

export default function ChatHeader({ name, subtitle, onFlag }) {
  const navigate = useNavigate();

  return (
    <>
      <Header>
        <BackBtn onClick={() => navigate(-1)}>
          <svg width="10" height="18" viewBox="0 0 10 18" fill="none">
            <path d="M9 1L1 9L9 17" stroke="#111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </BackBtn>
        <Center>
          <Name>{name}</Name>
          <Subtitle>{subtitle}</Subtitle>
        </Center>
        <FlagBtn onClick={onFlag}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" stroke="#111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <line x1="4" y1="22" x2="4" y2="15" stroke="#111" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </FlagBtn>
      </Header>
      <Divider />
    </>
  );
}

const Header = styled.div`
  width: var(--app-page-width);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background-color: #fff;
  box-sizing: border-box;
`;

const BackBtn = styled.button`
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  width: 32px;
  transition: none;

  &:active {
    opacity: 1;
    transform: none;
  }
`;

const Center = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  flex: 1;
`;

const Name = styled.span`
  color: #111;
  text-align: center;
  font-feature-settings: 'liga' off, 'clig' off;
  font-family: Pretendard;
  font-size: 16px;
  font-weight: 600;
  line-height: 22px;
`;

const Subtitle = styled.span`
  color: #ACACAC;
  text-align: center;
  font-feature-settings: 'liga' off, 'clig' off;
  font-family: Pretendard;
  font-size: 10px;
  font-weight: 600;
  line-height: normal;
`;

const FlagBtn = styled.button`
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  width: 32px;
  justify-content: flex-end;
  transition: none;

  &:active {
    opacity: 1;
    transform: none;
  }
`;

const Divider = styled.div`
  width: 100%;
  height: 1px;
  background: #F3F4F3;
`;
