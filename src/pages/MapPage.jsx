import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import styled, { createGlobalStyle } from "styled-components";
import { MapContainer, Marker, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import MainHeader from "../components/mainComponents/MainHeader";
import BottomNav from "../components/mainComponents/BottomNav";
import FilterBar from "../components/FilterBar";
import HeartIcon from "../assets/heart.svg";
import FilledHeartIcon from "../assets/fillheart.svg";
import StarIcon from "../assets/mapStar.svg";
import LikeIcon from "../assets/likeIcon.svg";
import MarkerIconSrc from "../assets/mapMarker.svg";
import BubbleIconSrc from "../assets/mapBubble.svg";
import { addWishlist, getMyWishlists, getPosts, removeWishlist } from "../api/tomorang";
import { getPostDescription, getPostImages } from "../utils/postDisplay";
import { formatRating, getPostRatingAverage, getPostWishlistCount } from "../utils/postStats";
import { isOwnPost } from "../utils/postOwner";
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

const DEFAULT_CENTER = [35.5, 139.5];

const toRadians = (degree) => (degree * Math.PI) / 180;

const getDistanceKm = (from, to) => {
  if (!from || !to) return Number.POSITIVE_INFINITY;
  const [fromLat, fromLng] = from.map(Number);
  const [toLat, toLng] = to.map(Number);
  if (![fromLat, fromLng, toLat, toLng].every(Number.isFinite)) return Number.POSITIVE_INFINITY;

  const earthRadiusKm = 6371;
  const dLat = toRadians(toLat - fromLat);
  const dLng = toRadians(toLng - fromLng);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(fromLat)) * Math.cos(toRadians(toLat)) * Math.sin(dLng / 2) ** 2;

  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
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
  const lat = latLng?.[0];
  const lng = latLng?.[1];

  useEffect(() => {
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return undefined;
    const pointLatLng = [lat, lng];
    const update = () => {
      const point = map.latLngToContainerPoint(pointLatLng);
      setPos(point);
    };
    update();
    map.on("move zoom", update);
    return () => map.off("move zoom", update);
  }, [lat, lng, map]);

  if (!pos) return null;

  return <LabelOverlay style={{ left: pos.x, top: pos.y }}>{post.title}</LabelOverlay>;
}

export default function MapPage() {
  const navigate = useNavigate();
  const [activeNav, setActiveNav] = useState(1);
  const [posts, setPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [mapCenter, setMapCenter] = useState(DEFAULT_CENTER);
  const [userLocation, setUserLocation] = useState(null);
  const [filter, setFilter] = useState({ sort: "", category: "" });
  const [likedVersion, setLikedVersion] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSheetExpanded, setIsSheetExpanded] = useState(false);
  const sheetDragRef = useRef(null);

  useEffect(() => {
    let alive = true;
    getPosts()
      .then((serverPosts) => {
        if (!alive) return;
        const postsWithLocation = serverPosts.filter(getLatLng);
        setPosts(postsWithLocation);
        if (postsWithLocation[0]) setMapCenter((current) => (current === DEFAULT_CENTER ? getLatLng(postsWithLocation[0]) : current));
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
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const currentLocation = [pos.coords.latitude, pos.coords.longitude];
        setUserLocation(currentLocation);
        setMapCenter(currentLocation);
      },
      () => {},
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 300000 }
    );
  }, []);

  useEffect(
    () => subscribeWishlistChanges(() => setLikedVersion((version) => version + 1)),
    []
  );

  const toggleLike = async (post, event) => {
    event.stopPropagation();
    if (isOwnPost(post)) return;
    const postId = getPostId(post);
    if (!postId) return;
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

  const openPostDetail = (post) => {
    if (!post) return;
    sessionStorage.setItem("currentCoursePost", JSON.stringify(post));
    navigate("/course", { state: { post } });
  };

  const handleSheetPointerDown = (event) => {
    sheetDragRef.current = {
      startY: event.clientY,
      latestY: event.clientY,
      moved: false,
    };
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };

  const handleSheetPointerMove = (event) => {
    const drag = sheetDragRef.current;
    if (!drag) return;
    drag.latestY = event.clientY;
    if (Math.abs(drag.latestY - drag.startY) > 8) drag.moved = true;
  };

  const handleSheetPointerEnd = (event) => {
    const drag = sheetDragRef.current;
    if (!drag) return;
    const deltaY = drag.latestY - drag.startY;
    if (event.currentTarget.hasPointerCapture?.(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    sheetDragRef.current = null;

    if (!drag.moved) {
      setIsSheetExpanded((expanded) => !expanded);
      return;
    }
    if (deltaY < -32) setIsSheetExpanded(true);
    if (deltaY > 32) setIsSheetExpanded(false);
  };

  const filteredPosts = useMemo(() => {
    const category = String(filter.category ?? "").trim();
    const sort = String(filter.sort ?? "");
    const distanceCenter = userLocation ?? mapCenter;
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
        if (sort.includes("인기")) return getPostWishlistCount(b) - getPostWishlistCount(a);
        const distanceGap = getDistanceKm(distanceCenter, getLatLng(a)) - getDistanceKm(distanceCenter, getLatLng(b));
        if (Number.isFinite(distanceGap) && Math.abs(distanceGap) > 0.01) return distanceGap;
        return getPostRatingAverage(b) - getPostRatingAverage(a);
      });
  }, [filter, mapCenter, posts, userLocation]);

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

          {filteredPosts.map((post) => {
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
        <BottomSheet $expanded={isSheetExpanded}>
          <SheetFixed>
            <SheetHandle
              role="button"
              tabIndex={0}
              aria-label={isSheetExpanded ? "코스 목록 접기" : "코스 목록 펼치기"}
              onPointerDown={handleSheetPointerDown}
              onPointerMove={handleSheetPointerMove}
              onPointerUp={handleSheetPointerEnd}
              onPointerCancel={handleSheetPointerEnd}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  setIsSheetExpanded((expanded) => !expanded);
                }
              }}
            >
              <HandleBar />
            </SheetHandle>
            <SheetTitle>{userLocation ? "현재 위치 근처 코스" : "주위에 있는 코스"}</SheetTitle>
            <FilterBar onFilterChange={setFilter} defaultCategory="" />
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
                  <HCard key={getPostId(post)} onClick={() => openPostDetail(post)}>
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
        const canWishlist = !isOwnPost(selectedPost);
        const ratingAverage = getPostRatingAverage(selectedPost);
        const wishlistCount = getPostWishlistCount(selectedPost);
        return (
          <FloatingCard onClick={() => openPostDetail(selectedPost)}>
            <CardImageWrap>
              <CardImage
                src={image}
                alt={selectedPost.title}
                onError={(event) => {
                  event.currentTarget.style.background = "#ddd";
                  event.currentTarget.removeAttribute("src");
                }}
              />
              {canWishlist && (
                <HeartBtn $liked={liked} onClick={(event) => toggleLike(selectedPost, event)}>
                  <img src={liked ? FilledHeartIcon : HeartIcon} alt="heart" width={13} height={12} />
                </HeartBtn>
              )}
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
                    <RatingText>{formatRating(ratingAverage)}</RatingText>
                  </RatingBadge>
                  <LikeBadge>
                    <img src={LikeIcon} alt="like" width={15} height={15} />
                    <LikeText>{wishlistCount}</LikeText>
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
  width: min(var(--app-page-width), 100vw);
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
  width: min(var(--app-page-width), 100vw);
  height: ${({ $expanded }) => ($expanded ? "calc(100dvh - 96px)" : "330px")};
  background: #fff;
  border-top-left-radius: 24px;
  border-top-right-radius: 24px;
  box-shadow: 0 -4px 20px rgba(0,0,0,0.08);
  box-sizing: border-box;
  z-index: 200;
  display: flex;
  flex-direction: column;
  transition: height 0.24s ease;
`;

const SheetFixed = styled.div`
  flex-shrink: 0;
  padding: 0;
`;

const SheetHandle = styled.div`
  width: 100%;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: grab;
  touch-action: none;

  &:active {
    cursor: grabbing;
  }

  &:focus {
    outline: none;
  }
`;

const HandleBar = styled.div`
  width: 40px;
  height: 4px;
  border-radius: 2px;
  background: #dadada;
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
  padding: 8px 21px 112px;
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
  bottom: 144px;
  left: 21px;
  width: var(--app-content-width);
  height: 252px;
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
  background: rgba(255, 255, 255, 0.88);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
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
