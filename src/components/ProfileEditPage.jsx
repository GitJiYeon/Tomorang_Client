import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import Header from "../components/Header";
import DefaultProfileIcon from "../assets/defaultProfile.svg";
import ImageIcon from "../assets/imageIcon.svg";
import { updateMember } from "../api/member";
import { getMypage } from "../api/tomorang";

const LANGUAGE_TO_SERVER = {
  KR: "KOREAN",
  JP: "JAPANESE",
  EN: "ENGLISH",
  ko: "KOREAN",
  ja: "JAPANESE",
  en: "ENGLISH",
};

const LEVEL_TO_SERVER = {
  beginner: 1,
  intermediate: 2,
  advanced: 3,
};

const compactObject = (object) =>
  Object.fromEntries(
    Object.entries(object).filter(([, value]) => {
      if (Array.isArray(value)) return value.length > 0;
      return value !== undefined && value !== null && value !== "";
    })
  );

const safeJsonParse = (value, fallback) => {
  try {
    return JSON.parse(value ?? "");
  } catch {
    return fallback;
  }
};

const pickImageUrl = (...sources) => {
  for (const source of sources) {
    if (!source) continue;
    if (typeof source === "string") return source;

    const value =
      source.profileImage ??
      source.profile_image ??
      source.image ??
      source.imageUrl ??
      source.image_url ??
      source.fileUrl ??
      source.file_url ??
      source.url ??
      source.data?.profileImage ??
      source.data?.profile_image ??
      source.data?.image ??
      source.data?.imageUrl;

    if (value) return value;
  }
  return "";
};

const normalizeLanguageCode = (language) => {
  const value =
    typeof language === "object" && language !== null
      ? language.language ?? language.code ?? language.languageCode
      : language;
  return LANGUAGE_TO_SERVER[value] ?? value;
};

const normalizeLanguageLevel = (language, fallbackLevel) => {
  const value =
    typeof language === "object" && language !== null
      ? language.level ?? fallbackLevel
      : fallbackLevel;
  return LEVEL_TO_SERVER[value] ?? value;
};

const getLanguagePayload = (profile) => {
  const localLanguages = safeJsonParse(localStorage.getItem("languages"), []);
  const sourceLanguages =
    Array.isArray(profile.languages) && profile.languages.length > 0
      ? profile.languages
      : localLanguages;
  const serverLanguages =
    Array.isArray(profile.serverLanguages) && profile.serverLanguages.length > 0
      ? profile.serverLanguages
      : sourceLanguages.map(normalizeLanguageCode).filter(Boolean);
  const levels =
    Array.isArray(profile.levels) && profile.levels.length > 0
      ? profile.levels
      : sourceLanguages
          .map((language, index) => normalizeLanguageLevel(language, profile.levels?.[index]))
          .filter(Boolean);

  return { languages: serverLanguages, levels };
};

const getInterestText = (profile) => {
  if (Array.isArray(profile.interests)) return profile.interests.join(", ");
  return profile.interest;
};

const getProfileId = (profile) =>
  profile.id ??
  profile.userId ??
  profile.user_id ??
  profile.memberId ??
  profile.member_id ??
  localStorage.getItem("userId");

const normalizeProfileCache = (source, fallback) => {
  const nickname =
    source?.nickname ??
    source?.nickName ??
    source?.nick_name ??
    source?.name ??
    fallback.nickName ??
    fallback.nickname;
  const bio =
    source?.oneWord ??
    source?.one_word ??
    source?.bio ??
    source?.introduction ??
    fallback.oneWord ??
    fallback.bio;
  const image = pickImageUrl(source, fallback.profileImage, fallback.image);

  return {
    ...fallback,
    ...(source && typeof source === "object" ? source : {}),
    id: getProfileId(source ?? fallback),
    profileImage: image,
    image,
    nickname,
    nickName: nickname,
    bio,
    oneWord: bio,
  };
};

export default function ProfileEditPage() {
  const navigate = useNavigate();

  // localStorage에서 기존 프로필 불러오기
  const saved = JSON.parse(localStorage.getItem("profile") ?? "{}");

  const [profileImage, setProfileImage] = useState(saved.profileImage ?? saved.image ?? null);
  const [nickname, setNickname] = useState(saved.nickname ?? saved.nickName ?? "");
  const [bio, setBio] = useState(saved.bio ?? saved.oneWord ?? "");
  const [profileFile, setProfileFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const fileInputRef = useRef(null);

  const handleImageClick = () => fileInputRef.current?.click();

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setProfileFile(file);
    setProfileImage(URL.createObjectURL(file));
  };

  const handleComplete = async () => {
    if (isSubmitting) return;

    const latestProfile = {
      ...saved,
      ...safeJsonParse(localStorage.getItem("profile"), {}),
    };
    const { languages, levels } = getLanguagePayload(latestProfile);
    const nextNickname = nickname.trim();
    const nextBio = bio.trim();
    const updateDto = compactObject({
      id: getProfileId(latestProfile),
      role: latestProfile.role ?? localStorage.getItem("role"),
      email: latestProfile.email,
      interest: getInterestText(latestProfile),
      nickName: nextNickname,
      oneWord: nextBio,
      nationality: latestProfile.nationality,
      defaultLanguage: latestProfile.defaultLanguage,
      languages,
      levels,
    });

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const updateResponse = await updateMember(updateDto, profileFile);
      const mypage = await getMypage().catch(() => null);
      const optimisticProfile = {
        ...latestProfile,
        ...updateDto,
        profileImage,
        image: profileImage,
        nickname: nextNickname,
        nickName: nextNickname,
        bio: nextBio,
        oneWord: nextBio,
        languages: latestProfile.languages ?? languages,
        levels,
      };
      const nextProfile = normalizeProfileCache(mypage ?? updateResponse, optimisticProfile);

      localStorage.setItem("profile", JSON.stringify(nextProfile));
      if (nextProfile.id) localStorage.setItem("userId", nextProfile.id);
      navigate(-1);
    } catch (error) {
      console.error("프로필 수정 실패", error);
      setErrorMessage(error.message || "프로필 수정에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
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

        {errorMessage && <ErrorText>{errorMessage}</ErrorText>}

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
        <CompleteButton onClick={handleComplete} disabled={isSubmitting}>
          {isSubmitting ? "저장 중..." : "수정 완료"}
        </CompleteButton>
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

const ErrorText = styled.p`
  margin: 10px 1rem 0;
  color: #ff4d4f;
  font-family: Pretendard, sans-serif;
  font-size: 12px;
  line-height: 1.4;
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

  &:disabled {
    opacity: 0.6;
    cursor: default;
  }
`;
