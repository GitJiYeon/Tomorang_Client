import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styled from "styled-components";
import Header from "../components/Header";
import CourseDescription from "../components/CourseDescription";
import CourseTabMenu from "../components/mainComponents/CourseTabMenu";
import postData from "../data/postData.json";
import PostCard from "../components/mainComponents/Postcard";
import Section from "../components/mainComponents/Section";
import ReserveButton from "../components/ReserveButton";
import ContentBlocks from "../components/ContentBlocks";
import OpenButton from "../components/OpenButton";
import ReviewSummary from "../components/ReviewSummary";
import ReviewCard from "../components/ReviewCard1";
import reviews from "../data/reviews.json";
import GuideTab from "../components/GuideTab";
import guideData from "../data/guideData.json";
import GuideDescriptionCard from "../components/GuideDescriptionCard";

export default function CourseDescriptionPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const post = state?.post;

  const [activeTab, setActiveTab] = useState("코스설명");
  const [isExpanded, setIsExpanded] = useState(false);
  const [isReviewExpanded, setIsReviewExpanded] = useState(false);

  const handleNext = () => {
    
  };

  const SCROLL_ROW = {
    display: "flex",
    gap: 12,
    overflowX: "auto",
    scrollbarWidth: "none",
    msOverflowStyle: "none",
    paddingBottom: 2,
  };

  const trendingPosts = postData.filter(
    (p) => p.userId === post?.userId && p.postId !== post?.postId
  );

  if (!post) return <Error>데이터를 불러올 수 없습니다.</Error>;

  return (
    <PageWrapper>
      <Header coment={post.title} />
      <CourseDescription post={post} />

      <TabSection>
        <CourseTabMenu activeTab={activeTab} onTabChange={setActiveTab} />
      </TabSection>

      <ContentArea>
        {activeTab === "코스설명" && (
          <>
            <CollapsibleContainer $isExpanded={isExpanded}>
              <DetailSection>
                <DetailTitle>{post.title}</DetailTitle>
                <TitleDivider />
                <ContentBlocks blocks={post.contentBlocks} />
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

            {/* 펼쳐진 상태일 때 접기 버튼 표시 */}
            {isExpanded && (
              <OpenButtonWrapper>
                <OpenButton $isExpanded={true} onClick={() => setIsExpanded(false)}>
                  상품정보 접기
                </OpenButton>
              </OpenButtonWrapper>
            )}
          </>
        )}

        {activeTab === "리뷰" && (
          <>
            <SummarySection>
              <ReviewSummary
                rating={post.rating || 0}
                reviewCount={post.reviewCount || 0}
              />
            </SummarySection>

            <ReviewCollapsible $isExpanded={isReviewExpanded}>
              <ReviewSection>
                {reviews
                  .filter((review) => review.postId === post.postId)
                  .map((review) => (
                    <React.Fragment key={review.reviewId}>
                      <ReviewCard review={review} />
                    </React.Fragment>
                  ))}
                {reviews.filter((r) => r.postId === post.postId).length === 0 && (
                  <PlaceholderText>아직 리뷰가 없습니다. 🥲</PlaceholderText>
                )}
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

            {/* 펼쳐진 상태일 때 접기 버튼 표시 */}
            {isReviewExpanded && (
              <OpenButtonWrapper>
                <OpenButton $isExpanded={true} onClick={() => setIsReviewExpanded(false)}>
                  리뷰 접기
                </OpenButton>
              </OpenButtonWrapper>
            )}
          </>
        )}

        {activeTab === "가이드" && (() => {
          const guide = guideData.find((g) => g.postIds.includes(post.postId));
          return guide ? (
            <GuideBg>
              <GuideTab guide={guide} />
              <GuideDescriptionCard guide={guide} />
            </GuideBg>
          ) : (
            <PlaceholderText>가이드 정보를 찾을 수 없습니다. 💡</PlaceholderText>
          );
        })()}
      </ContentArea>

      {activeTab !== "가이드" && trendingPosts.length > 0 && (
        <Section title="이 가이드의 다른코스">
          <div style={SCROLL_ROW}>
            {trendingPosts.map((p) => (
              <PostCard key={p.postId} post={p} />
            ))}
          </div>
        </Section>
      )}
      <Bottom>
        <ReserveButton 
          isValid={true} 
          onClick={() => navigate(`/reservation/${post.postId}`)} 
        />
      </Bottom>
    </PageWrapper>
  );
}

// --- Styled Components ---

const PageWrapper = styled.div`
  width: 390px;
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
  transition: max-height 0.3s ease-in-out;
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
  text-align: center;
  padding: 24px 16px 20px;
`;

const DetailTitle = styled.h3`
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 16px;
`;

const TitleDivider = styled.div`
  width: 1px;
  height: 60px;
  background: #000;
  margin: 16px auto;
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
  width: 390px;
  margin: 100px auto;
  text-align: center;
`;

const ReviewSection = styled.div`
  display: flex;
  flex-direction: column;
  background-color: #F3F4F3;
  gap: 8px;
  padding: 8px 0;
`;

const SummarySection = styled.div`
  background-color: #fff;
  padding: 16px;
`;

const ReviewCollapsible = styled.div`
  position: relative;
  max-height: ${({ $isExpanded }) => ($isExpanded ? "none" : "700px")};
  overflow: hidden;
  transition: max-height 0.3s ease-in-out;
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