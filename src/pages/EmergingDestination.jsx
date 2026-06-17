import { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import EmergingCard from "../components/EmergingCard";
import regionData from "../data/regionData.json";
import { getPosts } from "../api/tomorang";
import { filterEmergingRegionsByPosts } from "../utils/emergingRegions";
import { resolvePublicAsset } from "../utils/publicAsset";

export default function EmergingDestination() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    let alive = true;
    getPosts()
      .then((items) => {
        if (alive) setPosts(items);
      })
      .catch((error) => {
        console.error("떠오르는 여행지 게시글 조회 실패", error);
        if (alive) setPosts([]);
      });

    return () => {
      alive = false;
    };
  }, []);

  const visibleRegions = useMemo(
    () => filterEmergingRegionsByPosts(regionData, posts),
    [posts]
  );

  const handleCardClick = (item) => {
    navigate("/destination", {
      state: {
        region: item,
        image: resolvePublicAsset(item.risingimg),
        cityName: item.translations,
        tags: item.tags,
      },
    });
  };

  return (
    <PageWrapper>
      <Header coment="떠오르는 여행지" />
      <ListContainer>
        {visibleRegions.map((item) => (
          <EmergingCard
            key={item.regionId}
            region={item}
            lang="ko"
            onClick={() => handleCardClick(item)}
          />
        ))}
        {visibleRegions.length === 0 && <EmptyText>표시할 여행지가 없습니다.</EmptyText>}
      </ListContainer>
    </PageWrapper>
  );
}

const PageWrapper = styled.div`
  width: 100%;
  min-height: 100vh;
  background-color: #fff;
`;

const ListContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 16px;
  gap: 12px;
`;

const EmptyText = styled.div`
  padding: 60px 0;
  color: #999;
  font-size: 14px;
`;
