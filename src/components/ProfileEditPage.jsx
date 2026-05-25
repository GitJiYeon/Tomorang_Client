import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import Header from "../components/Header";
import DefaultProfileIcon from "../assets/defaultProfile.svg";
import ImageIcon from "../assets/imageIcon.svg";

export default function ProfileEditPage() {
  const navigate = useNavigate();

  // localStorage에서 기존 프로필 불러오기
  const saved = JSON.parse(localStorage.getItem("profile") ?? "{}");

  const [profileImage, setProfileImage] = useState(saved.profileImage ?? null);
  const [nickname, setNickname] = useState(saved.nickname ?? "");
  const [bio, setBio] = useState(saved.bio ?? "");

  const fileInputRef = useRef(null);

  const handleImageClick = () => fileInputRef.current?.click();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setProfileImage(URL.createObjectURL(file));
  };

  const handleComplete = () => {
    const languages = JSON.parse(localStorage.getItem("languages") ?? "[]");
    localStorage.setItem("profile", JSON.stringify({
      ...saved,
      profileImage,
      nickname,
      bio,
      languages,
    }));
    navigate(-1);
  };

  return (
    <Wrapper>
      <Header coment={"프로필 수정"} />

      <Content>
        {/* 프로필 이미지 */}
        <ProfileArea>
          <ProfileCircle onClick={handleImageClick}>
            <ProfileImg
              src={profileImage || DefaultProfileIcon}
              alt="프로필"
            />
          </ProfileCircle>
          <CameraBtn onClick={handleImageClick}>
            <img src={ImageIcon} alt="사진 변경" width={24} height={24} />
          </CameraBtn>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={handleImageChange}
          />
        </ProfileArea>

        {/* 닉네임 */}
        <FieldLabel>닉네임</FieldLabel>
        <Input
          type="text"
          placeholder="닉네임을 입력하세요"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          maxLength={20}
        />

        {/* 한마디 */}
        <FieldLabel>한마디</FieldLabel>
        <Input
          type="text"
          placeholder="안녕하세요 잘 부탁..."
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          maxLength={50}
        />

        {/* 관심사 */}
        <FieldLabel>관심사</FieldLabel>
        <ResetButton onClick={() => navigate("/edit-interest")}>
          <ResetText>관심사 재설정 하기</ResetText>
        </ResetButton>

        {/* 언어 */}
        <FieldLabel>언어</FieldLabel>
        <ResetButton onClick={() => navigate("/edit-language")}>
          <ResetText>언어 재설정하기</ResetText>
        </ResetButton>
      </Content>

      <Bottom>
        <CompleteButton onClick={handleComplete}>수정 완료</CompleteButton>
      </Bottom>
    </Wrapper>
  );
}

/* ─── Styled Components ─── */

const Wrapper = styled.div`
  min-height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  font-family: "Pretendard", sans-serif;
`;

const Content = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 0 1.3125rem;
`;

const ProfileArea = styled.div`
  position: relative;
  width: 110px;
  height: 110px;
  align-self: center;
  margin: 1.5rem 0;
`;

const ProfileCircle = styled.div`
  width: 110px;
  height: 110px;
  border-radius: 50%;
  border: 2px solid #C5F598;
  overflow: hidden;
  background: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
`;

const ProfileImg = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const CameraBtn = styled.div`
  position: absolute;
  bottom: -5px;
  right: -5px;
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: #C5F598;
  border: 1.5px solid #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
`;

const FieldLabel = styled.div`
  font-size: 0.875rem;
  font-weight: 700;
  color: #111;
  margin: 1.25rem 1rem 0.5rem;
`;

const Input = styled.input`
  width: 100%;
  height: 52px;
  border-radius: 10px;
  border: 1px solid #DADADA;
  padding: 0 14px;
  box-sizing: border-box;
  font-family: "Pretendard", sans-serif;
  font-size: 0.875rem;
  color: #111;
  outline: none;

  &::placeholder {
    color: #ACACAC;
  }

  &:focus {
    border-color: #B1DD89;
  }
`;

const ResetButton = styled.button`
  width: 100%;
  height: 52px;
  border-radius: 10px;
  border: 1px solid #DADADA;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-sizing: border-box;
`;

const ResetText = styled.span`
  color: #ACACAC;
  text-align: center;
  font-family: Inter;
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
`;

const Bottom = styled.div`
  padding: 1.5rem 1.3125rem 2rem;
`;

const CompleteButton = styled.button`
  width: 100%;
  height: 52px;
  border-radius: 10px;
  background: #C5F598;
  border: none;
  color: #111;
  font-family: Pretendard;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
`;