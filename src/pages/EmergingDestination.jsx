import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import EmergingCard from "../components/EmergingCard";
import regionData from "../data/regionData.json";
import { resolvePublicAsset } from "../utils/publicAsset";

export default function EmergingDestination() {
  const navigate = useNavigate();

  const handleCardClick = (item) => {
    navigate("/destination", {
      state: {
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
        {regionData.map((item) => (
          <EmergingCard
            key={item.regionId}
            region={item}
            lang="ko"
            onClick={() => handleCardClick(item)}
          />
        ))}
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
