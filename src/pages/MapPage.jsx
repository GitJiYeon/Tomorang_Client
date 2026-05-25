import { useState, useEffect } from "react";
import styled, { createGlobalStyle } from "styled-components";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import postData from "../data/postData.json";
import MainHeader from "../components/mainComponents/MainHeader";
import BottomNav from "../components/mainComponents/BottomNav";
import FilterBar from "../components/FilterBar";
import HeartIcon from "../assets/heart.svg";
import StarIcon from "../assets/mapStar.svg";
import LikeIcon from "../assets/likeIcon.svg";
import MarkerIconSrc from "../assets/mapMarker.svg";
import BubbleIconSrc from "../assets/mapBubble.svg";

const markerIcon = L.icon({
  iconUrl: MarkerIconSrc,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  shadowUrl: "",
});

const bubbleIcon = L.icon({
  iconUrl: BubbleIconSrc,
  iconSize: [125, 57],
  iconAnchor: [62, 57],
  shadowUrl: "",
});

function FlyTo({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.flyTo(center, 12, { duration: 1 });
  }, [center, map]);
  return null;
}

function MarkerLabel({ post }) {
  const map = useMap();
  const [pos, setPos] = useState(null);

  useEffect(() => {
    const update = () => {
      const p = map.latLngToContainerPoint([post.city.lat, post.city.lng]);
      setPos(p);
    };
    update();
    map.on("move zoom", update);
    return () => map.off("move zoom", update);
  }, [map, post]);

  if (!pos) return null;

  return (
    <LabelOverlay style={{ left: pos.x, top: pos.y }}>
      {post.title}
    </LabelOverlay>
  );
}

export default function MapPage() {
  const [activeNav, setActiveNav] = useState(1);
  const [selectedPost, setSelectedPost] = useState(null);
  const [likedPosts, setLikedPosts] = useState({});
  const [mapCenter, setMapCenter] = useState([35.5, 139.5]);
  const [filter, setFilter] = useState({ sort: "추천순", category: "애니메이션" });

  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      (pos) => {
        const loc = [pos.coords.latitude, pos.coords.longitude];
        setMapCenter(loc);
      },
      () => {}
    );
  }, []);

  const toggleLike = (postId, e) => {
    e.stopPropagation();
    setLikedPosts((prev) => ({ ...prev, [postId]: !prev[postId] }));
  };

  const finalPrice = (post) => {
    const raw = parseInt(post.price.replace(/,/g, ""), 10);
    return post.discountRate ? Math.round(raw * (1 - post.discountRate / 100)) : raw;
  };

  // FilterBar 필터+정렬 적용
  const filteredPosts = postData
    .filter((p) =>
      filter.category
        ? p.tag?.ko?.includes(filter.category) || p.title.includes(filter.category)
        : true
    )
    .sort((a, b) => {
      if (filter.sort === "인기순") return b.likeCount - a.likeCount;
      if (filter.sort === "가격순")
        return parseInt(a.price.replace(/,/g, ""), 10) - parseInt(b.price.replace(/,/g, ""), 10);
      return b.rating - a.rating;
    });

  return (
    <Wrapper>
      <LeafletZFix />
      <MainHeader />

      <MapWrap>
        <MapContainer
          center={mapCenter}
          zoom={11}
          style={{ width: "100%", height: "100%", zIndex: 0 }}
          zoomControl={false}
          dragging={!selectedPost}
          scrollWheelZoom={!selectedPost}
          doubleClickZoom={!selectedPost}
          touchZoom={!selectedPost}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="" />
          <FlyTo center={mapCenter} />

          {postData.map((post) => {
            const isSelected = selectedPost?.postId === post.postId;
            return (
              <Marker
                key={post.postId}
                position={[post.city.lat, post.city.lng]}
                icon={isSelected ? bubbleIcon : markerIcon}
                eventHandlers={{
                  click: () => {
                    if (isSelected) setSelectedPost(null);
                    else {
                      setSelectedPost(post);
                      setMapCenter([post.city.lat, post.city.lng]);
                    }
                  },
                }}
              />
            );
          })}

          {selectedPost && <MarkerLabel post={selectedPost} />}
        </MapContainer>
      </MapWrap>

      {/* 마커 미선택: 바텀시트 */}
      {!selectedPost && (
        <BottomSheet>
          <SheetFixed>
            <HandleBar />
            <SheetTitle>주위에 있는 코스</SheetTitle>
            <FilterBar onFilterChange={setFilter} />
          </SheetFixed>
          <CardList>
            {filteredPosts.length === 0 ? (
              <Empty>주위에 코스가 없습니다</Empty>
            ) : (
              filteredPosts.map((post) => {
                const raw = parseInt(post.price.replace(/,/g, ""), 10);
                const price = post.discountRate
                  ? Math.round(raw * (1 - post.discountRate / 100))
                  : raw;
                return (
                  <HCard key={post.postId}>
                    <HCardImage
                      src={post.images?.[0]}
                      alt={post.title}
                      onError={(e) => { e.target.style.background = "#eee"; e.target.removeAttribute("src"); }}
                    />
                    <HCardInfo>
                      <HCardTitle>{post.title}</HCardTitle>
                      <HCardSubtitle>{post.subtitle}</HCardSubtitle>
                      {post.discountRate > 0 && (
                        <HCardOriginalPrice>{raw.toLocaleString()}원</HCardOriginalPrice>
                      )}
                      <HCardPriceRow>
                        {post.discountRate > 0 && <HCardSale>SALE</HCardSale>}
                        <HCardPrice>{price.toLocaleString()}원</HCardPrice>
                      </HCardPriceRow>
                    </HCardInfo>
                  </HCard>
                );
              })
            )}
          </CardList>
        </BottomSheet>
      )}

      {/* 마커 선택: 플로팅 카드 */}
      {selectedPost && (() => {
        const post = selectedPost;
        const isLiked = likedPosts[post.postId];
        return (
          <FloatingCard>
            <CardImageWrap>
              <CardImage
                src={post.images?.[0]}
                alt={post.title}
                onError={(e) => { e.target.style.background = "#ddd"; e.target.removeAttribute("src"); }}
              />
              <HeartBtn $liked={isLiked} onClick={(e) => toggleLike(post.postId, e)}>
                <img src={HeartIcon} alt="heart" width={13} height={12} />
              </HeartBtn>
            </CardImageWrap>
            <CardInfo>
              <CardInfoLeft>
                <TitleArea>
                  <CardTitle>{post.title}</CardTitle>
                  <CardSubtitle>{post.subtitle}</CardSubtitle>
                </TitleArea>
                <BadgeRow>
                  <RatingBadge>
                    <img src={StarIcon} alt="star" width={15} height={15} />
                    <RatingText>{post.rating}</RatingText>
                  </RatingBadge>
                  <LikeBadge>
                    <img src={LikeIcon} alt="like" width={15} height={15} />
                    <LikeText>{post.likeCount}</LikeText>
                  </LikeBadge>
                </BadgeRow>
              </CardInfoLeft>
              <PriceText>{finalPrice(post).toLocaleString()}원</PriceText>
            </CardInfo>
          </FloatingCard>
        );
      })()}

      <BottomNav activeIndex={activeNav} onNavChange={setActiveNav} />
    </Wrapper>
  );
}

const LeafletZFix = createGlobalStyle`
  .leaflet-pane,
  .leaflet-tile-pane,
  .leaflet-overlay-pane,
  .leaflet-shadow-pane,
  .leaflet-marker-pane,
  .leaflet-popup-pane,
  .leaflet-map-pane {
    z-index: 0 !important;
  }
  .leaflet-top, .leaflet-bottom { z-index: 1 !important; }
`;

const Wrapper = styled.div`
  max-width: 390px;
  margin: 0 auto;
  min-height: 100vh;
  background: #fff;
  font-family: "Pretendard", sans-serif;
  position: relative;
  overflow: hidden;
`;

const MapWrap = styled.div`
  width: 100%;
  height: 93.5vh;
  position: relative;
  z-index: 0;
  .leaflet-container { z-index: 0; }
`;

const LabelOverlay = styled.div`
  position: absolute;
  transform: translate(-50%, -100%);
  margin-top: -22px;
  font-family: "Pretendard", sans-serif;
  font-weight: 510;
  font-size: 14px;
  line-height: 22px;
  letter-spacing: -0.7px;
  text-align: center;
  color: #111;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 89px;
  pointer-events: none;
  z-index: 400;
`;

const BottomSheet = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  width: 390px;
  height: 330px;
  background: #fff;
  border-top-left-radius: 24px;
  border-top-right-radius: 24px;
  box-shadow: 0 -4px 20px rgba(0,0,0,0.08);
  box-sizing: border-box;
  z-index: 200;
  display: flex;
  flex-direction: column;
`;

const SheetFixed = styled.div`
  flex-shrink: 0;
  padding: 12px 0 0;
`;

const HandleBar = styled.div`
  width: 40px;
  height: 4px;
  border-radius: 2px;
  background: #DADADA;
  margin: 0 auto 12px;
`;

const SheetTitle = styled.div`
  font-weight: 700;
  font-size: 18px;
  color: #111;
  padding: 4px 21px 4px;
`;

const CardList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 8px 21px 16px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  scrollbar-width: none;
  &::-webkit-scrollbar { display: none; }
`;

const Empty = styled.div`
  text-align: center;
  color: #ACACAC;
  font-size: 14px;
  padding: 32px 0;
`;

/* 바텀시트 가로형 카드 */
const HCard = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  cursor: pointer;
`;

const HCardImage = styled.img`
  width: 120px;
  height: 120px;
  border-radius: 12px;
  object-fit: cover;
  flex-shrink: 0;
  background: #eee;
`;

const HCardInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
`;

const HCardTitle = styled.div`
  font-weight: 600;
  font-size: 14px;
  line-height: 22px;
  color: #111;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const HCardSubtitle = styled.div`
  font-weight: 400;
  font-size: 12px;
  line-height: 22px;
  color: #ACACAC;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const HCardOriginalPrice = styled.div`
  font-size: 10px;
  color: #DADADA;
  text-decoration: line-through;
  letter-spacing: -0.01px;
`;

const HCardPriceRow = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const HCardSale = styled.span`
  font-weight: 700;
  font-size: 14px;
  color: #B1DD89;
`;



const HCardPrice = styled.span`
  font-weight: 700;
  font-size: 14px;
  color: #111;
  letter-spacing: -0.018px;
`;

const FloatingCard = styled.div`
  position: absolute;
  bottom: 106px;
  left: 21px;
  width: 348px;
  height: 240px;
  border-radius: 16px;
  overflow: hidden;
  background: #fff;
  z-index: 200;
  box-shadow: 0 4px 20px rgba(0,0,0,0.12);
`;

const CardImageWrap = styled.div`
  position: relative;
  width: 100%;
  height: 130px;
`;

const CardImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  background: #eee;
`;

const HeartBtn = styled.button`
  position: absolute;
  top: 12px;
  right: 12px;
  width: 28px;
  height: 28px;
  border-radius: 60px;
  background-color: ${({ $liked }) => ($liked ? "#C5F598" : "#fff")};
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 0;
`;

const CardInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  padding: 12px 24px;
`;

const CardInfoLeft = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const TitleArea = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const CardTitle = styled.div`
  font-weight: 600;
  font-size: 14px;
  line-height: 22px;
  color: #111;
  width: 182px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const CardSubtitle = styled.div`
  font-weight: 400;
  font-size: 12px;
  line-height: 22px;
  color: #ACACAC;
  width: 182px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const BadgeRow = styled.div`
  display: flex;
  gap: 4px;
  align-items: center;
`;

const RatingBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 3px;
  background: #C5F598;
  border-radius: 2px;
  padding: 3px 4px;
`;

const RatingText = styled.span`
  font-weight: 590;
  font-size: 10px;
  color: #111;
`;

const LikeBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 3px;
  border: 1px solid #C5F598;
  border-radius: 2px;
  padding: 4px;
`;

const LikeText = styled.span`
  font-weight: 500;
  font-size: 10px;
  color: #111;
`;

const PriceText = styled.div`
  font-weight: 700;
  font-size: 16px;
  color: #111;
  text-align: right;
`;