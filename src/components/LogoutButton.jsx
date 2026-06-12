import styled from "styled-components";

export default function LogoutButton({ onClick, disabled = false }) {
  return (
    <ButtonWrapper>
      <LogoutContainer type="button" onClick={onClick} disabled={disabled}>
        <LogoutText>{disabled ? "로그아웃 중..." : "로그아웃"}</LogoutText>
      </LogoutContainer>
    </ButtonWrapper>
  );
}

const ButtonWrapper = styled.div`
  width: min(390px, 100%);
  max-width: 100vw;
  display: flex;
  justify-content: center;
  padding: 20px 0 calc(104px + env(safe-area-inset-bottom));
  margin: 0 auto;
`;

const LogoutContainer = styled.button`
  width: 348px;
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
