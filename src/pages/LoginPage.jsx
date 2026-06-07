import React, { useEffect, useState } from "react";
import styled, { keyframes } from "styled-components";
import StartComent from "../components/StartComent";
import BackArrow from "../assets/backarrow.svg";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.svg";

function LoginPage() {
  const [saveInfo, setSaveInfo] = useState(false);
  const [id, setId] = useState(() => localStorage.getItem("savedLoginId") || "");
  const [pw, setPw] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();
  const apiBaseUrl =
    import.meta.env.VITE_API_BASE_URL ||
    "https://tomorangserver-production.up.railway.app";

  const handleBack = () => {
    setIsClosing(true);

    setTimeout(() => {
      navigate(-1);
    }, 400);
  };

  useEffect(() => {
    setTimeout(() => {
      setIsVisible(true);
    }, 10);
  }, []);

  const handleLogin = async () => {
    if (!isVisible || isLoading) return;

    if (!id.trim() || !pw) {
      setErrorMessage("아이디와 비밀번호를 입력해주세요.");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    try {
      const params = new URLSearchParams({
        id: id.trim(),
        pw,
      });
      const response = await fetch(`${apiBaseUrl}/api/login?${params.toString()}`, {
        method: "POST",
        headers: {
          Accept: "application/json",
        },
      });

      const contentType = response.headers.get("content-type") || "";
      const data = contentType.includes("application/json")
        ? await response.json()
        : await response.text();

      if (!response.ok) {
        const message = typeof data === "string" ? data : data.message || data.error;
        throw new Error(message || "로그인에 실패했습니다.");
      }

      const token = data.token;
      if (!token) {
        throw new Error("로그인 토큰을 받지 못했습니다.");
      }

      const tokenType = data.type || "Bearer";
      const authHeader = `${tokenType} ${token}`;
      const loginProfile = {
        id: data.id ?? id.trim(),
        nickName: data.nickName ?? "",
      };

      localStorage.setItem("accessToken", token);
      localStorage.setItem("tokenType", tokenType);
      localStorage.setItem("userId", loginProfile.id);

      let profile = loginProfile;
      try {
        const profileResponse = await fetch(`${apiBaseUrl}/api/mypage`, {
          headers: {
            Accept: "application/json",
            Authorization: authHeader,
          },
        });

        if (profileResponse.ok) {
          profile = await profileResponse.json();
        }
      } catch {
        profile = loginProfile;
      }

      localStorage.setItem("profile", JSON.stringify(profile));

      if (saveInfo) {
        localStorage.setItem("savedLoginId", id.trim());
      } else {
        localStorage.removeItem("savedLoginId");
      }

      navigate(String(profile.role).toUpperCase() === "GUIDE" ? "/guide" : "/main");
    } catch (error) {
      setErrorMessage(error.message || "서버와 연결할 수 없습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageContainer>
      <TopSection>
        <BackButton onClick={handleBack}>
          <img src={BackArrow} alt="뒤로가기" />
        </BackButton>
        <Logowrap>
          <Logo src={logo} alt="로고" />
          <Catchphrase>나의 첫 번째 로컬 친구, 토모랑</Catchphrase>
        </Logowrap>
      </TopSection>

      <WhiteCard $isClosing={isClosing} $isVisible={isVisible}>
        <div style={{ marginTop: "40px" }}>
          <StartComent coment={"어서오세요<br/>다시 찾아오셨군요"} />
        </div>

        <FormContainer>
          <InputGroup>
            <label>아이디</label>
            <input
              type="text"
              placeholder="아이디를 입력하세요"
              value={id}
              onChange={(event) => setId(event.target.value)}
              autoComplete="username"
            />
          </InputGroup>

          <InputGroup>
            <label>비밀번호</label>
            <input
              type="password"
              placeholder="비밀번호를 입력하세요"
              value={pw}
              onChange={(event) => setPw(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  handleLogin();
                }
              }}
              autoComplete="current-password"
            />
          </InputGroup>

          <CheckboxContainer onClick={() => setSaveInfo(!saveInfo)}>
            <CustomCheckbox $checked={saveInfo}>
              {saveInfo && (
                <svg width="12" height="9" viewBox="0 0 12 9" fill="none">
                  <path d="M1 4L4.5 7.5L11 1" stroke="white" strokeWidth="2" strokeLinecap="round" />
                </svg>
              )}
            </CustomCheckbox>
            <span>로그인 정보 저장하기</span>
          </CheckboxContainer>
        </FormContainer>

        {errorMessage && <ErrorText>{errorMessage}</ErrorText>}
        <LoginButton onClick={handleLogin} disabled={isLoading}>
          {isLoading ? "로그인 중..." : "로그인"}
        </LoginButton>
      </WhiteCard>
    </PageContainer>
  );
}

export default LoginPage;

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
  position: absolute;
  overflow: hidden;
`;

const TopSection = styled.div`
  height: 160px;
`;

const BackButton = styled.button`
  position: absolute;
  margin-left: 16px;
  margin-top: 64px;
  background: none;
  border: none;
  cursor: pointer;

  img {
    width: 24px;
    height: 24px;
  }
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
  animation: ${({ $isClosing }) => ($isClosing ? slideDown : "none")} 0.4s;
`;

const FormContainer = styled.div`
  width: 348px;
  height: 210px;
  padding: 0 21px;
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
    color: #111;
    font-family: Pretendard;
    font-size: 14px;
    font-style: normal;
    font-weight: 400;
    line-height: normal;

    &::placeholder {
      color: #BCBCBC;
    }

    &:focus {
      outline: 1px solid #94B872;
    }
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
  background-color: ${(props) => (props.$checked ? "#94B872" : "#E5E7EB")};
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;
`;

const ErrorText = styled.p`
  width: 330px;
  margin: 8px auto 0;
  color: #d93025;
  font-family: Pretendard, sans-serif;
  font-size: 13px;
  font-weight: 500;
`;

const LoginButton = styled.button`
  width: 330px;
  height: 54px;
  background-color: ${({ disabled }) => (disabled ? "#4E4E4E" : "#121212")};
  color: #ffffff;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  margin: auto auto 40px auto;
  cursor: ${({ disabled }) => (disabled ? "default" : "pointer")};

  &:active {
    opacity: ${({ disabled }) => (disabled ? 1 : 0.8)};
  }
`;

const Logo = styled.img`
  width: 143px;
  height: 97px;
  margin-top: 335px;
  margin-bottom: 12px;
`;

const Catchphrase = styled.p`
  color: #4E4E4E;
`;

const Logowrap = styled.div`
  background-color: #C5F598;
  width: 390px;
  height: 844px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;
