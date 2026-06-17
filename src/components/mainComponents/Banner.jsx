import { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import { resolvePublicAsset } from "../../utils/publicAsset";
import { useI18n } from "../../i18n/I18nProvider";

const ArrowIcon = resolvePublicAsset("/assets/bannerImages/linkArrow.svg");

const AUTO_PLAY_INTERVAL = 4000;
const CARD_GAP = 12;
const SWIPE_THRESHOLD = 40;

export default function Banner({ bannerData }) {
  const [idx, setIdx] = useState(0);
  const [cardStep, setCardStep] = useState(400);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const firstCardRef = useRef(null);
  const dragRef = useRef(null);
  const didSwipeRef = useRef(false);
  const { t } = useI18n();
  const bannerCount = bannerData.length;

  const next = () => {
    if (bannerCount <= 0) return;
    setIdx((prev) => (prev + 1) % bannerCount);
  };

  const prev = () => {
    if (bannerCount <= 0) return;
    setIdx((current) => (current - 1 + bannerCount) % bannerCount);
  };

  useEffect(() => {
    if (bannerCount <= 1 || isDragging) return undefined;
    const timer = setInterval(next, AUTO_PLAY_INTERVAL);
    return () => clearInterval(timer);
  }, [bannerCount, isDragging]);

  useEffect(() => {
    const updateCardStep = () => {
      const width = firstCardRef.current?.offsetWidth;
      if (width) setCardStep(width + CARD_GAP);
    };

    updateCardStep();
    window.addEventListener("resize", updateCardStep);
    return () => window.removeEventListener("resize", updateCardStep);
  }, []);

  const handlePointerDown = (event) => {
    if (bannerCount <= 1) return;
    dragRef.current = {
      startX: event.clientX,
      pointerId: event.pointerId,
    };
    didSwipeRef.current = false;
    setIsDragging(true);
    setDragOffset(0);
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };

  const handlePointerMove = (event) => {
    const drag = dragRef.current;
    if (!drag) return;

    const deltaX = event.clientX - drag.startX;
    if (Math.abs(deltaX) > 4) didSwipeRef.current = true;
    setDragOffset(deltaX);
  };

  const endDrag = (event) => {
    const drag = dragRef.current;
    if (!drag) return;

    const deltaX = event.clientX - drag.startX;
    if (event.currentTarget.hasPointerCapture?.(drag.pointerId)) {
      event.currentTarget.releasePointerCapture(drag.pointerId);
    }

    dragRef.current = null;
    setIsDragging(false);
    setDragOffset(0);

    if (deltaX <= -SWIPE_THRESHOLD) next();
    if (deltaX >= SWIPE_THRESHOLD) prev();
  };

  const handleBannerClick = (banner) => {
    if (didSwipeRef.current) {
      didSwipeRef.current = false;
      return;
    }
    if (banner.link) window.open(banner.link, "_blank");
  };

  return (
    <Wrapper>
      <Viewport
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        <Track
          $isDragging={isDragging}
          style={{
            transform: `translateX(${dragOffset - idx * cardStep}px)`
          }}
        >
          {bannerData.map((banner, i) => {
            const isBannerOne = banner.image?.includes("banner1");
            const lightText = !isBannerOne;

            return (
              <Card
                key={i}
                ref={i === 0 ? firstCardRef : null}
                onClick={() => handleBannerClick(banner)}
              >
                <SlideImg
                  src={resolvePublicAsset(banner.image)}
                  alt={banner.name ?? banner.title ?? "banner"}
                />

                {banner.category?.trim() && (
                  <CategoryTag $lightText={lightText}>{t(banner.category)}</CategoryTag>
                )}

                {(banner.title?.trim() || banner.description?.trim()) && (
                  <BottomContent>
                    {banner.title?.trim() && <CityName $lightText={lightText}>{t(banner.title)}</CityName>}
                    {banner.title?.trim() && banner.description?.trim() && <Divider $lightText={lightText} />}
                    {banner.description?.trim() && (
                      <Description $lightText={lightText}>{t(banner.description)}</Description>
                    )}
                  </BottomContent>
                )}

                <ArrowBtn
                  onClick={(e) => {
                    e.stopPropagation();
                    banner.link && window.open(banner.link, "_blank");
                  }}
                >
                  <img src={ArrowIcon} alt="arrow" style={{ width: 38, height: 38 }} />
                </ArrowBtn>
              </Card>
            );
          })}
        </Track>
      </Viewport>
    </Wrapper>
  );
}
const Viewport = styled.div`
  width: 100%;
  overflow: hidden;
  padding: 10px 0;
  box-sizing: border-box;
  touch-action: pan-y;
`;

const Track = styled.div`
  display: flex;
  gap: 12px;
  padding: 0 calc((100% - var(--app-content-width)) / 2);
  transition: ${({ $isDragging }) => ($isDragging ? "none" : "transform 0.6s ease")};
  will-change: transform;
`;

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top:3px;
`;

const Card = styled.div`
  position: relative;
  width: var(--app-content-width);
  aspect-ratio: 348 / 350;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  flex-shrink: 0;
  box-shadow: 0px 0px 7px 0px #C7C0AD99;
  user-select: none;
  -webkit-user-select: none;
`;

const SlideImg = styled.img`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  display: block;
`;


const CategoryTag = styled.span`
  position: absolute;
  top: 16px;
  left: 17px;
  width: fit-content;
  min-width: 45px;
  max-width: calc(100% - 34px);
  height: 30px;
  border-radius: 60px;
  border: 1px solid ${({ $lightText }) => ($lightText ? "#fff" : "#111")};
  color: ${({ $lightText }) => ($lightText ? "#fff" : "#111")};
  font-size: 12px;
  font-weight: 600;
  padding: 4px 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  box-sizing: border-box;
`;

const BottomContent = styled.div`
  position: absolute;
  bottom: 26px;
  left: 28px;
  right: 70px;
`;

const CityName = styled.div`
  font-size: 12px;
  font-weight: 500;
  color: ${({ $lightText }) => ($lightText ? "#fff" : "#111")};
  letter-spacing: -0.1%;
  line-height: 100%;
  margin-bottom: 10px;
`;

const Divider = styled.div`
  width: 30px;
  height: 1px;
  background: ${({ $lightText }) => ($lightText ? "#fff" : "#111")};
  margin-bottom: 12px;
  opacity: 0.8;
`;

const Description = styled.div`
  font-size: 21px;
  font-weight: 600;
  color: ${({ $lightText }) => ($lightText ? "#fff" : "#111")};
  line-height: 26px;
  letter-spacing: 0.019em;
  white-space: pre-line;
`;

const ArrowBtn = styled.button`
  position: absolute;
  bottom: 26px;
  right: 26px;
  width: 38px;
  height: 38px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  touch-action: manipulation;
`;
