import styled from "styled-components";
import { useI18n } from "../i18n/I18nProvider";

export const NATIONALITY_OPTIONS = [
  { value: "한국", label: "한국", language: "ko" },
  { value: "일본", label: "일본", language: "ja" },
];

export default function NationalitySelector({ value, onChange }) {
  const { t } = useI18n();

  return (
    <Wrapper>
      <StyledLabel>{t("국적")}</StyledLabel>
      <ButtonRow>
        {NATIONALITY_OPTIONS.map((option) => (
          <OptionButton
            key={option.value}
            type="button"
            $selected={value === option.value}
            onClick={() => onChange(option)}
          >
            {t(option.label)}
          </OptionButton>
        ))}
      </ButtonRow>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  margin: 0 21px 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const StyledLabel = styled.label`
  color: #4e4e4e;
  font-size: 12px;
  font-weight: 700;
  margin-left: 16px;
`;

const ButtonRow = styled.div`
  width: var(--app-content-width);
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
`;

const OptionButton = styled.button`
  height: 52px;
  border: 1px solid ${({ $selected }) => ($selected ? "#c5f598" : "#dadada")};
  border-radius: 12px;
  background: ${({ $selected }) => ($selected ? "#c5f598" : "#fff")};
  color: #111;
  font-family: Pretendard, "Noto Sans KR", sans-serif;
  font-size: 14px;
  font-weight: ${({ $selected }) => ($selected ? 700 : 500)};
  cursor: pointer;
`;
