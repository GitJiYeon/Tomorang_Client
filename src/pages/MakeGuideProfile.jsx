import { useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styled from "styled-components";
import ProgressBar from "../components/ProgressBar";
import StartComent from "../components/StartComent";
import NextButton from "../components/NextButton1";
import DefaultProfileIcon from "../assets/defaultProfile.svg";
import ImageIcon from "../assets/imageIcon.svg";
import RemoveIcon from "../assets/removeIcon.svg";

export default function MakeGuideProfile() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const fileInputRef = useRef(null);
  const [profileImage, setProfileImage] = useState(null);
  const [nickname, setNickname] = useState("");
  const [city, setCity] = useState("");
  const [bio, setBio] = useState("");
  const [tags, setTags] = useState(state?.interests ?? ["맛집", "애니메이션", "풍경"]);

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setProfileImage(URL.createObjectURL(file));
  };

  const removeTag = (tag) => {
    if (tags.length <= 1) return;
    setTags((prev) => prev.filter((item) => item !== tag));
  };

  return (
    <Wrapper>
      <Top>
        <ProgressBar step={4} onBack={() => navigate(-1)} />
      </Top>

      <Middle>
        <StartComent coment={"프로필을 만들어 볼까요?"} />
      </Middle>

      <Content>
        <ProfileArea>
          <ProfileCircle onClick={() => fileInputRef.current?.click()}>
            <ProfileImg src={profileImage || DefaultProfileIcon} alt="프로필" />
          </ProfileCircle>
          <CameraButton type="button" onClick={() => fileInputRef.current?.click()}>
            <img src={ImageIcon} alt="사진 변경" />
          </CameraButton>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={handleImageChange}
          />
        </ProfileArea>

        <FieldLabel>닉네임</FieldLabel>
        <Input placeholder="닉네임을 입력하세요" value={nickname} onChange={(e) => setNickname(e.target.value)} />

        <FieldLabel>활동도시</FieldLabel>
        <Input placeholder="Seoul, Tokyo..." value={city} onChange={(e) => setCity(e.target.value)} />

        <FieldLabel>한마디</FieldLabel>
        <Input placeholder="안녕하세요 잘 부탁..." value={bio} onChange={(e) => setBio(e.target.value)} />

        <FieldLabel>관심사</FieldLabel>
        <TagRow>
          {tags.map((tag) => (
            <Tag key={tag}>
              {tag}
              <TagRemove src={RemoveIcon} alt="제거" onClick={() => removeTag(tag)} />
            </Tag>
          ))}
        </TagRow>
      </Content>

      <Bottom>
        <NextButton
          isValid={nickname.trim().length > 0 && city.trim().length > 0}
          onClick={() => navigate("/guide-welcome")}
        />
      </Bottom>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  width: 390px;
  min-height: 100dvh;
  margin: 0 auto;
  padding: 24px 0 16px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  background: #fff;
  font-family: Pretendard, sans-serif;
`;

const Top = styled.div`
  display: flex;
  justify-content: center;
`;

const Middle = styled.div`
  padding: 47px 0 28px;
`;

const Content = styled.div`
  flex: 1;
  padding: 0 22px;
`;

const ProfileArea = styled.div`
  position: relative;
  width: 104px;
  height: 104px;
  margin: 0 auto 22px;
`;

const ProfileCircle = styled.div`
  width: 104px;
  height: 104px;
  border-radius: 50%;
  border: 1.5px solid #c5f598;
  overflow: hidden;
  background: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ProfileImg = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const CameraButton = styled.button`
  position: absolute;
  right: -2px;
  bottom: 2px;
  width: 34px;
  height: 34px;
  border: 2px solid #fff;
  border-radius: 50%;
  background: #c5f598;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;

  img {
    width: 20px;
    height: 20px;
  }
`;

const FieldLabel = styled.label`
  display: block;
  margin: 14px 10px 8px;
  color: #111;
  font-size: 12px;
  font-weight: 700;
`;

const Input = styled.input`
  width: 100%;
  height: 52px;
  padding: 0 14px;
  border: 1px solid #dadada;
  border-radius: 10px;
  box-sizing: border-box;
  color: #111;
  font-size: 13px;
  outline: none;

  &::placeholder {
    color: #acacac;
  }
`;

const TagRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
`;

const Tag = styled.div`
  height: 36px;
  padding: 0 12px 0 22px;
  border: 1px solid #4e4e4e;
  border-radius: 18px;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #111;
  font-size: 13px;
`;

const TagRemove = styled.img`
  width: 7px;
  height: 7px;
  padding: 8px;
`;

const Bottom = styled.div`
  padding: 24px 22px 0;
  display: flex;
  justify-content: center;
`;
