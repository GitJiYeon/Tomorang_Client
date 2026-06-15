import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styled from "styled-components";
import Header from "../components/Header";
import CourseDescription from "../components/CourseDescription";
import CourseTabMenu from "../components/mainComponents/CourseTabMenu";
import PostCard from "../components/mainComponents/PostCard";
import Section from "../components/mainComponents/Section";
import ReserveButton from "../components/ReserveButton";
import ContentBlocks from "../components/ContentBlocks";
import OpenButton from "../components/OpenButton";
import ReviewSummary from "../components/ReviewSummary";
import ReviewCard from "../components/ReviewCard1";
import GuideTab from "../components/GuideTab";
import GuideDescriptionCard from "../components/GuideDescriptionCard";
import { getPopularGuides, getPostDetail, getPostReviews, getPosts } from "../api/tomorang";
import { getPostOwnerId, isOwnPost } from "../utils/postOwner";
import { getPostRatingAverage, getPostWishlistCount, getReviewRatingAverage } from "../utils/postStats";

const TAB = {
  COURSE: "course",
  REVIEW: "review",
  GUIDE: "guide",
};

function getPostId(post) {
  return post?.postId ?? post?.post_id ?? post?.id;
}

function getGuideId(guide) {
  return guide?.guideId ?? guide?.guide_id ?? guide?.userId ?? guide?.user_id ?? guide?.username ?? guide?.id;
}

function firstText(...values) {
  return values.find((value) => typeof value === "string" && value.trim());
}

function normalizeGuide(guide, ownerId, posts = []) {
  if (!guide && !ownerId) return null;
  const source = { ...(guide ?? {}) };
  const likeCount = posts.reduce((sum, item) => sum + getPostWishlistCount(item), 0);
  const ratingTotal = posts.reduce((sum, item) => sum + getPostRatingAverage(item), 0);
  const rating = posts.length ? ratingTotal / posts.length : 0;
  const guideIntro = firstText(source.oneWord, source.one_word, source.introduction);
  const normalizedBio = firstText(guideIntro, source.bio, source.about, source.summary);
  const normalizedDescription = firstText(
    source.guideDescription,
    source.guide_description,
    guideIntro,
    source.description,
    source.bio
  );
  source.bio = normalizedBio ?? source.bio;
  source.description = normalizedDescription ?? source.description;

  return {
    ...source,
    id: getGuideId(source) ?? ownerId,
    userId: source.userId ?? source.user_id ?? ownerId,
    profileImage:
      source.profileImage ??
      source.profile_image ??
      source.image ??
      source.memberImage ??
      source.member_image ??
      source.profile ??
      source.profileUrl ??
      source.profile_url,
    nickname:
      source.nickname ??
      source.nickName ??
      source.name ??
      source.memberNickName ??
      source.member_nick_name ??
      ownerId,
    bio: source.bio ?? source.oneWord ?? source.introduction ?? "소개가 아직 없습니다.",
    description:
      source.description ??
      source.guideDescription ??
      source.guide_description ??
      source.bio ??
      source.oneWord ??
      "등록된 코스를 안내하는 가이드입니다.",
    rating: source.rating ?? source.avgRating ?? rating,
    likeCount: source.likeCount ?? source.totalLikes ?? likeCount,
    postCount: source.postCount ?? source.postIds?.length ?? posts.length,
  };
}

function makeGuideFromPost(post, posts = []) {
  const ownerId = getPostOwnerId(post);
  if (!ownerId) return null;
  return normalizeGuide(
    {
      ...(post?.guide ?? {}),
      id: ownerId,
      userId: ownerId,
      profileImage:
        post?.guideImage ??
        post?.guideProfileImage ??
        post?.guide_profile_image ??
        post?.memberImage ??
        post?.member_image ??
        post?.profileImage ??
        post?.profile_image ??
        post?.userImage ??
        post?.user_image,
      nickname:
        post?.guideNickname ??
        post?.guideNickName ??
        post?.guide_nickname ??
        post?.memberNickName ??
        post?.member_nick_name ??
        post?.nickname,
      bio: post?.guideBio ?? post?.guide_bio ?? post?.guide?.bio ?? post?.guide?.oneWord,
      description:
        post?.guideDescription ??
        post?.guide_description ??
        post?.guide?.description ??
        post?.guide?.guideDescription ??
        post?.guide?.guide_description ??
        post?.guide?.bio ??
        post?.guide?.oneWord,
    },
    ownerId,
    posts
  );
}

export default function CourseDescriptionPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const initialPost = useMemo(
    () => state?.post ?? JSON.parse(sessionStorage.getItem("currentCoursePost") || "null"),
    [state]
  );
  const [post, setPost] = useState(initialPost);
  const [activeTab, setActiveTab] = useState(state?.initialTab ?? TAB.COURSE);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isReviewExpanded, setIsReviewExpanded] = useState(false);
  const [postReviews, setPostReviews] = useState(state?.initialReviews ?? []);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [guideInfo, setGuideInfo] = useState(null);
  const postId = getPostId(post);
  const ownerId = getPostOwnerId(post);

  useEffect(() => {
    setPost(initialPost);
  }, [initialPost]);

  useEffect(() => {
    if (!postId) return;
    const alreadyHasDetail = post?.images?.length || post?.contentBlocks?.length;
    const isServerPost = post?.post_id !== undefined || post?.createdAt || post?.updatedAt;
    if (alreadyHasDetail && !isServerPost) return;

    let alive = true;
    getPostDetail(postId)
      .then((detail) => {
        if (!alive) return;
        setPost((prev) => {
          const merged = {
            ...prev,
            ...detail,
            images: detail.images?.length ? detail.images : prev?.images ?? [],
            contentBlocks: detail.contentBlocks?.length ? detail.contentBlocks : prev?.contentBlocks ?? [],
          };
          sessionStorage.setItem("currentCoursePost", JSON.stringify(merged));
          return merged;
        });
      })
      .catch((error) => console.error("게시물 상세 조회 실패", error));

    return () => {
      alive = false;
    };
  }, [postId]);

  useEffect(() => {
    if (!postId) return;

    let alive = true;
    getPostReviews(postId)
      .then((reviews) => {
        if (alive) setPostReviews(reviews.length > 0 ? reviews : state?.initialReviews ?? []);
      })
      .catch((error) => console.error("리뷰 목록 조회 실패", error));

    return () => {
      alive = false;
    };
  }, [postId]);

  useEffect(() => {
    if (!ownerId) return;

    let alive = true;
    getPosts({ userId: ownerId })
      .then((posts) => {
        if (!alive) return;
        setRelatedPosts(posts.filter((item) => getPostId(item) !== postId));
      })
      .catch((error) => console.error("가이드 다른 코스 조회 실패", error));

    return () => {
      alive = false;
    };
  }, [ownerId, postId]);

  useEffect(() => {
    if (!ownerId) return;

    let alive = true;
    const fallbackGuide = makeGuideFromPost(post, [post, ...relatedPosts].filter(Boolean));
    setGuideInfo(fallbackGuide);

    getPopularGuides()
      .then((guides) => {
        if (!alive) return;
        const matchedGuide = guides.find((guide) => String(getGuideId(guide)) === String(ownerId));
        if (!matchedGuide) return;
        setGuideInfo((prev) =>
          normalizeGuide(
            {
              ...fallbackGuide,
              ...prev,
              ...matchedGuide,
              profileImage: matchedGuide.profileImage ?? matchedGuide.image ?? prev?.profileImage ?? fallbackGuide?.profileImage,
            },
            ownerId,
            [post, ...relatedPosts].filter(Boolean)
          )
        );
      })
      .catch((error) => console.error("가이드 정보 조회 실패", error));

    return () => {
      alive = false;
    };
  }, [ownerId, post, relatedPosts]);

  const guideForTab = guideInfo ?? makeGuideFromPost(post, [post, ...relatedPosts].filter(Boolean));
  const reviewAverage =
    postReviews.length > 0
      ? getReviewRatingAverage(postReviews)
      : getPostRatingAverage(post);
  const displayPost = post ? { ...post, rating: reviewAverage } : post;

  const scrollRow = {
    display: "flex",
    gap: 12,
    overflowX: "auto",
    scrollbarWidth: "none",
    msOverflowStyle: "none",
    paddingBottom: 2,
  };

  if (!post) return <Error>게시물 정보를 불러올 수 없습니다.</Error>;

  return (
    <PageWrapper>
      <Header coment={displayPost.title} />
      <CourseDescription post={displayPost} />

      <TabSection>
        <CourseTabMenu activeTab={activeTab} onTabChange={setActiveTab} />
      </TabSection>

      <ContentArea>
        {activeTab === TAB.COURSE && (
          <>
            <CollapsibleContainer $isExpanded={isExpanded}>
              <DetailSection>
                <DetailTitle>{post.title}</DetailTitle>
                <TitleDivider />
                {post.contentBlocks?.length ? (
                  <ContentBlocks blocks={post.contentBlocks} />
                ) : (
                  <PlaceholderText>등록된 상품정보가 없습니다.</PlaceholderText>
                )}
              </DetailSection>

              {!isExpanded && (
                <FadeOverlay>
                  <OpenButtonWrapper>
                    <OpenButton $isExpanded={false} onClick={() => setIsExpanded(true)}>
                      상품정보 펼쳐보기
                    </OpenButton>
                  </OpenButtonWrapper>
                </FadeOverlay>
              )}
            </CollapsibleContainer>

            {isExpanded && (
              <OpenButtonWrapper>
                <OpenButton $isExpanded onClick={() => setIsExpanded(false)}>
                  상품정보 접기
                </OpenButton>
              </OpenButtonWrapper>
            )}
          </>
        )}

        {activeTab === TAB.REVIEW && (
          <>
            <SummarySection>
              <ReviewSummary
                rating={reviewAverage}
                reviewCount={postReviews.length || post.reviewCount || 0}
              />
            </SummarySection>

            <ReviewCollapsible $isExpanded={isReviewExpanded}>
              <ReviewSection>
                {postReviews.map((review) => (
                  <React.Fragment key={review.reviewId}>
                    <ReviewCard review={review} />
                  </React.Fragment>
                ))}
                {postReviews.length === 0 && <PlaceholderText>아직 리뷰가 없습니다.</PlaceholderText>}
              </ReviewSection>

              {!isReviewExpanded && (
                <ReviewFadeOverlay>
                  <OpenButtonWrapper>
                    <OpenButton $isExpanded={false} onClick={() => setIsReviewExpanded(true)}>
                      리뷰 더보기
                    </OpenButton>
                  </OpenButtonWrapper>
                </ReviewFadeOverlay>
              )}
            </ReviewCollapsible>

            {isReviewExpanded && (
              <OpenButtonWrapper>
                <OpenButton $isExpanded onClick={() => setIsReviewExpanded(false)}>
                  리뷰 접기
                </OpenButton>
              </OpenButtonWrapper>
            )}
          </>
        )}

        {activeTab === TAB.GUIDE && (
          guideForTab ? (
            <GuideBg>
              <GuideTab guide={guideForTab} />
              <GuideDescriptionCard guide={guideForTab} />
            </GuideBg>
          ) : (
            <PlaceholderText>가이드 정보를 찾을 수 없습니다.</PlaceholderText>
          )
        )}
      </ContentArea>

      {activeTab !== TAB.GUIDE && relatedPosts.length > 0 && (
        <Section title="이 가이드의 다른코스">
          <div style={scrollRow}>
            {relatedPosts.map((item, index) => (
              <PostCard key={getPostId(item) ?? `${item.title}-${index}`} post={item} />
            ))}
          </div>
        </Section>
      )}

      {!isOwnPost(post) && (
        <Bottom>
          <ReserveButton
            isValid
            onClick={() => navigate(`/reservation/${getPostId(post)}`, { state: { post } })}
          />
        </Bottom>
      )}
    </PageWrapper>
  );
}

const PageWrapper = styled.div`
  width: min(390px, 100vw);
  margin: 0 auto;
  background-color: #fff;
  display: flex;
  flex-direction: column;
`;

const GuideBg = styled.div`
  background-color: #F3F4F3;
  padding: 12px 0 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const CollapsibleContainer = styled.div`
  position: relative;
  max-height: ${({ $isExpanded }) => ($isExpanded ? "none" : "450px")};
  overflow: hidden;
`;

const FadeOverlay = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 160px;
  background: linear-gradient(
    to bottom,
    rgba(255, 255, 255, 0) 0%,
    rgba(255, 255, 255, 0.95) 60%,
    rgba(255, 255, 255, 1) 100%
  );
  display: flex;
  align-items: flex-end;
  justify-content: center;
`;

const OpenButtonWrapper = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  padding-bottom: 30px;
`;

const DetailSection = styled.div`
  padding: 24px 16px 20px;
`;

const DetailTitle = styled.h3`
  color: #111;
  text-align: center;
  font-size: 18px;
  font-weight: 700;
  margin: 0;
`;

const TitleDivider = styled.div`
  width: 1px;
  height: 60px;
  background: #000;
  margin: 20px auto 24px;
`;

const TabSection = styled.div``;

const ContentArea = styled.div`
  flex: 1;
`;

const Bottom = styled.div`
  display: flex;
  justify-content: center;
  padding: 10px 0 21px;
`;

const PlaceholderText = styled.div`
  text-align: center;
  padding: 60px 0;
  color: #999;
`;

const Error = styled.div`
  width: min(390px, 100vw);
  margin: 100px auto;
  text-align: center;
`;

const ReviewSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: #F3F4F3;
  gap: 8px;
  padding: 8px 0 18px;
`;

const SummarySection = styled.div`
  background-color: #fff;
  padding: 16px;
`;

const ReviewCollapsible = styled.div`
  position: relative;
  max-height: ${({ $isExpanded }) => ($isExpanded ? "none" : "700px")};
  overflow: hidden;
`;

const ReviewFadeOverlay = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 160px;
  background: linear-gradient(
    to bottom,
    rgba(243, 244, 243, 0) 0%,
    rgba(243, 244, 243, 0.95) 60%,
    rgba(243, 244, 243, 1) 100%
  );
  display: flex;
  align-items: flex-end;
  justify-content: center;
`;
