import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styled from "styled-components";
import ProgressBar from "../components/ProgressBar";
import NextButton from "../components/NextButton1";
import LogoIcon from "../assets/logoIcon.svg";
import { useI18n } from "../i18n/I18nProvider";

const NATIONALITY_OPTIONS = [
  { value: "한국", label: "한국", language: "ko" },
  { value: "일본", label: "일본", language: "ja" },
];

export default function GuideSignupPage() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { t, setLanguage } = useI18n();
  const isSwitchMode = state?.mode === "switch";
  const savedProfile = JSON.parse(localStorage.getItem("profile") ?? "{}");
  const currentUserId = localStorage.getItem("userId") || savedProfile.id || "";
  const [formData, setFormData] = useState({
    userId: isSwitchMode ? currentUserId : "",
    password: "",
    passwordConfirm: "",
    phone: "",
    email: "",
    domain: "gmail.com",
    nationality: "",
    defaultLanguage: "",
    ageChecked: false,
  });

  const handleChange = (field) => (event) => {
    const value = field === "ageChecked" ? event.target.checked : event.target.value;
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNationalitySelect = (option) => {
    setFormData((prev) => ({
      ...prev,
      nationality: option.value,
      defaultLanguage: option.language,
    }));
    setLanguage(option.language);
  };

  const isValid =
    formData.userId.trim() &&
    (isSwitchMode || (formData.password.trim() && formData.password === formData.passwordConfirm)) &&
    formData.phone.trim() &&
    formData.email.trim() &&
    formData.nationality.trim() &&
    formData.ageChecked;

  return (
    <Page>
      <ProgressBar step={1} onBack={() => navigate(-1)} />
      <Content>
        <Logo src={LogoIcon} alt="" />
        <Title>{isSwitchMode ? "안내자 인증 정보를" : "가입을 위한 정보를"}<br />입력해주세요</Title>

        {!isSwitchMode && (
          <>
            <Field>
              <Label>아이디</Label>
              <Input placeholder="아이디를 입력하세요" value={formData.userId} onChange={handleChange("userId")} />
            </Field>
            <Field>
              <Label>비밀번호</Label>
              <Input type="password" placeholder="비밀번호를 입력하세요" value={formData.password} onChange={handleChange("password")} />
            </Field>
            <Field>
              <Label>비밀번호 확인</Label>
              <Input type="password" placeholder="비밀번호를 다시 입력하세요" value={formData.passwordConfirm} onChange={handleChange("passwordConfirm")} />
            </Field>
          </>
        )}
        <Field>
          <Label>전화번호</Label>
          <Input placeholder="010-0000-0000" value={formData.phone} onChange={handleChange("phone")} />
        </Field>
        <Field>
          <Label>이메일</Label>
          <EmailRow>
            <EmailInput placeholder="이메일을 입력하세요" value={formData.email} onChange={handleChange("email")} />
            <At>@</At>
            <DomainSelect value={formData.domain} onChange={handleChange("domain")}>
              <option>gmail.com</option>
              <option>naver.com</option>
              <option>kakao.com</option>
            </DomainSelect>
          </EmailRow>
        </Field>
        <Field>
          <Label>국적</Label>
          <NationalityRow>
            {NATIONALITY_OPTIONS.map((option) => (
              <NationalityButton
                key={option.value}
                type="button"
                $selected={formData.nationality === option.value}
                onClick={() => handleNationalitySelect(option)}
              >
                {t(option.label)}
              </NationalityButton>
            ))}
          </NationalityRow>
        </Field>

        <Divider />
        <CheckRow>
          <CheckBox type="checkbox" checked={formData.ageChecked} onChange={handleChange("ageChecked")} />
          <span>만 19세 이상입니다.</span>
        </CheckRow>
        <VerifyButton type="button">본인인증 하기</VerifyButton>
      </Content>
      <Bottom>
        <NextButton isValid={!!isValid} onClick={() => navigate("/guide-language", { state: { formData, mode: state?.mode } })} />
      </Bottom>
    </Page>
  );
}

const Page = styled.div`
  width: var(--app-page-width);
  min-height: 100dvh;
  margin: 0 auto;
  padding: 24px 0 16px;
  box-sizing: border-box;
  background: #fff;
  font-family: Pretendard, sans-serif;
  display: flex;
  flex-direction: column;
`;

const Content = styled.div`
  flex: 1;
  padding: 26px 16px 0;
`;

const Logo = styled.img`
  width: 40px;
  height: 40px;
  margin: 0 0 12px 8px;
  filter: brightness(0);
`;

const Title = styled.h1`
  margin: 0 0 22px 8px;
  color: #111;
  font-size: 22px;
  font-weight: 800;
  line-height: 31px;
`;

const Field = styled.div`
  margin-bottom: 12px;
`;

const Label = styled.label`
  display: block;
  margin: 0 0 7px 8px;
  color: #111;
  font-size: 11px;
  font-weight: 700;
`;

const Input = styled.input`
  width: 100%;
  height: 52px;
  padding: 0 16px;
  border: 1px solid #dadada;
  border-radius: 10px;
  box-sizing: border-box;
  color: #111;
  font-size: 13px;
  outline: none;

  &::placeholder {
    color: #c7c7c7;
  }
`;

const EmailRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 24px 102px;
  align-items: center;
  gap: 8px;
`;

const EmailInput = styled(Input)`
  min-width: 0;
`;

const At = styled.span`
  color: #acacac;
  text-align: center;
  font-size: 13px;
`;

const DomainSelect = styled.select`
  height: 52px;
  padding: 0 10px;
  border: 1px solid #dadada;
  border-radius: 10px;
  color: #acacac;
  background: #fff;
  font-size: 13px;
  outline: none;
`;

const NationalityRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
`;

const NationalityButton = styled.button`
  height: 52px;
  border: 1px solid ${({ $selected }) => ($selected ? "#c5f598" : "#dadada")};
  border-radius: 10px;
  background: ${({ $selected }) => ($selected ? "#c5f598" : "#fff")};
  color: #111;
  font-family: Pretendard, sans-serif;
  font-size: 13px;
  font-weight: ${({ $selected }) => ($selected ? 700 : 500)};
  cursor: pointer;
`;

const Divider = styled.div`
  height: 1px;
  margin: 16px 0 14px;
  background: #dadada;
`;

const CheckRow = styled.label`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-left: 8px;
  color: #4e4e4e;
  font-size: 13px;
`;

const CheckBox = styled.input`
  width: 16px;
  height: 16px;
  accent-color: #94b872;
`;

const VerifyButton = styled.button`
  width: 100%;
  height: 52px;
  margin-top: 14px;
  border: 1px solid #dadada;
  border-radius: 10px;
  background: #fff;
  color: #acacac;
  font-size: 13px;
`;

const Bottom = styled.div`
  padding: 14px 16px 0;
  display: flex;
  justify-content: center;
`;
