import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import BackArrow from "../assets/backarrow.svg";
import ImageIcon from "../assets/imageIcon.svg";

export default function GuideDescriptionEditPage() {
  const navigate = useNavigate();
  const [description, setDescription] = useState("");
  const [textFormat, setTextFormat] = useState("본문");

  const handleBack = () => {
    navigate(-1);
  };

  const handleSave = () => {
    console.log("코스 설명 저장:", description);
    navigate(-1);
  };

  const handleFormatChange = (format) => {
    setTextFormat(format);
  };

  return (
    <PageWrapper>
      <Header>
        <LeftGroup>
          <BackButton type="button" onClick={handleBack}>
            <img src={BackArrow} alt="뒤로가기" />
          </BackButton>
          <FormatDropdown>
            <FormatButton type="button">{textFormat}</FormatButton>
            <DropdownMenu>
              <DropdownItem onClick={() => handleFormatChange("본문")}>본문</DropdownItem>
              <DropdownItem onClick={() => handleFormatChange("제목3")}>제목3</DropdownItem>
              <DropdownItem onClick={() => handleFormatChange("제목2")}>제목2</DropdownItem>
              <DropdownItem onClick={() => handleFormatChange("제목1")}>제목1</DropdownItem>
            </DropdownMenu>
          </FormatDropdown>
        </LeftGroup>

        <RightGroup>
          <IconButton type="button" title="텍스트 서식">
            <TextStyleIcon>
              <span>A</span>
              <i />
            </TextStyleIcon>
          </IconButton>
          <IconButton type="button" title="이미지 추가">
            <img src={ImageIcon} alt="" />
          </IconButton>
          <SaveButton type="button" onClick={handleSave}>저장</SaveButton>
        </RightGroup>
      </Header>

      <EditorContainer>
        <EditorDescription>코스에 대한 상세내용을 작성해보세요</EditorDescription>
        <TextEditor
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="코스에 대한 상세한 설명을 입력하세요..."
        />
      </EditorContainer>
    </PageWrapper>
  );
}

const PageWrapper = styled.div`
  font-family: 'Noto Sans KR', 'Apple SD Gothic Neo', sans-serif;
  max-width: 390px;
  margin: 0 auto;
  min-height: 100vh;
  background-color: #fff;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  height: 104px;
  padding: 28px 31px 22px 20px;
  background: #fff;
  position: relative;
  border-bottom: 1px solid #f3f4f3;
  box-sizing: border-box;
`;

const LeftGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 30px;
`;

const BackButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  width: 28px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;

  img {
    width: 28px;
    height: 28px;
  }
`;

const FormatDropdown = styled.div`
  position: relative;
`;

const FormatButton = styled.button`
  background: #fff;
  border: 1px solid #dadada;
  width: 92px;
  height: 46px;
  padding: 0 14px;
  border-radius: 4px;
  font-family: Pretendard, sans-serif;
  font-size: 14px;
  font-weight: 400;
  color: #111;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;

  &::after {
    content: "^";
    font-size: 16px;
    color: #111;
    line-height: 1;
    transform: translateY(2px);
  }
`;

const DropdownMenu = styled.div`
  position: absolute;
  top: 50px;
  left: 0;
  background: #fff;
  border: 1px solid #dadada;
  border-radius: 4px;
  z-index: 10;
  width: 92px;
  padding: 0;
  box-sizing: border-box;
  display: none;

  ${FormatButton}:hover ~ & {
    display: block;
  }

  &:hover {
    display: block;
  }
`;

const DropdownItem = styled.button`
  display: block;
  width: 100%;
  text-align: left;
  padding: 8px 14px;
  background: none;
  border: none;
  font-family: Pretendard, sans-serif;
  font-size: ${({ children }) => {
    if (children === "제목1") return "24px";
    if (children === "제목2") return "20px";
    if (children === "제목3") return "16px";
    return "14px";
  }};
  font-weight: ${({ children }) => (children === "본문" ? 400 : 700)};
  color: #111;
  cursor: pointer;
  line-height: 28px;

  &:hover {
    background-color: #f7f7f7;
  }
`;

const RightGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 18px;
`;

const IconButton = styled.button`
  background: none;
  border: none;
  width: 26px;
  height: 26px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #111;
  padding: 0;

  img {
    width: 26px;
    height: 26px;
  }
`;

const TextStyleIcon = styled.span`
  display: flex;
  align-items: center;
  gap: 2px;
  color: #111;
  font-family: Pretendard, sans-serif;

  span {
    font-size: 25px;
    font-weight: 400;
    line-height: 1;
  }

  i {
    width: 12px;
    height: 15px;
    display: inline-block;
    border-top: 2px solid #111;
    border-bottom: 2px solid #111;
    position: relative;
  }

  i::before {
    content: "";
    position: absolute;
    left: 0;
    right: 0;
    top: 5px;
    border-top: 2px solid #111;
  }
`;

const SaveButton = styled.button`
  background: #c5f598;
  border: none;
  width: 76px;
  height: 54px;
  border-radius: 27px;
  font-size: 18px;
  font-weight: 600;
  color: #111;
  cursor: pointer;
  font-family: Pretendard, 'Noto Sans KR', sans-serif;
  transition: background-color 0.2s;

  &:hover {
    background-color: #b3e984;
  }

  &:active {
    transform: scale(0.98);
  }
`;

const EditorContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 30px 31px;
  overflow: hidden;
`;

const EditorDescription = styled.p`
  font-size: 18px;
  color: #acacac;
  margin: 0;
  line-height: 26px;
`;

const TextEditor = styled.textarea`
  flex: 1;
  border: none;
  outline: none;
  font-family: 'Noto Sans KR', sans-serif;
  font-size: 14px;
  line-height: 1.6;
  color: #111;
  resize: none;
  padding: 0;
  background: #fff;

  &::placeholder {
    color: transparent;
  }

  &:focus {
    background: #fff;
  }
`;
