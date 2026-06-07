import React from "react";
import styled from "styled-components";
import DefaultProfileIcon from "../assets/defaultProfile.svg";

const LEVEL_MAP = {
  beginner: 1,
  intermediate: 2,
  advanced: 3,
  1: 1,
  2: 2,
  3: 3,
};

const LANGUAGE_LABELS = {
  KOREAN: "KR",
  ENGLISH: "EN",
  JAPANESE: "JP",
};

const LEVEL_LABELS = {
  1: "beginner",
  2: "intermediate",
  3: "advanced",
};

function LevelDots({ level }) {
  const filled = LEVEL_MAP[level] || 1;
  return (
    <DotsRow>
      {[0, 1, 2].map((i) => (
        <svg key={i} width="5" height="5" viewBox="0 0 5 5" aria-hidden="true">
          <circle cx="2.5" cy="2.5" r="2.5" fill={i < filled ? "#C5F598" : "#D9D9D9"} />
        </svg>
      ))}
    </DotsRow>
  );
}

function normalizeInterests(profile) {
  if (Array.isArray(profile?.interests)) return profile.interests;
  return String(profile?.interest ?? "")
    .split(",")
    .map((interest) => interest.trim())
    .filter(Boolean);
}

function normalizeLanguages(profile) {
  return (profile?.languages ?? []).map((language, index) => {
    if (typeof language === "object" && language !== null) {
      return {
        code: language.code ?? LANGUAGE_LABELS[language.language] ?? language.language ?? "KR",
        level: language.level ?? "beginner",
      };
    }

    return {
      code: LANGUAGE_LABELS[language] ?? language,
      level: LEVEL_LABELS[profile?.levels?.[index]] ?? profile?.levels?.[index] ?? "beginner",
    };
  });
}

export default function GuideProfileCard({ profile, onEditPress }) {
  if (!profile) return null;

  const nickname = profile.nickname ?? profile.nickName ?? profile.id ?? "가이드";
  const bio = profile.bio ?? profile.oneWord ?? "소개가 아직 없습니다.";
  const profileImage = profile.profileImage ?? profile.image ?? DefaultProfileIcon;
  const interests = normalizeInterests(profile);
  const languages = normalizeLanguages(profile);
  const likeCount = profile.likeCount ?? profile.totalLikes ?? 0;
  const postCount = profile.postCount ?? profile.postIds?.length ?? 0;
  const rating = Number(profile.rating ?? profile.avgRating ?? 0);

  return (
    <PageBg>
      <Card>
        <TopRow>
          <InfoGroup>
            <Name>{nickname}</Name>
            <Bio>{bio}</Bio>
            <AnswerTime>평균 12분 내로 응답</AnswerTime>
            <EditButton type="button" onClick={onEditPress}>
              <EditButtonText>정보 수정하기</EditButtonText>
            </EditButton>
          </InfoGroup>
          <Avatar src={profileImage} alt="profile" />
        </TopRow>

        <TagRow>
          {interests.map((interest, index) => (
            <InterestTag key={`${interest}-${index}`}>#{interest}</InterestTag>
          ))}
        </TagRow>

        <LangTagRow>
          {languages.map((lang, index) => (
            <LangTag key={`${lang.code}-${index}`}>
              <LangCode>{lang.code}</LangCode>
              <LevelDots level={lang.level} />
            </LangTag>
          ))}
        </LangTagRow>

        <Divider />

        <StatsRow>
          <StatItem>
            <StatNum>{likeCount}개</StatNum>
            <StatLabel>좋아요</StatLabel>
          </StatItem>
          <VerticalLine />
          <StatItem>
            <StatNum>{postCount}개</StatNum>
            <StatLabel>코스</StatLabel>
          </StatItem>
          <VerticalLine />
          <StatItem>
            <StatNum>{rating.toFixed(1)}점</StatNum>
            <StatLabel>리뷰</StatLabel>
          </StatItem>
        </StatsRow>
      </Card>
    </PageBg>
  );
}

const PageBg = styled.div`
  background-color: #fff;
`;

const Card = styled.div`
  width: 100%;
  background: #fff;
  padding: 24px 20px 0 20px;
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

const AnswerTime = styled.span`
  color: #B1DD89;
  font-family: Pretendard;
  font-size: 12px;
  font-weight: 500;
  line-height: 22px;
`;

const EditButton = styled.button`
  border-radius: 50px;
  border: 1px solid #DADADA;
  display: flex;
  padding: 8px 12px;
  justify-content: center;
  align-items: center;
  background: transparent;
  cursor: pointer;
  width: fit-content;
`;

const EditButtonText = styled.span`
  color: #ACACAC;
  font-family: Pretendard;
  font-size: 12px;
  font-weight: 500;
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
`;

const InterestTag = styled.span`
  background: #C5F598;
  color: #111;
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
  font-family: Pretendard;
  font-size: 10px;
  font-weight: 500;
`;

const DotsRow = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const Divider = styled.div`
  width: 100%;
  height: 1px;
  background: #F0F0F0;
  margin-top: 14px;
`;

const StatsRow = styled.div`
  display: flex;
  justify-content: space-around;
  align-items: center;
  height: 112px;
`;

const StatItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  flex: 1;
`;

const VerticalLine = styled.div`
  width: 1px;
  height: 80px;
  background: #F3F4F3;
`;

const StatNum = styled.span`
  font-size: 22px;
  font-weight: 700;
  color: #111;
  font-family: Pretendard;
`;

const StatLabel = styled.span`
  font-size: 12px;
  color: #999;
  font-family: Pretendard;
`;
