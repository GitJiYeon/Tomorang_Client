import React from "react";
import styled from "styled-components";

// 사용법: <MyBubble message="여기 사람들은 어디 가서 먹어요?" time="오전 06:30" />

export default function MyBubble({ message, imageUrl, time }) {
  return (
    <Row>
      {time && <Time>{time}</Time>}
      <Bubble $imageOnly={!!imageUrl}>
        {imageUrl ? <Image src={imageUrl} alt="전송한 사진" /> : message}
      </Bubble>
    </Row>
  );
}

const Row = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: flex-end;
  gap: 6px;
  padding: 0 16px;
  margin-bottom: 8px;
`;

const Bubble = styled.div`
  max-width: 240px;
  background-color: #C5F598;
  color: #111;
  font-family: Pretendard;
  font-size: 14px;
  font-weight: 400;
  line-height: 22px;
  padding: ${({ $imageOnly }) => ($imageOnly ? "4px" : "10px 14px")};
  border-radius: 18px 18px 4px 18px;
  word-break: break-word;
  white-space: pre-wrap;
`;

const Image = styled.img`
  display: block;
  width: min(220px, 58vw);
  max-height: 260px;
  object-fit: cover;
  border-radius: 14px 14px 3px 14px;
`;

const Time = styled.span`
  font-family: Pretendard;
  font-size: 11px;
  color: #ACACAC;
  flex-shrink: 0;
  padding-bottom: 2px;
`;
