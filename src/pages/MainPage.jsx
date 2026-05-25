import { useState } from "react";
import styled from "styled-components";

import Banner from "../components/mainComponents/Banner";
import BottomNav from "../components/mainComponents/BottomNav";
import CategoryFilter from "../components/mainComponents/CategoryFilter";
import GuideCard from "../components/mainComponents/GuideCard";
import PostCard from "../components/mainComponents/Postcard";
import RegionCard from "../components/mainComponents/RegionCard";
import ReviewCard from "../components/mainComponents/ReviewCard";
import Section from "../components/mainComponents/Section";

import bannerData from "../data/bannerData.json";
import guideData from "../data/guideData.json";
import regionData from "../data/regionData.json";
import postData from "../data/postData.json";
import reviews from "../data/reviews.json";

import MainHeader from "../components/mainComponents/MainHeader";


const SCROLL_ROW = {
  display: "flex",
  gap: 12,
  overflowX: "auto",
  scrollbarWidth: "none",
  msOverflowStyle: "none",
  paddingBottom: 2,
};

export default function MainPage() {
  const lang = "ko";
  const [activeNav, setActiveNav] = useState(0);

  const trendingPosts = postData;
  const salePosts = postData.filter((p) => p.discountRate > 0);

  return (
    <div style={{
      fontFamily: "'Noto Sans KR', 'Apple SD Gothic Neo', sans-serif",
      maxWidth: 390,
      margin: "0 auto",
      backgroundColor: "#fff",
      minHeight: "100vh",
      overflowX: "hidden",
      paddingBottom: 90,
      position: "relative",
    }}>

      <MainHeader />
      
      <TopSection>
        {/* ── Banner ── */}
        <Banner bannerData={bannerData} />
      </TopSection>
      
      {/* ── Category Filter ── */}
      <CategoryFilter onSelect={(cat) => console.log("selected:", cat)} />
      
      {/* ── 떠오르는 코스 ── */}
      <Section title="떠오르는 코스">
        <div style={SCROLL_ROW}>
          {trendingPosts.map((post) => (
            <PostCard key={post.postId} post={post} />
          ))}
        </div>
      </Section>

      {/* ── 떠오르는 여행지 ── */}
      <Section title="떠오르는 여행지" path="/emergingDestination">
        <div style={SCROLL_ROW}>
          {regionData.map((region) => (
            <RegionCard key={region.regionId} region={region} lang={lang} />
          ))}
        </div>
      </Section>

      {/* ── 할인중인 코스 ── */}
      <Section title="할인중인 코스">
        <div style={SCROLL_ROW}>
          {salePosts.map((post) => (
            <PostCard key={post.postId} post={post} isSale />
          ))}
        </div>
      </Section>

      {/* ── 인기있는 가이드 ── */}
      <Section title="인기있는 가이드">
        <div style={SCROLL_ROW}>
          {guideData.map((guide) => (
            <GuideCard key={guide.id} guide={guide} />
          ))}
        </div>
      </Section>

      <ReviewWrapper>
        {/* ── 실시간 리뷰 ── */}
        <Section title="실시간 리뷰">
          <div style={SCROLL_ROW}>
            {reviews
              .filter((r) => r.postImages && r.postImages.length > 0) // postImage -> postImages
  .slice(0, 5)
  .map((review) => (
    <ReviewCard key={review.reviewId} review={review} />
              ))}
          </div>
        </Section>
      </ReviewWrapper>
      {/* ── Bottom Navigation ── */}
      <BottomNav activeIndex={activeNav} onNavChange={setActiveNav} />
    </div>
  );
}
const TopSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px; /* 여기서 간격 조절 */
  margin-bottom: 24px; /* 필터 아래랑 다음 섹션 간격 */
  z-index:300;
`;
const ReviewWrapper = styled.div`
  background-color: #F3F4F3;
`;
