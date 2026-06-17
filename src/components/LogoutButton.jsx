import styled from "styled-components";
import { useI18n } from "../i18n/I18nProvider";

export default function LogoutButton({ onClick, disabled = false }) {
  const { t } = useI18n();

  return (
    <ButtonWrapper>
      <LogoutContainer type="button" onClick={onClick} disabled={disabled}>
        <LogoutText>{disabled ? t("로그아웃 중...") : t("로그아웃")}</LogoutText>
      </LogoutContainer>
    </ButtonWrapper>
  );
}

const ButtonWrapper = styled.div`
  width: min(var(--app-page-width), 100%);
  max-width: 100vw;
  display: flex;
  justify-content: center;
  padding: 20px 0 var(--app-bottom-action-padding);
  margin: 0 auto;
`;

const LogoutContainer = styled.button`
  width: var(--app-content-width);
  height: 56px;
  border: none;
  border-radius: 213px;
  background: #ffa362;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: ${({ disabled }) => (disabled ? "default" : "pointer")};
  opacity: ${({ disabled }) => (disabled ? 0.7 : 1)};
`;

const LogoutText = styled.span`
  color: #fff;
  text-align: center;
  font-family: Pretendard;
  font-size: 14px;
  font-weight: 500;
`;
