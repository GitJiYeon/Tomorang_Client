import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styled, { keyframes } from "styled-components";
import LogoIcon from "../assets/logoIcon.svg";

export default function GuideWelcomePage() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/guide", { replace: true });
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <Wrapper>
      <CenterBox>
        <Logo src={LogoIcon} alt="로고" />
        <Title>가입을 축하드려요</Title>
        <SubText>나만의 여행지를 나눠볼까요?</SubText>
      </CenterBox>
    </Wrapper>
  );
}

const fadeUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const Wrapper = styled.div`
  width: 390px;
  min-height: 100dvh;
  margin: 0 auto;
  background: #c5f598;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: Pretendard, sans-serif;
`;

const CenterBox = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  animation: ${fadeUp} 0.6s ease forwards;
`;

const Logo = styled.img`
  width: 78px;
  height: auto;
  margin-bottom: 4px;
`;

const Title = styled.h1`
  margin: 0;
  color: #111;
  font-size: 21px;
  font-weight: 700;
`;

const SubText = styled.p`
  margin: 0;
  color: #444;
  font-size: 14px;
`;
