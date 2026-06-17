import { useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styled from "styled-components";
import BackArrow from "../assets/backarrow.svg";
import ImageIcon from "../assets/imageIcon.svg";
import MarkdownContent from "../components/MarkdownContent";
import { addContentImageDraft, getContentImageDrafts } from "../utils/guideRegistrationDraft";
import { useI18n } from "../i18n/I18nProvider";

const DRAFT_KEY = "guideRegistrationDraft";

function loadDraftDescription(stateDescription) {
  if (typeof stateDescription === "string") return stateDescription;

  try {
    return JSON.parse(sessionStorage.getItem(DRAFT_KEY) || "{}").description || "";
  } catch {
    return "";
  }
}

function updateDraftDescription(description) {
  let draft = {};
  try {
    draft = JSON.parse(sessionStorage.getItem(DRAFT_KEY) || "{}");
  } catch {
    draft = {};
  }

  sessionStorage.setItem(DRAFT_KEY, JSON.stringify({ ...draft, description }));
}

export default function GuideDescriptionEditPage() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { t } = useI18n();
  const fileInputRef = useRef(null);
  const initialDescription = useMemo(() => loadDraftDescription(state?.description), [state?.description]);
  const [description, setDescription] = useState(initialDescription);
  const [mode, setMode] = useState("write");
  const [contentImagePreviews, setContentImagePreviews] = useState(getContentImageDrafts().previews);

  const goBackWithSave = () => {
    updateDraftDescription(description);
    navigate("/guide-registration");
  };

  const handleImageInsert = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const preview = URL.createObjectURL(file);
    const id = addContentImageDraft(file, preview);
    setContentImagePreviews(getContentImageDrafts().previews);
    setDescription((prev) => `${prev}${prev ? "\n\n" : ""}![본문 이미지](tomorang-content-image://${id})\n`);
    event.target.value = "";
  };

  return (
    <PageWrapper>
      <TopBar>
        <BackButton type="button" onClick={goBackWithSave}>
          <img src={BackArrow} alt={t("뒤로가기")} />
        </BackButton>
        <HeaderTitle>{t("상세 설명")}</HeaderTitle>
        <SaveButton type="button" onClick={goBackWithSave}>
          {t("저장")}
        </SaveButton>
      </TopBar>

      <EditorShell>
        <EditorHeading>{t("코스 상세 설명")}</EditorHeading>
        <TitleLine />
        <ModeRow>
          <ModeButton type="button" $active={mode === "write"} onClick={() => setMode("write")}>
            {t("작성")}
          </ModeButton>
          <ModeButton type="button" $active={mode === "preview"} onClick={() => setMode("preview")}>
            {t("미리보기")}
          </ModeButton>
        </ModeRow>
        <ImageInsertButton type="button" onClick={() => fileInputRef.current?.click()}>
          <img src={ImageIcon} alt="" />
          {t("이미지 삽입")}
        </ImageInsertButton>
        <HiddenFileInput ref={fileInputRef} type="file" accept="image/*" onChange={handleImageInsert} />

        {mode === "write" ? (
          <TextEditor
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder={t("아키하바라 레트로 피규어 쇼핑\n\n애니메이션과 게임의 성지, 아키하바라에서 진짜 보물 같은 굿즈를 찾고 싶다면?\n\n## 방문 포인트\n- 레트로 피규어 매장\n- 중고 굿즈 숍\n- 숨은 포토 스팟")}
          />
        ) : (
          <PreviewBox>
            {description ? (
              <MarkdownContent value={description} imageMap={contentImagePreviews} />
            ) : (
              <EmptyText>{t("작성한 내용이 여기에 미리보기로 표시됩니다.")}</EmptyText>
            )}
          </PreviewBox>
        )}
      </EditorShell>
    </PageWrapper>
  );
}

const PageWrapper = styled.div`
  font-family: "Noto Sans KR", "Apple SD Gothic Neo", sans-serif;
  width: min(var(--app-page-width), 100vw);
  min-height: 100vh;
  margin: 0 auto;
  background: #fff;
  display: flex;
  flex-direction: column;
`;

const TopBar = styled.div`
  height: 56px;
  padding: 0 16px;
  border-bottom: 1px solid #f3f4f3;
  display: grid;
  grid-template-columns: 40px 1fr 58px;
  align-items: center;
  box-sizing: border-box;
`;

const BackButton = styled.button`
  width: 36px;
  height: 36px;
  border: 0;
  background: transparent;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;

  img {
    width: 28px;
    height: 28px;
  }
`;

const HeaderTitle = styled.h1`
  margin: 0;
  color: #111;
  text-align: center;
  font-size: 16px;
  font-weight: 700;
`;

const SaveButton = styled.button`
  width: 58px;
  height: 36px;
  border: 0;
  border-radius: 18px;
  background: #c5f598;
  color: #111;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
`;

const EditorShell = styled.div`
  flex: 1;
  padding: 28px 24px 36px;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
`;

const EditorHeading = styled.h2`
  margin: 0;
  color: #111;
  text-align: center;
  font-size: 18px;
  font-weight: 700;
  line-height: 26px;
`;

const TitleLine = styled.div`
  width: 1px;
  height: 60px;
  margin: 20px auto 24px;
  background: #111;
`;

const ModeRow = styled.div`
  width: 100%;
  height: 42px;
  padding: 4px;
  margin-bottom: 18px;
  border-radius: 14px;
  background: #f3f4f3;
  display: flex;
  box-sizing: border-box;
`;

const ModeButton = styled.button`
  flex: 1;
  border: 0;
  border-radius: 10px;
  background: ${({ $active }) => ($active ? "#111" : "transparent")};
  color: ${({ $active }) => ($active ? "#fff" : "#777")};
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
`;

const ImageInsertButton = styled.button`
  width: 100%;
  height: 44px;
  margin-bottom: 18px;
  border: 1px solid #c5f598;
  border-radius: 12px;
  background: #fff;
  color: #5f9f38;
  font-size: 14px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;

  img {
    width: 20px;
    height: 20px;
  }
`;

const HiddenFileInput = styled.input`
  display: none;
`;

const TextEditor = styled.textarea`
  flex: 1;
  min-height: 560px;
  border: 0;
  outline: none;
  resize: none;
  color: #111;
  font-size: 15px;
  line-height: 1.8;
  font-family: "Noto Sans KR", Pretendard, sans-serif;
  background: #fff;
  padding: 0;

  &::placeholder {
    color: #acacac;
  }
`;

const PreviewBox = styled.div`
  flex: 1;
  min-height: 560px;
  overflow-y: auto;
`;

const EmptyText = styled.p`
  margin: 0;
  padding-top: 120px;
  color: #acacac;
  text-align: center;
  font-size: 14px;
`;
