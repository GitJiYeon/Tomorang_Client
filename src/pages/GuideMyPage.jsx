import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import Header from "../components/Header";
import GuideBottomNav from "../components/mainComponents/GuideBottomNav";
import LogoutButton from "../components/LogoutButton";
import GuideProfileCard from "../components/GuideProfileCard";
import ActivitySection from "../components/ActivitySection";
import { getMypage, getPosts, logoutMember, switchMemberRole } from "../api/tomorang";
import { clearAuthStorage } from "../api/client";
import { getPostRatingAverage, getPostWishlistCount } from "../utils/postStats";

const toNumber = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
};

const getReviewCount = (post) => toNumber(post?.reviewCount ?? post?.review_count);

function getGuidePostStats(posts = []) {
  const ratings = posts
    .map((post) => ({
      rating: getPostRatingAverage(post),
      reviewCount: getReviewCount(post),
    }))
    .filter(({ rating }) => rating > 0);
  const totalReviewCount = ratings.reduce((sum, item) => sum + item.reviewCount, 0);
  const rating =
    totalReviewCount > 0
      ? ratings.reduce((sum, item) => sum + item.rating * item.reviewCount, 0) / totalReviewCount
      : ratings.length > 0
        ? ratings.reduce((sum, item) => sum + item.rating, 0) / ratings.length
        : 0;
  const likeCount = posts.reduce((sum, post) => sum + getPostWishlistCount(post), 0);

  return {
    postCount: posts.length,
    likeCount,
    totalLikes: likeCount,
    rating,
    avgRating: rating,
  };
}

export default function GuideMyPage() {
  const navigate = useNavigate();
  const [isBusy, setIsBusy] = useState(false);

  const raw = localStorage.getItem("profile");
  const [profile, setProfile] = useState(() => (raw ? JSON.parse(raw) : null));
  const currentGuideId = localStorage.getItem("userId") || profile?.id || profile?.guideId || "1";

  useEffect(() => {
    let alive = true;

    getMypage()
      .then((mypage) => {
        if (!alive || !mypage) return;
        setProfile((prev) => {
          const nextProfile = { ...(prev ?? {}), ...mypage, role: mypage.role ?? prev?.role ?? "GUIDE" };
          localStorage.setItem("profile", JSON.stringify(nextProfile));
          return nextProfile;
        });
      })
      .catch((error) => console.error("마이페이지 프로필 조회 실패", error));

    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    let alive = true;

    async function loadGuideStats() {
      const guideId =
        currentGuideId ??
        localStorage.getItem("userId") ??
        profile?.id ??
        profile?.guideId;
      if (!guideId) return;

      try {
        const posts = await getPosts({ userId: guideId, includeHidden: true });
        const postStats = getGuidePostStats(posts);
        if (!alive) return;

        setProfile((prev) => {
          const nextProfile = { ...(prev ?? {}), ...postStats };
          localStorage.setItem("profile", JSON.stringify(nextProfile));
          return nextProfile;
        });
      } catch (error) {
        console.error("가이드 마이페이지 통계 조회 실패", error);
      }
    }

    loadGuideStats();

    return () => {
      alive = false;
    };
  }, [currentGuideId, profile?.guideId, profile?.id]);

  const handleSwitchToDiscoverer = async () => {
    if (isBusy) return;
    setIsBusy(true);
    try {
      await switchMemberRole("DISCOVERER");
      const mypage = await getMypage().catch(() => null);
      localStorage.setItem("profile", JSON.stringify({ ...profile, ...mypage, role: "DISCOVERER" }));
      navigate("/main", { replace: true });
    } catch (error) {
      alert(error.message || "발견자로 전환하지 못했습니다.");
    } finally {
      setIsBusy(false);
    }
  };

  const handleLogout = async () => {
    if (isBusy) return;
    setIsBusy(true);
    try {
      await logoutMember().catch(() => null);
      clearAuthStorage();
      navigate("/", { replace: true });
    } finally {
      setIsBusy(false);
    }
  };

  const activityItems = [
    { label: "나의 코스", onClick: () => navigate("/my-course", { state: { mode: "guide" } }) },
    {
      label: "내가 받은 리뷰",
      onClick: () => navigate("/my-reviews", { state: { mode: "received", guideId: currentGuideId } }),
    },
    { label: "숨긴 발견자", onClick: () => navigate("/hidden") },
  ];

  const roleItems = [
    { label: "발견자로 전환", onClick: handleSwitchToDiscoverer },
  ];

  const langItems = [
    { label: "앱 언어", value: "한국어", onClick: () => navigate("/edit-language") },
  ];

  return (
    <PageWrapper>
      <Header coment="프로필" />
      <GuideProfileCard
        profile={profile}
        onEditPress={() => navigate("/edit-profile")}
      />
      <Divider />
      <SectionsArea>
        <ActivitySection title="활동" items={activityItems} />
        <ActivitySection title="역할 전환" items={roleItems} />
        <ActivitySection title="언어 설정" items={langItems} />
      </SectionsArea>
      <LogoutButton onClick={handleLogout} disabled={isBusy} />
      <GuideBottomNav activeIndex={3} />
    </PageWrapper>
  );
}

const PageWrapper = styled.div`
  width: min(var(--app-page-width), 100vw);
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  height: 100dvh;
  max-height: 100dvh;
  background: #fff;
  overflow: hidden;
`;

const Divider = styled.div`
  width: 100%;
  height: 1px;
  background: #F3F4F3;
`;

const SectionsArea = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 20px 20px;
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
`;
