/**
 * MeetingPointCard - 만남 장소 카드
 *
 * 사용법:
 * <MeetingPointCard locked />
 * <MeetingPointCard
 *   address="〒503-0801 기후현 오가키시 다카이도 1-3번지 1호"
 *   meetingPoint="오가키 패밀리 마트 앞"
 *   lat={35.3667}
 *   lng={136.6167}
 * />
 */

import styled from "styled-components";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import MapPinIcon from "../../assets/mapMarker.svg";
import MapIcon from "../../assets/bookStatusIcons/mapIcon.svg";
import CopyIcon from "../../assets/bookStatusIcons/copyIcon.svg";

const pinIcon = L.icon({
  iconUrl: MapPinIcon,
  iconSize: [28, 28],
  iconAnchor: [14, 28],
  shadowUrl: "",
});

export default function MeetingPointCard({ locked, address, meetingPoint, lat, lng }) {
  const displayAddress = address || meetingPoint || "만남 장소 주소가 곧 공개됩니다";
  const displayMeetingPoint = meetingPoint || address || "만남 장소";

  const handleCopy = () => {
    const copyText = address || meetingPoint;
    if (copyText) navigator.clipboard.writeText(copyText);
  };

  return (
    <Section>
      <SectionTitle>만남 장소</SectionTitle>
      {locked ? (
        <LockedBox>
          <img src={MapIcon} alt="map" width={24} height={24} />
          <LockedText>만남 장소는 예약 확정 후 공개됩니다</LockedText>
        </LockedBox>
      ) : (
        <>
          <MapWrap>
            <MapContainer
              center={[lat, lng]}
              zoom={15}
              style={{ width: "100%", height: "100%" }}
              zoomControl={false}
              dragging={false}
              scrollWheelZoom={false}
              doubleClickZoom={false}
              touchZoom={false}
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="" />
              <Marker position={[lat, lng]} icon={pinIcon} />
            </MapContainer>
          </MapWrap>
          <AddressCard>
            <AddressInner>
              <AddressText>{displayAddress}</AddressText>
              <MeetingText>{displayMeetingPoint}</MeetingText>
            </AddressInner>
            <CopyBtn onClick={handleCopy}>
              <img src={CopyIcon} alt="copy" width={16} height={16} />
            </CopyBtn>
          </AddressCard>
        </>
      )}
    </Section>
  );
}

const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const SectionTitle = styled.div`
  font-family: "Pretendard", sans-serif;
  font-weight: 700;
  font-size: 16px;
  color: #111;
`;

const LockedBox = styled.div`
  width: var(--app-content-width);
  height: 185px;
  border-radius: 12px;
  background: #F3F4F3;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
`;

const LockedText = styled.div`
  font-family: "Pretendard", sans-serif;
  font-weight: 400;
  font-size: 13px;
  color: #ACACAC;
`;

const MapWrap = styled.div`
  width: var(--app-content-width);
  height: 140px;
  border-radius: 12px;
  overflow: hidden;
`;

const AddressCard = styled.div`
  width: var(--app-content-width);
  height: 65px;
  border-radius: 12px;
  background: #EDFCDF;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  box-sizing: border-box;
`;

const AddressInner = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const AddressText = styled.div`
  font-family: "Pretendard", sans-serif;
  font-weight: 400;
  font-size: 12px;
  letter-spacing: -0.42px;
  color: #ACACAC;
`;

const MeetingText = styled.div`
  font-family: "Pretendard", sans-serif;
  font-weight: 500;
  font-size: 14px;
  letter-spacing: -0.49px;
  color: #111;
`;

const CopyBtn = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  flex-shrink: 0;
`;
