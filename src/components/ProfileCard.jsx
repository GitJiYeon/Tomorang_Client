import React from "react";
import styled from "styled-components";
import DefaultProfileIcon from "../assets/defaultProfile.svg";

const LEVEL_MAP = {
  beginner: 1,
  intermediate: 2,
  advanced: 3,
};

function LevelDots({ level }) {
  const filled = LEVEL_MAP[level] || 1;
  return (
    <DotsRow>
      {[0, 1, 2].map((i) => (
        <svg key={i} width="5" height="5" viewBox="0 0 5 5">
          <circle cx="2.5" cy="2.5" r="2.5" fill={i < filled ? "#C5F598" : "#D9D9D9"} />
        </svg>
      ))}
    </DotsRow>
  );
}

export default function ProfileCard({ profile, onEditPress }) {
  if (!profile) return null;

  return (
    <PageBg>
      <Card>
        {/* 상단: 이름/소개/정보 수정하기 + 프로필 이미지 */}
        <TopRow>
          <InfoGroup>
            <Name>{profile.nickname}</Name>
            <Bio>{profile.bio}</Bio>
            <EditButton onClick={onEditPress}>
              <EditButtonText>정보 수정하기</EditButtonText>
            </EditButton>
          </InfoGroup>
          <Avatar src={profile.profileImage || DefaultProfileIcon} alt="profile"/>
        </TopRow>

        {/* 관심사 태그 */}
        <TagRow>
          {(profile.interests ?? []).map((interest) => (
            <InterestTag key={interest}>#{interest}</InterestTag>
          ))}
        </TagRow>

        {/* 언어 태그 */}
        <LangTagRow>
          {(profile.languages ?? []).map((lang) => (
            <LangTag key={lang.code}>
              <LangCode>{lang.code}</LangCode>
              <LevelDots level={lang.level} />
            </LangTag>
          ))}
        </LangTagRow>
      </Card>
    </PageBg>
  );
}

/* ── Styled Components ── */

const PageBg = styled.div`
  background-color: #fff;
  min-height: 100%;
`;

const Card = styled.div`
  width: 100%;
  background: #fff;
  padding: 24px 20px 20px 20px;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
`;

const TopRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const InfoGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const Name = styled.span`
  color: #111;
  font-family: Pretendard;
  font-size: 20px;
  font-weight: 700;
  line-height: 1.2;
`;

const Bio = styled.span`
  color: #999;
  font-family: Pretendard;
  font-size: 15px;
  font-weight: 500;
`;

const EditButton = styled.button`

  border-radius: 50px;
  border: 1px solid #DADADA;
  display: flex;
  padding: 8px 12px;
  justify-content: center;
  align-items: center;
  gap: 12px;
  background: transparent;
  cursor: pointer;
  width: fit-content;
`;

const EditButtonText = styled.span`
  color: #ACACAC;
  font-feature-settings: 'liga' off, 'clig' off;
  font-family: Pretendard;
  font-size: 12px;
  font-style: normal;
  font-weight: 500;
  line-height: normal;
  letter-spacing: -0.012px;
`;

const Avatar = styled.img`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  background: #f3f4f3;
  flex-shrink: 0;
`;

const TagRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 16px;
`;
const LangTagRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
  padding-bottom: 10px;
`

const InterestTag = styled.span`
  background: #C5F598;
  color: #111111;
  font-size: 13px;
  font-weight: 500;
  padding: 6px 14px;
  border-radius: 20px;
`;

const LangTag = styled.div`
  display: flex;
  padding: 6px 12px;
  justify-content: center;
  align-items: center;
  gap: 4px;
  border-radius: 50px;
  background: #111;
`;

const LangCode = styled.span`
  color: #C5F598;
  font-feature-settings: 'liga' off, 'clig' off;
  font-family: Pretendard;
  font-size: 10px;
  font-style: normal;
  font-weight: 500;
  line-height: normal;
  letter-spacing: -0.01px;
`;

const DotsRow = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;