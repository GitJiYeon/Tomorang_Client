import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import Header from "../components/Header";
import GuideBottomNav from "../components/mainComponents/GuideBottomNav";
import LogoutButton from "../components/LogoutButton";
import GuideProfileCard from "../components/GuideProfileCard";
import ActivitySection from "../components/ActivitySection";
import { getMypage, logoutMember, switchMemberRole } from "../api/tomorang";

export default function GuideMyPage() {
  const navigate = useNavigate();
  const [isBusy, setIsBusy] = useState(false);

  const raw = localStorage.getItem("profile");
  const profile = raw ? JSON.parse(raw) : null;
  const currentGuideId = localStorage.getItem("userId") || profile?.id || profile?.guideId || "1";

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
      localStorage.removeItem("accessToken");
      localStorage.removeItem("tokenType");
      localStorage.removeItem("userId");
      localStorage.removeItem("profile");
      navigate("/", { replace: true });
    } finally {
      setIsBusy(false);
    }
  };

  const activityItems = [
    { label: "나의 코스", onClick: () => navigate("/my-course") },
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
  width: min(390px, 100vw);
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
