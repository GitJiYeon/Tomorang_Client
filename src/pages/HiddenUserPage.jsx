import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import styled from "styled-components";
import GuideSmallCard from "../components/Guidesmallcard";
import guides from "../data/guideData.json";

export default function HiddenUserPage() {
  const navigate = useNavigate();

  // ✅ 신고된 guideId 목록 읽기
  const [hiddenIds] = useState(() =>
    JSON.parse(localStorage.getItem("hiddenGuides") ?? "[]")
  );

  const hiddenGuides = guides.filter((guide) => hiddenIds.includes(guide.id));

  return (
    <PageWrapper>
      <Header coment={"숨긴 안내자"} />
      <ListWrapper>
        {hiddenGuides.length > 0 ? (
          hiddenGuides.map((guide) => (
            <GuideSmallCard
              key={guide.id}
              guide={guide}
              onClick={() => navigate("/guide", { state: { guide } })}
            />
          ))
        ) : (
          <EmptyText>숨긴 안내자가 없어요</EmptyText>
        )}
      </ListWrapper>
    </PageWrapper>
  );
}

const PageWrapper = styled.div`
  width: min(390px, 100vw);
  height: 100dvh;
  max-height: 100dvh;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: #fff;
`;

const ListWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 16px 0;
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const EmptyText = styled.p`
  margin-top: 80px;
  color: #acacac;
  font-family: Pretendard;
  font-size: 14px;
  font-weight: 500;
`;
