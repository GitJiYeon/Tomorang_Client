import styled from "styled-components";

export default function LogoutButton() {
  return (
    <ButtonWrapper>
      <LogoutContainer>
        <LogoutText>로그아웃</LogoutText>
      </LogoutContainer>
    </ButtonWrapper>
  );
}

const ButtonWrapper = styled.div`
  position: relative;
  bottom: 25px; /* nav(bottom 16 + height 68) + 22px */
  left: 50%;
  transform: translateX(-50%);
  width: 390px;
  max-width: 100vw;

  display: flex;
  justify-content: center;

  z-index: 201;
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

  cursor: pointer;
`;

const LogoutText = styled.span`
  width: 75px;
  height: 19px;

  color: #fff;
  text-align: center;
  font-family: Pretendard;
  font-size: 14px;
  font-style: normal;
  font-weight: 500;
  line-height: normal;
`;