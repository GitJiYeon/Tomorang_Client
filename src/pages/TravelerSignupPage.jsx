import { useState } from "react";
import ProgressBar from "../components/ProgressBar";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import InputField from "../components/InputField";
import NextButton from "../components/NextButton1";
import StartComent from "../components/StartComent";
import MailInput from "../components/MailInput";
import NationalitySelector from "../components/NationalitySelector";
import { useI18n } from "../i18n/I18nProvider";

function TravelerSignupPage(){
    const navigate = useNavigate();
    const { setLanguage } = useI18n();
    
    const [formData, setFormData] = useState({
        userId: "",
        password: "",
        passwordConfirm: "",
        email: "",
        nationality: "",
        defaultLanguage: "",
    });

    const handleChange = (field) => (e) => {
        setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    };

    const handleNationalityChange = (option) => {
        setFormData((prev) => ({
            ...prev,
            nationality: option.value,
            defaultLanguage: option.language,
        }));
        setLanguage(option.language);
    };

    // 모든 필드가 채워져 있고 비밀번호가 일치할 때만 활성화
    const isValid =
        Object.values(formData).every((v) => v.trim() !== "") &&
        formData.password === formData.passwordConfirm;

    const handleNext = () => {
        navigate("/language", { state: { formData } });
    };
      
    return(
        <Container>
            <Header>
                <ProgressBar step={1} onBack={() => navigate(-1)} />
            </Header>
            <Wrap>
                <StartComent coment={'가입을 위한 정보를<br/>입력해주세요'}></StartComent>
            </Wrap>
            <Form>
                <InputField
                    label="아이디"
                    type="text"
                    placeholder="아이디를 입력하세요"
                    value={formData.userId}
                    onChange={handleChange("userId")}
                />
                <InputField
                    label="비밀번호"
                    type="password"
                    placeholder="비밀번호를 입력하세요"
                    value={formData.password}
                    onChange={handleChange("password")}
                />
                <InputField
                    label="비밀번호 확인"
                    type="password"
                    placeholder="비밀번호를 다시 입력하세요"
                    value={formData.passwordConfirm}
                    onChange={handleChange("passwordConfirm")}
                />
                <MailInput
                    label="이메일"
                    onChange={handleChange("email")}
                />
                <NationalitySelector
                    value={formData.nationality}
                    onChange={handleNationalityChange}
                />
            </Form>
            <Bottom>
                <NextButton isValid={isValid} onClick={handleNext} /> 
            </Bottom>
        </Container>
    );
}

// styled-components 동일 유지
const Container = styled.div`
    min-height: 100vh;
    width: 100%;
    display: flex;
    flex-direction: column;
    padding: 24px 0;
    box-sizing: border-box;
`
const Header = styled.div`
    display: flex;
    justify-content: center;
`
const Wrap = styled.div`
    padding-top:53px;
    padding-bottom:24px;
`
const Form = styled.div`
    width:var(--app-content-width);
    min-height:364px;
`
const Bottom = styled.div`
    margin-top:48px;
    display:flex;
    justify-content: center;
`

export default TravelerSignupPage;
