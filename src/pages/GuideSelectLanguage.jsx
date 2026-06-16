import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styled from "styled-components";
import NextButton from "../components/NextButton1";
import ProgressBar from "../components/ProgressBar";
import StartComent from "../components/StartComent";
import LanguageButton from "../components/LanguageButton";
import KoreaIcon from "../assets/koreaLogo.svg";
import JapanIcon from "../assets/japanLogo.svg";
import AmericaIcon from "../assets/americaLogo.svg";

const LANGUAGES = [
  { icon: KoreaIcon, title: "한국어", subtitle: "한국어", languageCode: "ko" },
  { icon: JapanIcon, title: "일본어", subtitle: "日本語", languageCode: "ja" },
  { icon: AmericaIcon, title: "영어", subtitle: "English", languageCode: "en" },
];

export default function GuideSelectLanguage() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const [selections, setSelections] = useState(
    Object.fromEntries(LANGUAGES.map((language) => [language.languageCode, null]))
  );

  const isValid = Object.values(selections).some(Boolean);

  const handleNext = () => {
    const selectedLanguages = Object.entries(selections)
      .filter(([, level]) => level)
      .map(([languageCode, level]) => ({ languageCode, level }));

    navigate("/guide-interest", {
      state: {
        ...state,
        selectedLanguages,
      },
    });
  };

  return (
    <Wrapper>
      <Top>
        <ProgressBar step={2} onBack={() => navigate(-1)} />
      </Top>
      <Middle>
        <StartComent coment={"사용할 수 있는<br/>언어를 선택해주세요"} />
      </Middle>
      <ButtonArea>
        {LANGUAGES.map((language) => (
          <LanguageButton
            key={language.languageCode}
            {...language}
            selectedLevel={selections[language.languageCode]}
            onSelect={({ languageCode, level }) =>
              setSelections((prev) => ({ ...prev, [languageCode]: level }))
            }
          />
        ))}
      </ButtonArea>
      <Bottom>
        <NextButton isValid={isValid} onClick={handleNext} />
      </Bottom>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  width: var(--app-page-width);
  min-height: 100dvh;
  margin: 0 auto;
  padding: 24px 0;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  background: #fff;
`;

const Top = styled.div`
  display: flex;
  justify-content: center;
`;

const Middle = styled.div`
  padding: 47px 0 24px;
`;

const ButtonArea = styled.div`
  flex: 1;
  padding: 0 21px;
`;

const Bottom = styled.div`
  padding: 0 21px;
  display: flex;
  justify-content: center;
`;
