import React from "react";
import styled from "styled-components";
import DefaultProfileIcon from "../assets/defaultProfile.svg";
import { formatRating } from "../utils/postStats";

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

function normalizeInterests(guide) {
  if (Array.isArray(guide?.interests)) return guide.interests;
  return String(guide?.interest ?? "")
    .split(",")
    .map((interest) => interest.trim())
    .filter(Boolean);
}

function normalizeLanguages(guide) {
  return (guide?.languages ?? []).map((language, index) => {
    if (typeof language === "object" && language !== null) {
      return {
        code: language.code ?? LANGUAGE_LABELS[language.language] ?? language.language ?? "KR",
        level: language.level ?? "beginner",
      };
    }

    return {
      code: LANGUAGE_LABELS[language] ?? language,
      level: LEVEL_LABELS[guide?.levels?.[index]] ?? guide?.levels?.[index] ?? "beginner",
    };
  });
}

export default function GuideTab({ guide }) {
  if (!guide) return null;

  const nickname = guide.nickname ?? guide.nickName ?? guide.id ?? "가이드";
  const bio = guide.bio ?? guide.oneWord ?? "소개가 아직 없습니다.";
  const answerTime = guide.answertime ?? guide.answerTime ?? "평균 12분 내로 응답";
  const profileImage = guide.profileImage ?? guide.image ?? DefaultProfileIcon;
  const interests = normalizeInterests(guide);
  const languages = normalizeLanguages(guide);
  const likeCount = guide.likeCount ?? guide.totalLikes ?? 0;
  const postCount = guide.postCount ?? guide.postIds?.length ?? 0;
  const rating = Number(guide.rating ?? guide.avgRating ?? 0);

  return (
    <PageBg>
      <Card>
        <TopRow>
          <InfoGroup>
            <Name>{nickname}</Name>
            <Bio>{bio}</Bio>
            <AnswerTime>{answerTime}</AnswerTime>
          </InfoGroup>
          <Avatar src={profileImage} alt="profile" />
        </TopRow>

        <TagRow>
          {interests.map((interest, index) => (
            <InterestTag key={`${interest}-${index}`}>#{interest}</InterestTag>
          ))}
        </TagRow>

        <TagRow>
          {languages.map((lang, index) => (
            <LangTag key={`${lang.code}-${index}`}>
              <LangCode>{lang.code}</LangCode>
              <LevelDots level={lang.level} />
            </LangTag>
          ))}
        </TagRow>

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
            <StatNum>{formatRating(rating)}점</StatNum>
            <StatLabel>리뷰</StatLabel>
          </StatItem>
        </StatsRow>
      </Card>
    </PageBg>
  );
}

const PageBg = styled.div`
  background-color: #F3F4F3;
  padding: 12px 0 20px;
`;

const Card = styled.div`
  width: 348px;
  border-radius: 12px;
  background: #fff;
  padding: 20px 16px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  box-sizing: border-box;
  margin: 0 auto;
`;

const TopRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
`;

const InfoGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const Name = styled.span`
  color: #111;
  font-family: Pretendard;
  font-size: 16px;
  font-weight: 600;
  line-height: 22px;
`;

const Bio = styled.span`
  color: #ACACAC;
  font-family: Pretendard;
  font-size: 14px;
  font-weight: 500;
  line-height: 22px;
`;

const AnswerTime = styled.span`
  color: #B1DD89;
  font-family: Pretendard;
  font-size: 12px;
  font-weight: 500;
  line-height: 22px;
`;

const Avatar = styled.img`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  background: #d9d9d9;
  flex-shrink: 0;
`;

const TagRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const InterestTag = styled.span`
  background: #C5F598;
  color: #111;
  font-size: 12px;
  font-weight: 500;
  padding: 4px 10px;
  border-radius: 20px;
`;

const LangTag = styled.div`
  display: flex;
  padding: 5px 8px;
  justify-content: center;
  align-items: center;
  gap: 6px;
  border-radius: 50px;
  background: #111;
`;

const LangCode = styled.span`
  color: #fff;
  font-size: 12px;
  font-weight: 500;
`;

const DotsRow = styled.div`
  display: flex;
  align-items: center;
  gap: 3px;
`;

const Divider = styled.div`
  width: 100%;
  height: 1px;
  background: #F0F0F0;
`;

const StatsRow = styled.div`
  display: flex;
  justify-content: space-around;
  align-items: center;
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
`;

const StatLabel = styled.span`
  font-size: 12px;
  color: #999;
`;
