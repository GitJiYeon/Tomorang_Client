import React, { useState,useEffect } from 'react';
import styled,{keyframes } from 'styled-components';
import StartComent from '../components/StartComent';
import BackArrow from "../assets/backarrow.svg";
import StartPage from './StartPage';
import { useNavigate } from "react-router-dom";
import logo from '../assets/logo.svg';

function LoginPage(){
  const [saveInfo, setSaveInfo] = useState(false);
  const navigate = useNavigate();
  const [isClosing, setIsClosing] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const handleBack = () => {
    setIsClosing(true);
  
    setTimeout(() => {
      navigate(-1);
    }, 400); // slideDown 시간과 맞추기
  };
  useEffect(() => {
    setTimeout(() => {
      setIsVisible(true);
    }, 10);
  }, []);

  const handleLogin = () => {
    if (!isVisible) return; // 애니메이션 전엔 클릭 무시
    navigate("/main");
  };

  return (
    <PageContainer>
      {/* 상단 연두색 영역 & 뒤로가기 */}
      <TopSection>
        <BackButton onClick={handleBack}>
          <img src={BackArrow} alt="뒤로가기" />
        </BackButton>
        <Logowrap>
          <Logo src={logo} alt="로고"></Logo>
          <Catchphrase>나의 첫 번째 로컬 친구, 토모랑</Catchphrase>
        </Logowrap>
      </TopSection>

      {/* 하단 화이트 카드 영역 */}
      <WhiteCard $isClosing={isClosing} $isVisible={isVisible}>
        <div style={{ marginTop: '40px' }}>
          <StartComent coment={'어서오세요<br/>다시 돌아오셔서 기뻐요'} />
        </div>

        <FormContainer>
          {/* 아이디 입력 */}
          <InputGroup>
            <label>아이디</label>
            <input type="text" placeholder="아이디를 입력하세요" />
          </InputGroup>

          {/* 비밀번호 입력 */}
          <InputGroup>
            <label>비밀번호</label>
            <input type="password" placeholder="비밀번호를 입력하세요" />
          </InputGroup>

          {/* 로그인 정보 저장하기 */}
          <CheckboxContainer onClick={() => setSaveInfo(!saveInfo)}>
            <CustomCheckbox $checked={saveInfo}>
              {saveInfo && (
                <svg width="12" height="9" viewBox="0 0 12 9" fill="none">
                  <path d="M1 4L4.5 7.5L11 1" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              )}
            </CustomCheckbox>
            <span>로그인 정보 저장하기</span>
          </CheckboxContainer>
        </FormContainer>

        <LoginButton onClick={handleLogin}>로그인</LoginButton>
      </WhiteCard>
    </PageContainer>
  );
};

export default LoginPage;

// --- 스타일 정의 ---
const slideUp = keyframes`
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
`;
const slideDown = keyframes`
  from {
    transform: translateY(0);
  }
  to {
    transform: translateY(100%);
  }
`;
const PageContainer = styled.div`
  width: 390px;
  height: 844px;
  background-color: #C5F598;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
  position:absolute;
`;

const TopSection = styled.div`
  height: 160px;
`;

const BackButton = styled.button`
  position:absolute;
  margin-left:16px;
  margin-top:64px;
  background: none;
  border: none;
  cursor: pointer;
  img { width: 24px; height: 24px; }
`;

const WhiteCard = styled.div`
  flex: 1;
  background-color: #ffffff;
  border-top-left-radius: 40px;
  border-top-right-radius: 40px;
  display: flex;
  flex-direction: column;

  transform: translateY(${({ $isClosing, $isVisible }) =>
    $isClosing ? "100%" : $isVisible ? "0" : "100%"});

  transition: transform 0.4s cubic-bezier(0.22, 1, 0.36, 1);
`;


const FormContainer = styled.div`
  width:348px;
  height:210px;
  padding:0 21px;
  margin-top: 24px;
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;

  label {
    color: #4E4E4E;
  font-size: 12px;
  font-style: normal;
  font-weight: 700;
  line-height: normal;
  margin-left: 16px;
  }

  input {
    width: 348px;
    height: 56px;
    border: 1px solid #DADADA;
    border-radius: 12px;
    padding: 17px 20px;
    box-sizing: border-box;
    color: #ACACAC;
    font-family: Pretendard;
    font-size: 14px;
    font-style: normal;
    font-weight: 400;
    line-height: normal;
    &::placeholder { color: #BCBCBC; }
    &:focus { outline: 1px solid #94B872; }
  }
`;

const CheckboxContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  span {
    font-size: 14px;
    color: #4E4E4E;
  }
`;

const CustomCheckbox = styled.div`
  width: 20px;
  height: 20px;
  border-radius: 4px;
  background-color: ${props => props.$checked ? '#94B872' : '#E5E7EB'};
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;
`;

const LoginButton = styled.button`
  width: 330px;
  height: 54px;
  background-color: #121212;
  color: #ffffff;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  margin: auto auto 40px auto; /* 하단 배치 */
  cursor: pointer;
  &:active { opacity: 0.8; }
`;
const Logo = styled.img`
  width:143px;
  height:97px;
  margin-top:335px;
  margin-bottom:12px;
`
const Catchphrase = styled.p`
    color:#4E4E4E;
`
const Logowrap = styled.div`
  background-color:#C5F598;
  width:390px;
  height:844px;
  display:flex;
  flex-direction:column;
  align-items:center;
`