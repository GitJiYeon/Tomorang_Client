import { useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import StartComent from "../components/StartComent";
import NextButton from "../components/NextButton1";
import ProgressBar from "../components/ProgressBar";
import InterestCard from "../components/InterestCard";

export default function GuideSelectInterest() {
  const [selected, setSelected] = useState([]);
  const navigate = useNavigate();

  const handleToggle = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((value) => value !== id) : [...prev, id]
    );
  };

  return (
    <Wrapper>
      <Top>
        <ProgressBar step={3} onBack={() => navigate(-1)} />
      </Top>
      <Middle>
        <StartComent coment={"무엇을 안내하고 싶나요?"} />
        <SubText>관심사는 나중에 수정할 수 있어요</SubText>
      </Middle>
      <ButtonArea>
        <InterestCard selected={selected} onToggle={handleToggle} />
      </ButtonArea>
      <Bottom>
        <NextButton
          isValid={selected.length > 0}
          onClick={() => navigate("/make-guide-profile", { state: { interests: selected } })}
        />
      </Bottom>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  width: 390px;
  min-height: 100dvh;
  margin: 0 auto;
  padding: 24px 0;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  background: #fff;
  font-family: Pretendard, sans-serif;
`;

const Top = styled.div`
  display: flex;
  justify-content: center;
`;

const Middle = styled.div`
  padding: 29px 0 24px;
`;

const SubText = styled.div`
  padding: 8px 31px 24px;
  color: #acacac;
  font-size: 14px;
`;

const ButtonArea = styled.div`
  flex: 1;
  padding: 0 21px 80px;
`;

const Bottom = styled.div`
  padding: 0 21px;
  display: flex;
  justify-content: center;
`;
