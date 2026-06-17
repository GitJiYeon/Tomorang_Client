/*
호출방법
  const handleNext = () => {
    navigate("/make-traveler-profile", { state: { interests: selected } });
  };
*/

/* <NextButton isValid={true} onClick={handleNext} /> */
import styled from "styled-components";
import { useI18n } from "../i18n/I18nProvider";

function NextButton({ isValid, onClick }) {
  const { t } = useI18n();

  return (
    <Button disabled={!isValid} onClick={isValid ? onClick : undefined}>
      {t("다음")}
    </Button>
  );
}

const Button = styled.button`
  width: 100%;
  max-width: var(--app-content-width);
  height: 56px;
  border-radius: 12px;
  border: none;
  cursor: ${({ disabled }) => (disabled ? "default" : "pointer")};

  display: flex;
  justify-content: center;
  align-items: center;

  background-color: ${({ disabled }) => (disabled ? "#EDFCDF" : "#C5F598")};

  color: ${({ disabled }) => (disabled ? "#FFFFFF" : "#111111")};

  font-family: "Pretendard", sans-serif;
  font-weight: 500;
  font-size: 14px;
  line-height: 100%;
  letter-spacing: 0%;

  ${({ disabled }) =>
    !disabled &&
    `
    &:active {
      border: 1px solid #000;
    }
  `}
`;

export default NextButton;
