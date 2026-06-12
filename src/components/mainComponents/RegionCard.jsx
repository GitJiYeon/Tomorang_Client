import styled from "styled-components";
import { resolvePublicAsset } from "../../utils/publicAsset";

/**
 * 호출 방법:
 * <RegionCard region={region} lang="ko" />
 * lang: "ko" | "ja" | "en" (기본값 "ko")
 */
export default function RegionCard({ region, lang = "ko" }) {
  const cityName = region.translations[lang]?.cityName ?? region.translations.ko.cityName;
  const tags = region.tags[lang] ?? region.tags.ko;

  return (
    <Card>
      <BgImg
        src={resolvePublicAsset(region.image)}
        alt={cityName}
        onError={e => { e.target.style.background = "#cde"; e.target.removeAttribute("src"); }}
      />
      {/*<Overlay />*/}
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
  width: 160px;
  height: 160px;
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

/* 
const Overlay = styled.div`
  position: absolute;
  margin: 15px;
  inset: 0;
  background: radial-gradient(50% 50% at 50% 50%, #247A93 0%, rgba(36, 122, 147, 0) 100%);
`;
중앙에서만 퍼지는 래디얼 그래디언트 오버레이 */

const Content = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
`;

const CityName = styled.div`
  font-family: "Pretendard", sans-serif;
  font-weight: 700;
  font-size: 16px;
  line-height: 100%;
  letter-spacing: -0.1%;
  text-align: center;
  color: #fff;
`;

const TagRow = styled.div`
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
  justify-content: center;
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
