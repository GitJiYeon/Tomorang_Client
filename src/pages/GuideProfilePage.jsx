import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import styled from "styled-components";
import Header from "../components/Header";
import GuideTabCard from "../components/GuideTabCard";
import GuideTabMenu from "../components/GuideTabMenu";
import PostCardList from "../components/PostCardList";
import ReviewCard from "../components/ReviewCard1";
import { getPopularGuides, getPostReviews, getPosts } from "../api/tomorang";
import { getPostRatingAverage, getPostWishlistCount, getReviewRatingAverage } from "../utils/postStats";
import { sortReviewsByRecent } from "../utils/reviews";

const TAB = {
  COURSE: "\uCF54\uC2A4",
  REVIEW: "\uB9AC\uBDF0",
  INFO: "\uC815\uBCF4",
};

function getGuideId(guide) {
  return guide?.guideId ?? guide?.userId ?? guide?.username ?? guide?.id;
}

function getPostId(post) {
  return post?.postId ?? post?.post_id ?? post?.id;
}

const firstValue = (...values) =>
  values.find((value) => value !== undefined && value !== null && String(value).trim() !== "");

const formatJoinedDate = (value) => {
  const text = String(value ?? "").trim();
  if (!text) return "";

  const match = text.match(/^(\d{4})[-./](\d{1,2})[-./](\d{1,2})/);
  if (match) {
    const [, year, month, day] = match;
    return `${year}.${month.padStart(2, "0")}.${day.padStart(2, "0")}`;
  }

  const date = new Date(text);
  if (!Number.isNaN(date.getTime())) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}.${month}.${day}`;
  }

  return text;
};

const formatNationality = (value) => {
  const text = String(value ?? "").trim();
  if (!text) return "";

  const normalized = text.toLowerCase();
  if (["japan", "jp", "ja", "japanese", "일본", "日本"].includes(normalized) || text === "일본" || text === "日本") {
    return "일본";
  }
  if (["korea", "kr", "ko", "korean", "south korea", "대한민국", "한국"].includes(normalized) || text === "한국" || text === "대한민국") {
    return "한국";
  }

  return text;
};

function normalizeGuide(guide) {
  const member = guide.member ?? guide.user ?? guide.profile ?? guide.memberInfo ?? guide.member_info ?? {};
  const joinedAt = formatJoinedDate(firstValue(
    guide.joinedAt,
    guide.joined_at,
    guide.joinDate,
    guide.join_date,
    guide.createdAt,
    guide.created_at,
    guide.createdDate,
    guide.created_date,
    guide.registeredAt,
    guide.registered_at,
    guide.signupDate,
    guide.signup_date,
    member.joinedAt,
    member.joined_at,
    member.joinDate,
    member.join_date,
    member.createdAt,
    member.created_at,
    member.createdDate,
    member.created_date,
    member.registeredAt,
    member.registered_at
  ));
  const nationality = formatNationality(firstValue(
    guide.nationality,
    guide.country,
    guide.nation,
    guide.countryName,
    guide.country_name,
    member.nationality,
    member.country,
    member.nation,
    member.countryName,
    member.country_name
  ));

  return {
    ...guide,
    profileImage: guide.profileImage ?? guide.image,
    nickname: guide.nickname ?? guide.nickName ?? guide.id,
    bio: guide.bio ?? guide.oneWord,
    answertime:
      guide.answertime ??
      guide.answerTime ??
      guide.avgAnswerTime ??
      guide.averageAnswerTime ??
      guide.average_answer_time ??
      guide.responseTime ??
      guide.response_time,
    rating: guide.rating ?? guide.avgRating ?? 0,
    likeCount: guide.likeCount ?? guide.totalLikes ?? 0,
    joinedAt,
    nationality,
  };
}

function extractInterestsFromPosts(posts) {
  const values = posts.flatMap((post) => {
    const tagValues = Array.isArray(post.tags)
      ? post.tags.flatMap((tag) => [tag.name, tag.value, tag.ko, tag.en, tag.ja])
      : [];
    const localTags = [
      ...(post.tag?.ko ?? []),
      ...(post.tag?.en ?? []),
      ...(post.tag?.ja ?? []),
    ];
    const subtitleValues = String(post.subtitle ?? "")
      .split(",")
      .map((value) => value.trim());

    return [...tagValues, ...localTags, ...subtitleValues];
  });

  return [...new Set(values.map((value) => String(value ?? "").trim()).filter(Boolean))].slice(0, 4);
}

function makeGuideFromPosts(id, posts) {
  const likeCount = posts.reduce((sum, post) => sum + getPostWishlistCount(post), 0);
  const ratingTotal = posts.reduce((sum, post) => sum + getPostRatingAverage(post), 0);
  const rating = posts.length ? ratingTotal / posts.length : 0;

  return normalizeGuide({
    id,
    nickName: id,
    oneWord: "\uB4F1\uB85D\uB41C \uCF54\uC2A4\uB97C \uC548\uB0B4\uD558\uB294 \uAC00\uC774\uB4DC\uC785\uB2C8\uB2E4.",
    totalLikes: likeCount,
    postCount: posts.length,
    avgRating: rating,
    interests: extractInterestsFromPosts(posts),
  });
}

export default function GuideProfilePage() {
  const { id } = useParams();
  const { state } = useLocation();
  const [activeTab, setActiveTab] = useState(TAB.COURSE);
  const [serverGuide, setServerGuide] = useState(null);
  const [serverPosts, setServerPosts] = useState([]);
  const [guideReviews, setGuideReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    setIsLoading(true);

    Promise.allSettled([getPopularGuides(), getPosts({ userId: id })])
      .then(([guidesResult, postsResult]) => {
        if (!alive) return;

        const guides = guidesResult.status === "fulfilled"
          ? guidesResult.value.map(normalizeGuide)
          : [];
        const posts = postsResult.status === "fulfilled" ? postsResult.value : [];
        const matchedGuide = guides.find((guide) => String(getGuideId(guide)) === String(id));
        const interests = extractInterestsFromPosts(posts);
        const guideWithPosts = matchedGuide
          ? {
              ...matchedGuide,
              postCount: matchedGuide.postCount ?? posts.length,
              interests: matchedGuide.interests?.length ? matchedGuide.interests : interests,
            }
          : null;

        setServerGuide(guideWithPosts ?? (posts.length ? makeGuideFromPosts(id, posts) : null));
        setServerPosts(posts);
        return Promise.all(posts.map((post) => getPostReviews(getPostId(post)).catch(() => [])));
      })
      .then((reviewGroups) => {
        if (alive && reviewGroups) setGuideReviews(sortReviewsByRecent(reviewGroups.flat()));
      })
      .catch((error) => console.error("\uAC00\uC774\uB4DC \uC815\uBCF4 \uC870\uD68C \uC2E4\uD328", error))
      .finally(() => {
        if (alive) setIsLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [id]);

  const baseGuide =
    serverGuide ??
    (state?.guide ? normalizeGuide(state.guide) : null);
  const guide = useMemo(() => {
    if (!baseGuide) return null;
    if (guideReviews.length === 0) return baseGuide;

    const reviewAverage = getReviewRatingAverage(guideReviews);
    return {
      ...baseGuide,
      rating: reviewAverage,
      avgRating: reviewAverage,
      reviewCount: guideReviews.length,
      totalReviews: guideReviews.length,
    };
  }, [baseGuide, guideReviews]);

  if (isLoading && !guide) {
    return (
      <ErrorBox>
        <p>{"\uAC00\uC774\uB4DC \uC815\uBCF4\uB97C \uBD88\uB7EC\uC624\uB294 \uC911..."}</p>
      </ErrorBox>
    );
  }

  if (!guide) {
    return (
      <ErrorBox>
        <p>{"\uAC00\uC774\uB4DC \uC815\uBCF4\uB97C \uCC3E\uC744 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4."}</p>
        <p style={{ fontSize: 12, color: "#999" }}>URL id: {id}</p>
      </ErrorBox>
    );
  }

  const guidePosts = serverPosts;
  const description =
    guide.description ??
    guide.oneWord ??
    guide.bio ??
    "\uB4F1\uB85D\uB41C \uAC00\uC774\uB4DC \uC124\uBA85\uC774 \uC5C6\uC2B5\uB2C8\uB2E4.";
  // 추가 정보는 현재 프로필 화면에서 숨김 처리합니다.
  // 필요 시 아래 값을 다시 표시하면 됩니다.
  // const joinedAt = guide.joinedAt || "-";
  // const nationality = guide.nationality || "-";
  const headerTitle =
    state?.courseTitle ??
    state?.title ??
    guide.courseTitle ??
    guide.nickname ??
    guide.nickName ??
    "\uD504\uB85C\uD544";

  return (
    <PageWrapper>
      <Header coment={headerTitle} />

      <GuideTabCard guide={guide} showLanguages={activeTab === TAB.INFO} />

      <TabSection>
        <GuideTabMenu activeTab={activeTab} onTabChange={setActiveTab} />
      </TabSection>

      <ContentArea $activeTab={activeTab}>
        {activeTab === TAB.COURSE && (
          <ListWrapper>
            {guidePosts.length > 0 ? (
              guidePosts.map((post, index) => (
                <PostCardList key={getPostId(post) ?? `${post.title}-${index}`} post={post} />
              ))
            ) : (
              <PlaceholderText>{"\uB4F1\uB85D\uB41C \uCF54\uC2A4\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4."}</PlaceholderText>
            )}
          </ListWrapper>
        )}

        {activeTab === TAB.REVIEW && (
          <ListWrapper>
            {guideReviews.length > 0 ? (
              guideReviews.map((review) => (
                <ReviewCard key={review.reviewId ?? review.id} review={review} />
              ))
            ) : (
              <PlaceholderText>{"\uC544\uC9C1 \uC791\uC131\uB41C \uB9AC\uBDF0\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4."}</PlaceholderText>
            )}
          </ListWrapper>
        )}

        {activeTab === TAB.INFO && (
          <InfoWrapper>
            <InfoSection>
              <SectionTitle>{"\uAC00\uC774\uB4DC \uC124\uBA85"}</SectionTitle>
              <SectionContent>{description}</SectionContent>
            </InfoSection>

            {/*
            <InfoSection>
              <SectionTitle>{"추가 정보"}</SectionTitle>
              <AddInfoList>
                <AddInfoItem>{"가입일"}: {joinedAt}</AddInfoItem>
                <AddInfoItem>{"국적"}: {nationality}</AddInfoItem>
              </AddInfoList>
            </InfoSection>
            */}
          </InfoWrapper>
        )}
      </ContentArea>
    </PageWrapper>
  );
}

const PageWrapper = styled.div`
  width: min(var(--app-page-width), 100vw);
  margin: 0 auto;
  background-color: #fff;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
`;

const TabSection = styled.div`
  display: flex;
  justify-content: center;
  padding: 0 0 14px;
  background-color: #fff;
`;

const ContentArea = styled.div`
  flex: 1;
  background-color: ${({ $activeTab }) => ($activeTab === TAB.REVIEW ? "#F3F4F3" : "#fff")};
  padding-bottom: 40px;
`;

const ListWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 0 16px;
  gap: 12px;
`;

const PlaceholderText = styled.div`
  text-align: center;
  padding: 60px 0;
  color: #999;
  font-size: 14px;
`;

const ErrorBox = styled.div`
  width: min(var(--app-page-width), 100vw);
  margin: 100px auto;
  text-align: center;
  line-height: 1.6;
`;

const InfoWrapper = styled.div`
  padding: 24px 20px 32px;
  display: flex;
  flex-direction: column;
  gap: 28px;
`;

const InfoSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

const SectionTitle = styled.h3`
  color: #111;
  font-family: Pretendard, sans-serif;
  font-size: 16px;
  font-weight: 700;
  line-height: 22px;
  margin: 0;
`;

const SectionContent = styled.p`
  color: #4E4E4E;
  font-family: Pretendard, sans-serif;
  font-size: 14px;
  font-weight: 400;
  line-height: 20px;
  letter-spacing: 0.3px;
  margin: 0;
  white-space: pre-line;
`;

const AddInfoList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const AddInfoItem = styled.div`
  font-size: 14px;
  color: #555;
`;
