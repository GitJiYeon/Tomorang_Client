import { useState, useEffect } from "react";
import styled from "styled-components";
import ArrowIcon from "/assets/bannerImages/linkArrow.svg";

const AUTO_PLAY_INTERVAL = 4000;

export default function Banner({ bannerData }) {
  const [idx, setIdx] = useState(0);

  const next = () => setIdx((prev) => (prev + 1) % bannerData.length);

  useEffect(() => {
    const timer = setInterval(next, AUTO_PLAY_INTERVAL);
    return () => clearInterval(timer);
  }, [bannerData.length]);

  const handleClick = () => {
    if (banner.link) window.open(banner.link, "_blank");
  };

  return (
    <Wrapper>
      <Viewport>
        <Track
          style={{
            transform: `translateX(calc(-${idx * 364}px + 50% - 170px))`
          }}
        >
          {bannerData.map((banner, i) => (
            <Card key={i} onClick={() => banner.link && window.open(banner.link, "_blank")}>
              <SlideImg src={banner.image} alt={banner.name} />

              <CategoryTag>{banner.category}</CategoryTag>

              <BottomContent>
                <CityName>{banner.title}</CityName>
                <Divider />
                <Description>{banner.description}</Description>
              </BottomContent>

              <ArrowBtn
                onClick={(e) => {
                  e.stopPropagation();
                  banner.link && window.open(banner.link, "_blank");
                }}
              >
                <img src={ArrowIcon} alt="arrow" style={{ width: 38, height: 38 }} />
              </ArrowBtn>
            </Card>
          ))}
        </Track>
      </Viewport>
    </Wrapper>
  );
}
const Viewport = styled.div`
  width: 100%;
  overflow: hidden;
  display: flex;
  justify-content: center;
  padding:10px;
`;

const Track = styled.div`
  display: flex;
  gap: 12px;
  transition: transform 0.6s ease;
`;

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top:3px;
`;

const Card = styled.div`
  position: relative;
  width: 348px;
  height: 350px;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  flex-shrink: 0;
  box-shadow: 0px 0px 7px 0px #C7C0AD99;
`;

const SlideImg = styled.img`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
`;


const CategoryTag = styled.span`
  position: absolute;
  top: 16px;
  left: 17px;
  width: 45px;
  height: 30px;
  border-radius: 60px;
  border: 1px solid #111;
  color: #111;
  font-size: 12px;
  font-weight: 600;
  padding: 4px 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
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
  color: #111;
  letter-spacing: -0.1%;
  line-height: 100%;
  margin-bottom: 10px;
`;

const Divider = styled.div`
  width: 30px;
  height: 1px;
  background: #111;
  margin-bottom: 12px;
  opacity: 0.8;
`;

const Description = styled.div`
  font-size: 21px;
  font-weight: 600;
  color: #111;
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
`;