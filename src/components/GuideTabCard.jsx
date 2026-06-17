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

function LevelDots({ level }) {
  const filled = LEVEL_MAP[level] || 1;
  return (
    <DotsRow>
      {[0, 1, 2].map((index) => (
        <svg key={index} width="5" height="5" viewBox="0 0 5 5" aria-hidden="true">
          <circle cx="2.5" cy="2.5" r="2.5" fill={index < filled ? "#C5F598" : "#D9D9D9"} />
        </svg>
      ))}
    </DotsRow>
  );
}

export default function GuideTabCard({ guide, showLanguages = false }) {
  if (!guide) return null;

  const nickname = guide.nickname ?? guide.nickName ?? guide.id ?? "\uAC00\uC774\uB4DC";
  const bio = guide.bio ?? guide.oneWord ?? "\uC18C\uAC1C\uAC00 \uC544\uC9C1 \uC5C6\uC2B5\uB2C8\uB2E4.";
  const answerTime =
    guide.answertime ??
    guide.answerTime ??
    guide.avgAnswerTime ??
    guide.averageAnswerTime ??
    guide.average_answer_time ??
    guide.responseTime ??
    guide.response_time ??
    "\uD3C9\uADE0 12\uBD84 \uB0B4\uB85C \uC751\uB2F5";
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

        {interests.length > 0 && (
          <TagRow>
            {interests.map((interest, index) => (
              <InterestTag key={`${interest}-${index}`}>#{interest}</InterestTag>
            ))}
          </TagRow>
        )}

        {showLanguages && languages.length > 0 && (
          <LanguageRow>
            {languages.map((lang, index) => (
              <LangTag key={`${lang.code}-${index}`}>
                <LangCode>{lang.code}</LangCode>
                <LevelDots level={lang.level} />
              </LangTag>
            ))}
          </LanguageRow>
        )}

        <Divider />

        <StatsRow>
          <StatItem>
            <StatNum>{likeCount}{"\uAC1C"}</StatNum>
            <StatLabel>{"\uC88B\uC544\uC694"}</StatLabel>
          </StatItem>
          <VerticalLine />
          <StatItem>
            <StatNum>{postCount}{"\uAC1C"}</StatNum>
            <StatLabel>{"\uCF54\uC2A4"}</StatLabel>
          </StatItem>
          <VerticalLine />
          <StatItem>
            <StatNum>{rating.toFixed(1)}{"\uC810"}</StatNum>
            <StatLabel>{"\uB9AC\uBDF0"}</StatLabel>
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
  padding: 24px 20px 0;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
`;

const TopRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
`;

const InfoGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
`;

const Name = styled.span`
  color: #111;
  font-family: Pretendard, sans-serif;
  font-size: 20px;
  font-weight: 700;
  line-height: 1.2;
`;

const Bio = styled.span`
  color: #999;
  font-family: Pretendard, sans-serif;
  font-size: 15px;
  font-weight: 500;
`;

const AnswerTime = styled.span`
  color: #8BCB4F;
  font-family: Pretendard, sans-serif;
  font-size: 13px;
  font-weight: 500;
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
  margin-top: 22px;
`;

const InterestTag = styled.span`
  background: #C5F598;
  color: #111;
  font-family: Pretendard, sans-serif;
  font-size: 12px;
  font-weight: 600;
  padding: 6px 12px;
  border-radius: 20px;
`;

const LanguageRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
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
  color: #C5F598;
  font-family: Pretendard, sans-serif;
  font-size: 10px;
  font-weight: 700;
`;

const DotsRow = styled.div`
  display: flex;
  align-items: center;
  gap: 3px;
`;

const Divider = styled.div`
  width: 100%;
  height: 1px;
  background: #F3F4F3;
  margin: 16px 0;
`;

const StatsRow = styled.div`
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding-bottom: 20px;
`;

const StatItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  flex: 1;
`;

const VerticalLine = styled.div`
  width: 1px;
  height: 60px;
  background: #F3F4F3;
`;

const StatNum = styled.span`
  font-size: 24px;
  font-weight: 700;
  color: #111;
`;

const StatLabel = styled.span`
  font-size: 14px;
  color: #999;
`;
