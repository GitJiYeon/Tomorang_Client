import styled from "styled-components";
import { resolvePublicAsset } from "../utils/publicAsset";

export default function EmergingCard({ region, lang = "ko", onClick }) {  // ← onClick 추가
  const cityName = region.translations[lang]?.cityName ?? region.translations.ko.cityName;
  const tags = region.tags[lang] ?? region.tags.ko;

  return (
    <Card onClick={onClick}>
      <BgImg
        src={resolvePublicAsset(region.risingimg)}
        alt={cityName}
        onError={e => { e.target.style.background = "#cde"; e.target.removeAttribute("src"); }}
      />
      <Content>
        <CityName>{cityName}</CityName>
        <TagRow>
          {tags.map(tag => (
            <Tag key={tag}>#{tag}</Tag>
          ))}
        </TagRow>
      </Content>
    </Card>
  );
}
const Card = styled.div`
  position: relative;
  width: 348px;
  height: 110px;
  border-radius: 12px;
  overflow: hidden;
  flex-shrink: 0;
  cursor: pointer;
`;

const BgImg = styled.img`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
`;

const Content = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  padding-left: 21px;
  gap: 4px;
`;

const CityName = styled.div`
  font-family: "Pretendard", sans-serif;
  font-weight: 700;
  font-size: 16px;
  line-height: 100%;
  color: #fff;
  letter-spacing: -0.016px;
`;

const TagRow = styled.div`
  display: flex;
  gap: 4px;
`;

const Tag = styled.span`
  height: 22px;
  border-radius: 50px;
  border: 1px solid rgba(255, 255, 255, 0.7);
  padding: 5px 8px;
  box-sizing: border-box;
  font-family: "Pretendard", sans-serif;
  font-weight: 400;
  font-size: 10px;
  line-height: 100%;
  letter-spacing: -0.1%;
  color: #fff;
  white-space: nowrap;
`;
