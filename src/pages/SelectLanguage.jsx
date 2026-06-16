import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styled from "styled-components";
import NextButton from "../components/NextButton1";
import ProgressBar from "../components/ProgressBar";
import StartComent from "../components/StartComent";
import LanguageButton from "../components/LanguageButton";

import KoreaIcon   from "../assets/koreaLogo.svg";
import JapanIcon   from "../assets/japanLogo.svg";
import AmericaIcon from "../assets/americaLogo.svg";

const LANGUAGES = [
  { icon: KoreaIcon,   title: "한국어", subtitle: "한국어",  languageCode: "ko" },
  { icon: JapanIcon,   title: "일본어", subtitle: "日本語",  languageCode: "ja" },
  { icon: AmericaIcon, title: "영어",   subtitle: "English", languageCode: "en" },
];

function SelectLanguage() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const [selections, setSelections] = useState(
    Object.fromEntries(LANGUAGES.map((l) => [l.languageCode, null]))
  );
  const [openCode, setOpenCode] = useState(null);

  const handleToggle = (languageCode) => {
    setOpenCode((prev) => (prev === languageCode ? null : languageCode));
  };

  const handleSelect = ({ languageCode, level }) => {
    setSelections((prev) => ({ ...prev, [languageCode]: level }));
    setOpenCode(null); // 숙련도 선택 시 드롭다운 자동 닫기
  };

  const isValid = Object.values(selections).some(Boolean);

  const handleNext = () => {
    const payload = Object.entries(selections)
      .filter(([, level]) => level)
      .map(([languageCode, level]) => ({ languageCode, level }));
    navigate("/interest", {
      state: {
        ...state,
        selectedLanguages: payload,
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
        {LANGUAGES.map((lang) => (
          <LanguageButton
            key={lang.languageCode}
            icon={lang.icon}
            title={lang.title}
            subtitle={lang.subtitle}
            languageCode={lang.languageCode}
            selectedLevel={selections[lang.languageCode]}
            isOpen={openCode === lang.languageCode}
            onToggle={handleToggle}
            onSelect={handleSelect}
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
  min-height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
  padding: 24px 0;
  box-sizing: border-box;
`;

const Top = styled.div`
  display: flex;
  justify-content: center;
`;

const Middle = styled.div`
  padding: 2.9375rem 0 1.5rem;
`;

const ButtonArea = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 1.3125rem;
  flex: 1;
`;

const Bottom = styled.div`
  display: flex;
  justify-content: center;
  padding: 0 1.3125rem;
`;

export default SelectLanguage;