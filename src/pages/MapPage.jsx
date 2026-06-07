import { useEffect, useMemo, useState } from "react";
import styled, { createGlobalStyle } from "styled-components";
import { MapContainer, Marker, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import MainHeader from "../components/mainComponents/MainHeader";
import BottomNav from "../components/mainComponents/BottomNav";
import FilterBar from "../components/FilterBar";
import HeartIcon from "../assets/heart.svg";
import StarIcon from "../assets/mapStar.svg";
import LikeIcon from "../assets/likeIcon.svg";
import MarkerIconSrc from "../assets/mapMarker.svg";
import BubbleIconSrc from "../assets/mapBubble.svg";
import { addWishlist, getMyWishlists, getPosts, removeWishlist } from "../api/tomorang";
import { getPostDescription, getPostImages } from "../utils/postDisplay";
import {
  getPostId,
  isPostLiked,
  setPostLiked,
  subscribeWishlistChanges,
  syncLikedPostsFromWishlists,
} from "../utils/wishlist";

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

const getLatLng = (post) => {
  const lat = Number(post.lat ?? post.latitude ?? post.city?.lat);
  const lng = Number(post.lng ?? post.longitude ?? post.city?.lng);
  return Number.isFinite(lat) && Number.isFinite(lng) ? [lat, lng] : null;
};

const getPrice = (post) => {
  const raw = Number(String(post.price ?? 0).replace(/,/g, "")) || 0;
  return post.discountRate ? Math.round(raw * (1 - post.discountRate / 100)) : raw;
};

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
  const latLng = getLatLng(post);

  useEffect(() => {
    if (!latLng) return undefined;
    const update = () => {
      const point = map.latLngToContainerPoint(latLng);
      setPos(point);
    };
    update();
    map.on("move zoom", update);
    return () => map.off("move zoom", update);
  }, [latLng, map]);

  if (!pos) return null;

  return <LabelOverlay style={{ left: pos.x, top: pos.y }}>{post.title}</LabelOverlay>;
}

export default function MapPage() {
  const [activeNav, setActiveNav] = useState(1);
  const [posts, setPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [mapCenter, setMapCenter] = useState([35.5, 139.5]);
  const [filter, setFilter] = useState({ sort: "", category: "" });
  const [likedVersion, setLikedVersion] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let alive = true;
    getPosts()
      .then((serverPosts) => {
        if (!alive) return;
        const postsWithLocation = serverPosts.filter(getLatLng);
        setPosts(postsWithLocation);
        if (postsWithLocation[0]) setMapCenter(getLatLng(postsWithLocation[0]));
      })
      .catch((error) => {
        if (alive) setErrorMessage(error.message || "코스 목록을 불러오지 못했습니다.");
      });

    getMyWishlists().then(syncLikedPostsFromWishlists).catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      (pos) => setMapCenter([pos.coords.latitude, pos.coords.longitude]),
      () => {}
    );
  }, []);

  useEffect(
    () => subscribeWishlistChanges(() => setLikedVersion((version) => version + 1)),
    []
  );

  const toggleLike = async (postId, event) => {
    event.stopPropagation();
    const nextLiked = !isPostLiked(postId);
    try {
      if (nextLiked) {
        await addWishlist(postId);
      } else {
        await removeWishlist(postId);
      }
      setPostLiked(postId, nextLiked);
      setLikedVersion((version) => version + 1);
    } catch (error) {
      alert(error.message || "찜 변경에 실패했습니다.");
    }
  };

  const filteredPosts = useMemo(() => {
    const category = String(filter.category ?? "").trim();
    const sort = String(filter.sort ?? "");
    return posts
      .filter((post) => {
        if (!category) return true;
        const haystack = [
          post.title,
          post.subtitle,
          post.cityName,
          getPostDescription(post),
          ...(post.tags ?? []).map((tag) => tag.tagName ?? tag.name ?? tag),
        ]
          .join(" ")
          .toLowerCase();
        return haystack.includes(category.toLowerCase());
      })
      .sort((a, b) => {
        if (sort.includes("가격")) return getPrice(a) - getPrice(b);
        if (sort.includes("인기")) return Number(b.likeCount ?? 0) - Number(a.likeCount ?? 0);
        return Number(b.rating ?? 0) - Number(a.rating ?? 0);
      });
  }, [filter, posts]);

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

          {posts.map((post) => {
            const postId = getPostId(post);
            const latLng = getLatLng(post);
            const isSelected = getPostId(selectedPost) === postId;
            if (!latLng) return null;
            return (
              <Marker
                key={postId}
                position={latLng}
                icon={isSelected ? bubbleIcon : markerIcon}
                eventHandlers={{
                  click: () => {
                    if (isSelected) {
                      setSelectedPost(null);
                    } else {
                      setSelectedPost(post);
                      setMapCenter(latLng);
                    }
                  },
                }}
              />
            );
          })}

          {selectedPost && <MarkerLabel post={selectedPost} />}
        </MapContainer>
      </MapWrap>

      {!selectedPost && (
        <BottomSheet>
          <SheetFixed>
            <HandleBar />
            <SheetTitle>주위에 있는 코스</SheetTitle>
            <FilterBar onFilterChange={setFilter} />
          </SheetFixed>
          <CardList>
            {errorMessage && <Empty>{errorMessage}</Empty>}
            {!errorMessage && filteredPosts.length === 0 ? (
              <Empty>표시할 코스가 없습니다.</Empty>
            ) : (
              filteredPosts.map((post) => {
                const raw = Number(String(post.price ?? 0).replace(/,/g, "")) || 0;
                const price = getPrice(post);
                const image = getPostImages(post)[0];
                return (
                  <HCard key={getPostId(post)} onClick={() => setSelectedPost(post)}>
                    <HCardImage
                      src={image}
                      alt={post.title}
                      onError={(event) => {
                        event.currentTarget.style.background = "#eee";
                        event.currentTarget.removeAttribute("src");
                      }}
                    />
                    <HCardInfo>
                      <HCardTitle>{post.title}</HCardTitle>
                      <HCardSubtitle>{post.subtitle || getPostDescription(post)}</HCardSubtitle>
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

      {selectedPost && (() => {
        const postId = getPostId(selectedPost);
        const image = getPostImages(selectedPost)[0];
        const liked = isPostLiked(postId);
        return (
          <FloatingCard>
            <CardImageWrap>
              <CardImage
                src={image}
                alt={selectedPost.title}
                onError={(event) => {
                  event.currentTarget.style.background = "#ddd";
                  event.currentTarget.removeAttribute("src");
                }}
              />
              <HeartBtn $liked={liked} onClick={(event) => toggleLike(postId, event)}>
                <img src={HeartIcon} alt="heart" width={13} height={12} />
              </HeartBtn>
            </CardImageWrap>
            <CardInfo>
              <CardInfoLeft>
                <TitleArea>
                  <CardTitle>{selectedPost.title}</CardTitle>
                  <CardSubtitle>{selectedPost.subtitle || getPostDescription(selectedPost)}</CardSubtitle>
                </TitleArea>
                <BadgeRow>
                  <RatingBadge>
                    <img src={StarIcon} alt="star" width={15} height={15} />
                    <RatingText>{selectedPost.rating}</RatingText>
                  </RatingBadge>
                  <LikeBadge>
                    <img src={LikeIcon} alt="like" width={15} height={15} />
                    <LikeText>{selectedPost.likeCount}</LikeText>
                  </LikeBadge>
                </BadgeRow>
              </CardInfoLeft>
              <PriceText>{getPrice(selectedPost).toLocaleString()}원</PriceText>
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
  width: min(390px, 100vw);
  margin: 0 auto;
  height: 100dvh;
  max-height: 100dvh;
  background: #fff;
  font-family: "Pretendard", sans-serif;
  position: relative;
  overflow: hidden;
`;

const MapWrap = styled.div`
  width: 100%;
  height: 100%;
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
  background: #dadada;
  margin: 0 auto 12px;
`;

const SheetTitle = styled.div`
  font-weight: 700;
  font-size: 18px;
  color: #111;
  padding: 4px 21px;
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
  color: #acacac;
  font-size: 14px;
  padding: 32px 0;
`;

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
  min-width: 0;
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
  color: #acacac;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const HCardOriginalPrice = styled.div`
  font-size: 10px;
  color: #dadada;
  text-decoration: line-through;
`;

const HCardPriceRow = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const HCardSale = styled.span`
  font-weight: 700;
  font-size: 14px;
  color: #b1dd89;
`;

const HCardPrice = styled.span`
  font-weight: 700;
  font-size: 14px;
  color: #111;
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
  background-color: ${({ $liked }) => ($liked ? "#c5f598" : "#fff")};
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
  min-width: 0;
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
  color: #acacac;
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
  background: #c5f598;
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
  border: 1px solid #c5f598;
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
