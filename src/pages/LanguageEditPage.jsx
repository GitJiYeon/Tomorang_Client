import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import Header from "../components/Header";
import NextButton from "../components/NextButton1";
import LanguageButton from "../components/LanguageButton";

import KoreaIcon   from "../assets/koreaLogo.svg";
import JapanIcon   from "../assets/japanLogo.svg";
import AmericaIcon from "../assets/americaLogo.svg";

const LANGUAGES = [
  { icon: KoreaIcon,   title: "한국어", subtitle: "한국어",  languageCode: "KR" },
  { icon: JapanIcon,   title: "일본어", subtitle: "日本語",  languageCode: "JP" },
  { icon: AmericaIcon, title: "영어",   subtitle: "English", languageCode: "EN" },
];

export default function LanguageEditPage() {
  const navigate = useNavigate();

  // localStorage에서 기존 언어 선택값 불러오기
  const savedLanguages = JSON.parse(localStorage.getItem("languages") ?? "[]");
  const savedMap = Object.fromEntries(savedLanguages.map(({ code, level }) => [code, level]));

  const [selections, setSelections] = useState(
    Object.fromEntries(LANGUAGES.map((l) => [l.languageCode, savedMap[l.languageCode] ?? null]))
  );

  const handleSelect = ({ languageCode, level }) => {
    setSelections((prev) => ({ ...prev, [languageCode]: level }));
  };

  const isValid = Object.values(selections).some(Boolean);

  const handleComplete = () => {
    const languages = Object.entries(selections)
      .filter(([, level]) => level)
      .map(([code, level]) => ({ code, level }));

    // localStorage에 언어 저장 + profile에도 반영
    localStorage.setItem("languages", JSON.stringify(languages));
    const saved = JSON.parse(localStorage.getItem("profile") ?? "{}");
    localStorage.setItem("profile", JSON.stringify({ ...saved, languages }));

    navigate(-1);
  };

  return (
    <Wrapper>
      <Header coment={"언어 재설정"} />
      <ButtonArea>
        {LANGUAGES.map((lang) => (
          <LanguageButton
            key={lang.languageCode}
            icon={lang.icon}
            title={lang.title}
            subtitle={lang.subtitle}
            languageCode={lang.languageCode}
            selectedLevel={selections[lang.languageCode]}
            onSelect={handleSelect}
          />
        ))}
      </ButtonArea>
      <Bottom>
        <NextButton isValid={isValid} onClick={handleComplete} />
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
`;

const ButtonArea = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem 1.3125rem;
  flex: 1;
`;

const Bottom = styled.div`
  display: flex;
  justify-content: center;
  padding: 0 1.3125rem 2rem;
`;