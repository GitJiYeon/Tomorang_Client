import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import Header from "../components/Header";
import InterestCard from "../components/InterestCard";
import NextButton from "../components/NextButton1";

export default function InterestEditPage() {
  const navigate = useNavigate();

  // localStorage에서 기존 관심사 불러오기
  const saved = JSON.parse(localStorage.getItem("profile") ?? "{}");
  const initialInterests = Array.isArray(saved.interests)
    ? saved.interests
    : String(saved.interest ?? "")
        .split(",")
        .map((interest) => interest.trim())
        .filter(Boolean);
  const [selected, setSelected] = useState(initialInterests);

  const isValid = selected.length > 0;

  const handleToggle = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]
    );
  };

  const handleComplete = () => {
    // 기존 profile에 interests만 덮어쓰기
    localStorage.setItem("profile", JSON.stringify({
      ...saved,
      interests: selected,
      interest: selected.join(", "),
    }));
    navigate(-1);
  };

  return (
    <Wrapper>
      <Header coment={"관심사 재설정"} />

      <ButtonArea>
        <InterestCard selected={selected} onToggle={handleToggle} />
      </ButtonArea>

      <Bottom>
        <NextButton isValid={isValid} onClick={handleComplete} label="완료" />
      </Bottom>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  min-height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  font-family: "Pretendard", sans-serif;
`;

const ButtonArea = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem 1.3125rem 8rem;
  flex: 1;
`;

const Bottom = styled.div`
  display: flex;
  justify-content: center;
  padding: 0 1.3125rem 2rem;
`;
