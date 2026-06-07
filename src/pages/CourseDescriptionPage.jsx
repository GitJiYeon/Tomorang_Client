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
import { getPostDetail, getPostReviews, getPosts } from "../api/tomorang";

const TAB = {
  COURSE: "course",
  REVIEW: "review",
  GUIDE: "guide",
};

function getPostId(post) {
  return post?.postId ?? post?.post_id ?? post?.id;
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
  const postId = getPostId(post);

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
    if (!post?.userId) return;

    let alive = true;
    getPosts({ userId: post.userId })
      .then((posts) => {
        if (!alive) return;
        setRelatedPosts(posts.filter((item) => getPostId(item) !== postId));
      })
      .catch((error) => console.error("가이드 다른 코스 조회 실패", error));

    return () => {
      alive = false;
    };
  }, [post?.userId, postId]);

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
      <Header coment={post.title} />
      <CourseDescription post={post} />

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
                rating={post.rating || 0}
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
          post.guide ? (
            <GuideBg>
              <GuideTab guide={post.guide} />
              <GuideDescriptionCard guide={post.guide} />
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

      <Bottom>
        <ReserveButton
          isValid
          onClick={() => navigate(`/reservation/${getPostId(post)}`)}
        />
      </Bottom>
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
