// 호출방법: <GuideSmallCard guide={guide} onClick={() => navigate("/guide")} />
import React from "react";
import styled from "styled-components";
import DefaultProfile from "../assets/defaultProfile.svg";

export default function GuideSmallCard({ guide, onClick }) {
  return (
    <Card onClick={onClick}>
      <Inner>
        <InfoGroup>
          <Name>{guide.nickname}</Name>
          <Bio>{guide.bio}</Bio>
          <AnswerTime>{guide.answertime}</AnswerTime>
        </InfoGroup>
        <Avatar
          src={guide.profileImage || DefaultProfile}
          alt={guide.nickname}
          onError={(e) => { e.target.src = DefaultProfile; }}
        />
      </Inner>
    </Card>
  );
}

const Card = styled.div`
  width: 348px;
  height: 114px;
  border-radius: 12px;
  border: 1px solid #DADADA;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-sizing: border-box;
`;

const Inner = styled.div`
  display: flex;
  width: 309px;
  justify-content: space-between;
  align-items: center;
`;

const InfoGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const Name = styled.span`
  color: #111;
  font-feature-settings: 'liga' off, 'clig' off;
  font-family: Pretendard;
  font-size: 16px;
  font-style: normal;
  font-weight: 600;
  line-height: 22px;
  letter-spacing: 0.3px;
`;

const Bio = styled.span`
  color: #ACACAC;
  font-feature-settings: 'liga' off, 'clig' off;
  font-family: Pretendard;
  font-size: 14px;
  font-style: normal;
  font-weight: 500;
  line-height: 22px;
  letter-spacing: 0.3px;
`;

const AnswerTime = styled.span`
  color: #B1DD89;
  font-feature-settings: 'liga' off, 'clig' off;
  font-family: Pretendard;
  font-size: 12px;
  font-style: normal;
  font-weight: 500;
  line-height: 22px;
  letter-spacing: 0.3px;
`;

const Avatar = styled.img`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
  background: #f3f4f3;
`;