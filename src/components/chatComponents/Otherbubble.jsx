import React, { useState } from "react";
import styled from "styled-components";

export default function OtherBubble({
  message,
  translation,
  imageUrl,
  time,
  changeIcon,
  onTranslate,
  isTranslating,
}) {
  const [showTranslation, setShowTranslation] = useState(false);

  const handleTranslate = () => {
    if (translation) {
      setShowTranslation((prev) => !prev);
      return;
    }

    onTranslate?.();
    setShowTranslation(true);
  };

  return (
    <Wrapper>
      <Row>
        <BubbleCol>
          <Bubble $imageOnly={!!imageUrl} data-i18n-skip="true">
            {imageUrl ? (
              <Image src={imageUrl} alt="받은 사진" />
            ) : (
              <>
                <Text>{message}</Text>
                {translation && showTranslation && (
                  <>
                    <Divider />
                    <Text>{translation}</Text>
                  </>
                )}
              </>
            )}
          </Bubble>
          {!imageUrl && (
            <TranslateBtn type="button" onClick={handleTranslate} disabled={isTranslating}>
              {changeIcon && (
                <img src={changeIcon} alt="translate" width={24} height={24} />
              )}
              {isTranslating ? "번역중" : showTranslation && translation ? "원문만 보기" : "번역보기"}
            </TranslateBtn>
          )}
        </BubbleCol>
        {time && <Time>{time}</Time>}
      </Row>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  padding: 0 16px;
  margin-bottom: 8px;
`;

const Row = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: flex-end;
  gap: 6px;
`;

const BubbleCol = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const Bubble = styled.div`
  max-width: 240px;
  color: #111;
  font-family: Pretendard;
  font-size: 14px;
  font-weight: 400;
  line-height: 22px;
  padding: ${({ $imageOnly }) => ($imageOnly ? "4px" : "10px 14px")};
  border: 1px solid #EFEFEF;
  word-break: break-word;
  white-space: pre-wrap;
  border-radius: 0 12px 12px 12px;
  background: #F3F4F3;
`;

const Text = styled.div``;

const Divider = styled.div`
  height: 1px;
  margin: 8px 0;
  background: #dadada;
`;

const Image = styled.img`
  display: block;
  width: min(220px, 58vw);
  max-height: 260px;
  object-fit: cover;
  border-radius: 0 10px 10px 10px;
`;

const TranslateBtn = styled.button`
  background: none;
  border: none;
  padding: 0;
  font-family: Pretendard;
  font-size: 12px;
  color: #ACACAC;
  cursor: pointer;
  text-align: left;
  display: flex;
  align-items: center;
  gap: 4px;

  &:disabled {
    cursor: default;
  }
`;

const Time = styled.span`
  font-family: Pretendard;
  font-size: 11px;
  color: #ACACAC;
  flex-shrink: 0;
  padding-bottom: 2px;
`;
