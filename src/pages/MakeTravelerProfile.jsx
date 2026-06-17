import { useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styled from "styled-components";
import ProgressBar from "../components/ProgressBar";
import StartComent from "../components/StartComent";
import NextButton from "../components/NextButton1";
import DefaultProfileIcon from "../assets/defaultProfile.svg";
import ImageIcon from "../assets/imageIcon.svg";
import RemoveIcon from "../assets/removeIcon.svg";
import { loginMember, normalizeLanguages, signupMember } from "../api/member";
import { clearAuthStorage } from "../api/client";
import { getMypage } from "../api/tomorang";

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

/**
 * 호출 방법:
 * <CreateProfile interests={["맛집", "애니메이션", "풍경"]} />
 * interests: 이전 페이지(SelectInterest)에서 선택한 관심사 배열
 * 
 * react-router 사용 시
 * navigate("/create-profile", { state: { interests: selected } });
 *
 * CreateProfile에서 받기
 * import { useLocation } from "react-router-dom";
 * const { state } = useLocation();
 * <CreateProfile interests={state?.interests ?? []} />
 */
function MakeTravelerProfile() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const [profileImage, setProfileImage] = useState(null);
  const [nickname, setNickname] = useState("");
  const [bio, setBio] = useState("");
  const [tags, setTags] = useState(state?.interests ?? []);

  const fileInputRef = useRef(null);
  const [profileFile, setProfileFile] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleImageClick = () => fileInputRef.current?.click();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setProfileFile(file);
    setProfileImage(URL.createObjectURL(file));
  };

  const handleRemoveTag = (tag) => {
    if (tags.length <= 1) return;
    setTags((prev) => prev.filter((t) => t !== tag));
  };

  const isValid = nickname.trim().length > 0;

  const handleNext = async () => {
    if (isSubmitting) return;

    const formData = state?.formData;
    if (!formData) {
      setErrorMessage("가입 정보를 다시 입력해주세요.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const { languages, levels } = normalizeLanguages(state?.selectedLanguages);
      const dto = {
        id: formData.userId.trim(),
        pw: formData.password,
        role: "DISCOVERER",
        email: formData.email,
        interest: tags.join(", "),
        nickName: nickname.trim(),
        oneWord: bio.trim(),
        nationality: formData.nationality,
        defaultLanguage: formData.defaultLanguage,
        languages,
        levels,
      };

      const signupResponse = await signupMember(dto, profileFile);
      const loginResponse = await loginMember(dto.id, dto.pw);
      if (!loginResponse?.token) {
        throw new Error("회원가입 후 로그인 토큰을 받지 못했습니다.");
      }

      clearAuthStorage();
      localStorage.setItem("accessToken", loginResponse.token);
      localStorage.setItem("tokenType", loginResponse.type || "Bearer");
      localStorage.setItem("userId", loginResponse.id ?? dto.id);

      const nextProfile = await getMypage().catch(() => null);
      const image = pickImageUrl(nextProfile, signupResponse, profileImage);

      localStorage.setItem(
        "profile",
        JSON.stringify({
          ...(nextProfile ?? {}),
          id: dto.id,
          email: dto.email,
          role: dto.role,
          interest: dto.interest,
          nickName: dto.nickName,
          oneWord: dto.oneWord,
          nationality: dto.nationality,
          defaultLanguage: dto.defaultLanguage,
          image,
          profileImage: image,
          languages,
          levels,
        })
      );

      navigate("/welcome");
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
          <ProfileCircle onClick={handleImageClick}>
            <ProfileImg
              src={profileImage || DefaultProfileIcon}
              alt="프로필"
              $isDefault={!profileImage}
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

        <FieldLabel>닉네임</FieldLabel>
        <Input
          type="text"
          placeholder="닉네임을 입력하세요"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          maxLength={20}
        />

        <FieldLabel>한마디</FieldLabel>
        <Input
          type="text"
          placeholder="안녕하세요 잘 부탁..."
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          maxLength={50}
        />

        {tags.length > 0 && (
          <>
            <FieldLabel>관심사</FieldLabel>
            <TagRow>
              {tags.map((tag) => (
                <Tag key={tag}>
                  {tag}
                  <TagRemove src={RemoveIcon} alt="제거" onClick={() => handleRemoveTag(tag)} />
                </Tag>
              ))}
            </TagRow>
          </>
        )}
      </Content>

      {errorMessage && <ErrorText>{errorMessage}</ErrorText>}
      <Bottom>
        <NextButton isValid={isValid && !isSubmitting} onClick={handleNext} />
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
  padding: 24px 0;
  box-sizing: border-box;
  font-family: "Pretendard", sans-serif;
`;

const Top = styled.div`
  display: flex;
  justify-content: center;
`;

const Middle = styled.div`
  padding: 2.9375rem 0 2.25rem;
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
  margin-bottom: 1.5rem;
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
  object-fit: cover;
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

const TagRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 0.25rem;
`;

const Tag = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 12px 10px 24px;
  border-radius: 999px;
  border: 1px solid #4E4E4E;
  font-size: 0.875rem;
  font-weight: 500;
  color: #111;
  background: #fff;
`;

const TagRemove = styled.img`
  width: 6.6px;
  height: 6.6px;
  padding: 9.2px;
  cursor: pointer;

  &:active {
    opacity: 0.7;
  }
`;

const Bottom = styled.div`
  display: flex;
  justify-content: center;
  padding: 1.5rem 1.3125rem 0;
`;

const ErrorText = styled.p`
  width: var(--app-content-width);
  margin: 8px auto 0;
  color: #d93025;
  font-family: Pretendard, sans-serif;
  font-size: 13px;
  font-weight: 500;
`;

export default MakeTravelerProfile;
