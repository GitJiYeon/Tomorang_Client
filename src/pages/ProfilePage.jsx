import { useNavigate } from "react-router-dom";
import { useState } from "react";
import styled from "styled-components";
import Header from "../components/Header";
import BottomNav from "../components/mainComponents/BottomNav";
import LogoutButton from "../components/LogoutButton";
import ProfileCard from "../components/ProfileCard";
import ActivitySection from "../components/ActivitySection";
import { logoutMember } from "../api/tomorang";

export default function ProfilePage() {
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const raw = localStorage.getItem("profile");
  const profile = raw ? JSON.parse(raw) : null;

  const activityItems = [
    { label: "찜한 코스",     onClick: () => navigate("/my-course") },
    { label: "내가 쓴 리뷰", onClick: () => navigate("/my-reviews", { state: { mode: "written" } }) },
    { label: "숨긴 안내자",   onClick: () => navigate("/hidden") },
  ];

  const handleLogout = async () => {
    if (isLoggingOut) return;

    setIsLoggingOut(true);
    try {
      await logoutMember();
    } catch (error) {
      console.error("로그아웃 요청 실패", error);
    } finally {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("tokenType");
      localStorage.removeItem("userId");
      localStorage.removeItem("profile");
      setIsLoggingOut(false);
      navigate("/", { replace: true });
    }
  };

  const roleItems = [
    { label: "가이드로 전환", onClick: () => navigate("/guidesignup", { state: { mode: "switch" } }) },
  ];

  const langItems = [
    { label: "앱 언어", value: "한국어", onClick: () => navigate("/edit-language") },
  ];

  return (
    <PageWrapper>
      <Header coment={"프로필"} />
      <ProfileCard
        profile={profile}
        onEditPress={() => navigate("/edit-profile")}
      />
      <Divider />
      <SectionsArea>
        <ActivitySection title="활동" items={activityItems} />
        <ActivitySection title="역할 전환" items={roleItems} />
        <ActivitySection title="언어 설정" items={langItems} />
      </SectionsArea>
      <LogoutButton onClick={handleLogout} disabled={isLoggingOut} />
      <BottomNav activeIndex={4} />
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
