import { useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styled from "styled-components";
import ProgressBar from "../components/ProgressBar";
import StartComent from "../components/StartComent";
import NextButton from "../components/NextButton1";
import DefaultProfileIcon from "../assets/defaultProfile.svg";
import ImageIcon from "../assets/imageIcon.svg";
import RemoveIcon from "../assets/removeIcon.svg";
import { loginMember, normalizeLanguages, signupMember, updateMember } from "../api/member";
import { clearAuthStorage } from "../api/client";
import { getMypage, switchMemberRole } from "../api/tomorang";

const pickImageUrl = (...sources) => {
  for (const source of sources) {
    if (!source) continue;
    if (typeof source === "string") return source;
    const value =
      source.image ??
      source.profileImage ??
      source.profile_image ??
      source.imageUrl ??
      source.image_url ??
      source.fileUrl ??
      source.file_url ??
      source.url ??
      source.data?.image ??
      source.data?.profileImage ??
      source.data?.imageUrl;
    if (value) return value;
  }
  return "";
};

export default function MakeGuideProfile() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const fileInputRef = useRef(null);
  const [profileFile, setProfileFile] = useState(null);
  const [profileImage, setProfileImage] = useState(null);
  const [nickname, setNickname] = useState("");
  const [city, setCity] = useState("");
  const [bio, setBio] = useState("");
  const [tags, setTags] = useState(state?.interests ?? ["맛집", "애니메이션", "풍경"]);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setProfileFile(file);
    setProfileImage(URL.createObjectURL(file));
  };

  const removeTag = (tag) => {
    if (tags.length <= 1) return;
    setTags((prev) => prev.filter((item) => item !== tag));
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;

    const signupForm = state?.formData;
    if (!signupForm) {
      setErrorMessage("가입 정보를 다시 입력해주세요.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const { languages, levels } = normalizeLanguages(state?.selectedLanguages);
      const email = signupForm.email.includes("@")
        ? signupForm.email
        : `${signupForm.email}@${signupForm.domain}`;
      const dto = {
        id: signupForm.userId.trim(),
        pw: signupForm.password,
        role: "GUIDE",
        email,
        interest: tags.join(", "),
        nickName: nickname.trim(),
        oneWord: bio.trim() || city.trim(),
        nationality: signupForm.nationality,
        defaultLanguage: signupForm.defaultLanguage,
        languages,
        levels,
      };

      let signupResponse = null;
      if (state?.mode === "switch") {
        await switchMemberRole("GUIDE");
        const updateDto = { ...dto };
        delete updateDto.pw;
        signupResponse = await updateMember(updateDto, profileFile).catch(() => null);
      } else {
        signupResponse = await signupMember(dto, profileFile);
        const loginResponse = await loginMember(dto.id, dto.pw);
        if (!loginResponse?.token) {
          throw new Error("가이드 계정 로그인 토큰을 받지 못했습니다.");
        }
        clearAuthStorage();
        localStorage.setItem("accessToken", loginResponse.token);
        localStorage.setItem("tokenType", loginResponse.type || "Bearer");
        localStorage.setItem("userId", loginResponse.id ?? dto.id);
      }

      const nextProfile =
        await getMypage().catch(() => null);
      const image = pickImageUrl(nextProfile, signupResponse, profileImage);

      localStorage.setItem("userId", dto.id);
      localStorage.setItem(
        "profile",
        JSON.stringify({
          ...(nextProfile ?? {}),
          id: dto.id,
          email: dto.email,
          role: "GUIDE",
          interest: dto.interest,
          nickName: dto.nickName,
          oneWord: dto.oneWord,
          nationality: dto.nationality,
          defaultLanguage: dto.defaultLanguage,
          city: city.trim(),
          image,
          profileImage: image,
          languages,
          levels,
        })
      );

      navigate("/guide-welcome");
    } catch (error) {
      setErrorMessage(error.message || "회원가입에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
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

      {errorMessage && <ErrorText>{errorMessage}</ErrorText>}
      <Bottom>
        <NextButton
          isValid={nickname.trim().length > 0 && city.trim().length > 0 && !isSubmitting}
          onClick={handleSubmit}
        />
      </Bottom>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  width: var(--app-page-width);
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

const ErrorText = styled.p`
  width: var(--app-content-width);
  margin: 8px auto 0;
  color: #d93025;
  font-family: Pretendard, sans-serif;
  font-size: 13px;
  font-weight: 500;
`;
