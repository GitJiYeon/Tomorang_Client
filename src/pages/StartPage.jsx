import React, { useState } from "react";
import logo from "../assets/logo.svg";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { useI18n } from "../i18n/I18nProvider";
import ExhibitionNotice from "../components/ExhibitionNotice";

function StartPage(){
    const navigate = useNavigate();
    const { t } = useI18n();
    const [noticeMessage, setNoticeMessage] = useState("");

    return(
        <Container>
            <Logo src={logo} alt={t("로고")}></Logo>
            <Catchphrase>{t("나의 첫 번째 로컬 친구, 토모랑")}</Catchphrase>
            <LoginButton onClick={() => navigate("/login")}>{t("로그인")}</LoginButton>
            <SignupButton onClick={() => setNoticeMessage("현재 회원가입은 전시중에 지원하지 않습니다.")}>{t("회원가입")}</SignupButton>
            <ExhibitionNotice message={noticeMessage} onClose={() => setNoticeMessage("")} />
        </Container>
    )
}
export default StartPage;

const Container = styled.div`
    background-color:#C5F598;
    width: min(var(--app-page-width), 100vw);
    height: 100dvh;
    min-height: 100dvh;
    max-height: 100dvh;
    margin: 0 auto;
    display:flex;
    flex-direction:column;
    align-items:center;
    justify-content: flex-end;
    box-sizing: border-box;
    overflow: hidden;
    padding: 0 21px 34px;
`
const Catchphrase = styled.p`
    color:#4E4E4E;
    margin: 12px 0 0;
`
const Logo = styled.img`
    width:143px;
    height:97px;
    margin-bottom:0;
`
const LoginButton = styled.button`
    margin-top:225px;
    width: 100%;
    height: 56px;
    border-radius: 12px;
    background: #111;
    color:#fff;
    border: none;
`
const SignupButton = styled.button`
    width: 100%;
    height: 56px;
    border-radius: 12px;
    background: #C5F598;
    margin-top:10px;
    border: 1px solid #111;
`
