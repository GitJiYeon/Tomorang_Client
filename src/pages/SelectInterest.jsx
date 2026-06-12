import React, { useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import StartComent from "../components/StartComent";
import NextButton from "../components/NextButton1";
import ProgressBar from "../components/ProgressBar";
import InterestCard from "../components/InterestCard";

export default function SelectInterest() {
  const [selected, setSelected] = useState([]);
  const navigate = useNavigate();
  const { state } = useLocation();

  const isValid = selected.length > 0;

  const handleToggle = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]
    );
  };

  const handleNext = () => {
    navigate("/make-traveler-profile", {
      state: {
        ...state,
        interests: selected,
      },
    });
  };

  return (
    <Wrapper>
      <Top>
        <ProgressBar step={3} onBack={() => navigate(-1)}/>
      </Top>

      <Middle>
        <StartComent coment={"무엇을 좋아하세요?"} />
        <SubText>관심사는 나중에 수정할 수 있어요</SubText>
      </Middle>

      <ButtonArea>
        <InterestCard selected={selected} onToggle={handleToggle} />
      </ButtonArea>

      <Bottom>
        <NextButton isValid={isValid} onClick={handleNext} />
      </Bottom>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  min-height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
  padding: 24px 0;
  box-sizing: border-box;
  font-family: "Pretendard", sans-serif;
`;

const Top = styled.div`
  display: flex;
  justify-content: center;
`;

const Middle = styled.div`
  padding: 1.8rem 0 1.5rem;
`;

const SubText = styled.div`
  padding: .5rem 1.9375rem 1.5rem;
  font-size: 0.875rem;
  font-weight: 400;
  color: #ACACAC;
`;

const ButtonArea = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 1.3125rem 8rem;
  flex: 1;
`;

const Bottom = styled.div`
  display: flex;
  justify-content: center;
  padding: 0 1.3125rem;
`;
