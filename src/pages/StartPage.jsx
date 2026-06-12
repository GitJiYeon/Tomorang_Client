import React, {useState,useEffect} from "react";
import logo from "../assets/logo.svg";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";

function StartPage(){
    const navigate = useNavigate();
    return(
        <Container>
            <Logo src={logo} alt="로고"></Logo>
            <Catchphrase>나의 첫 번째 로컬 친구, 토모랑</Catchphrase>
            <LoginButton onClick={() => navigate("/login")}>로그인</LoginButton>
            <SignupButton onClick={() => navigate("/role")}>회원가입</SignupButton>
        </Container>
    )
}
export default StartPage;

const Container = styled.div`
    background-color:#C5F598;
    width: min(390px, 100vw);
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
