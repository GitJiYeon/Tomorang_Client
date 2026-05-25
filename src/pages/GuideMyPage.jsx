import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import Header from "../components/Header";
import LogoutButton from "../components/LogoutButton";
import GuideProfileCard from "../components/GuideProfileCard";
import ActivitySection from "../components/ActivitySection";

export default function GuideMyPage() {
  const navigate = useNavigate();

  const raw = localStorage.getItem("profile");
  const profile = raw ? JSON.parse(raw) : null;

  const activityItems = [
    { label: "나의 코스",      onClick: () => navigate("/my-course") },
    { label: "내가 받은 리뷰", onClick: () => navigate("/my-reviews") },
    { label: "숨긴 발견",      onClick: () => navigate("/hidden") },
  ];

  const roleItems = [
    { label: "발견자 전환", onClick: () => navigate("/switch-role") },
  ];

  const langItems = [
    { label: "앱 언어", value: "한국어", onClick: () => navigate("/language") },
  ];

  return (
    <PageWrapper>
      <Header coment={"프로필"} />
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
      <LogoutButton />
    </PageWrapper>
  );
}

const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: #fff;
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
`;