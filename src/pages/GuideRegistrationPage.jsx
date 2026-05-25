import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styled, { createGlobalStyle } from "styled-components";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import Header from "../components/Header";
import ReserveButton from "../components/ReserveButton";
import MapBubble2 from "../assets/mapBubble2.svg";

const escapeHtml = (value) =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

const createMeetingBubbleIcon = (address) =>
  L.divIcon({
    className: "meeting-bubble-marker",
    iconSize: [212, 78],
    iconAnchor: [106, 78],
    html: `
    <div class="meeting-bubble">
      <strong>이 위치로 설정하기</strong>
      <span>${escapeHtml(address)}</span>
    </div>
  `,
  });

function MapClickHandler({ onPick }) {
  useMapEvents({
    click: (event) => {
      onPick(event.latlng);
    },
  });

  return null;
}

function MeetingPlacePicker({ onBack, onSelect }) {
  const [pickedPoint, setPickedPoint] = useState(null);
  const [pickedAddress, setPickedAddress] = useState("지도를 클릭해 위치를 선택하세요");
  const initialCenter = [35.3191, 139.5467];

  const handlePick = async (latlng) => {
    const fallbackAddress = `위도 ${latlng.lat.toFixed(4)}, 경도 ${latlng.lng.toFixed(4)}`;

    setPickedPoint(latlng);
    setPickedAddress("주소 불러오는 중...");

    try {
      const params = new URLSearchParams({
        format: "jsonv2",
        lat: String(latlng.lat),
        lon: String(latlng.lng),
        "accept-language": "ko",
      });
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?${params}`);
      const data = await response.json();
      setPickedAddress(data.display_name || fallbackAddress);
    } catch {
      setPickedAddress(fallbackAddress);
    }
  };

  const handleSelect = () => {
    if (!pickedPoint) return;

    onSelect({
      lat: pickedPoint.lat,
      lng: pickedPoint.lng,
      label: pickedAddress,
    });
  };

  return (
    <MeetingPageWrapper>
      <LeafletZFix />
      <Header coment="만남장소" onBack={onBack} />

      <MeetingMapWrap>
        <MapContainer
          center={initialCenter}
          zoom={11}
          style={{ width: "100%", height: "100%", zIndex: 0 }}
          zoomControl={false}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="" />
          <MapClickHandler onPick={handlePick} />
          {pickedPoint && (
            <Marker
              position={pickedPoint}
              icon={createMeetingBubbleIcon(pickedAddress)}
              eventHandlers={{
                click: handleSelect,
              }}
            />
          )}
        </MapContainer>
      </MeetingMapWrap>
    </MeetingPageWrapper>
  );
}
 
export default function GuideRegistrationPage() {
  const navigate = useNavigate();
  const [showMeetingPicker, setShowMeetingPicker] = useState(false);
  const [formData, setFormData] = useState({
    location: "",
    category: "",
    duration: "",
    maxParticipants: "",
    startTime: "",
    startDate: "",
    description: "",
    precautions: "",
  });
 
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
 
  const handleRegister = () => {
    console.log("가이드 게시물 등록:", formData);
  };

  const handleDescriptionEdit = () => {
    navigate("/guide-description-edit");
  };

  const handleMeetingSelect = (meetingPlace) => {
    setFormData((prev) => ({
      ...prev,
      precautions: meetingPlace.label,
      meetingPlace,
    }));
    setShowMeetingPicker(false);
  };

  if (showMeetingPicker) {
    return (
      <MeetingPlacePicker
        onBack={() => setShowMeetingPicker(false)}
        onSelect={handleMeetingSelect}
      />
    );
  }
 
  return (
    <PageWrapper>
      <Header coment="코스등록" />
 
      <FormContainer>
        <Section>
          <SectionTitle>발견자에게 안내할</SectionTitle>
          <SectionTitle>코스를 등록해주세요</SectionTitle>
          <SectionDescription>등록된 코스는 메인에서 확인해볼 수 있어요.</SectionDescription>
        </Section>
 
        <FormSection>
          <FormTitle>기본 정보</FormTitle>
 
          <FormGroup>
            <Label>활동 도시</Label>
            <Input
              type="text"
              name="location"
              placeholder="도쿄, 아이치, 나고야..."
              value={formData.location}
              onChange={handleInputChange}
            />
          </FormGroup>
 
          <FormGroup>
            <Label>카테고리</Label>
            <Input
              type="text"
              name="category"
              placeholder="도쿄, 아이치, 나고야..."
              value={formData.category}
              onChange={handleInputChange}
            />
          </FormGroup>
 
          <DoubleFormGroup>
            <FormGroup>
              <Label>참가비(¥)</Label>
              <Input
                type="text"
                name="duration"
                placeholder=""
                value={formData.duration}
                onChange={handleInputChange}
              />
            </FormGroup>
            <FormGroup>
              <Label>소요시간(시간)</Label>
              <Input
                type="text"
                name="maxParticipants"
                placeholder=""
                value={formData.maxParticipants}
                onChange={handleInputChange}
              />
            </FormGroup>
          </DoubleFormGroup>
 
          <FormGroup>
            <Label>가능 시간대(쉼표로 구분)</Label>
            <Input
              type="text"
              name="startTime"
              placeholder="10:00,14:00..."
              value={formData.startTime}
              onChange={handleInputChange}
            />
          </FormGroup>
        </FormSection>
 
        <FormSection>
          <FormTitle>코스 정보</FormTitle>
 
          <FormGroup>
            <Label>코스 제목</Label>
            <Input
              type="text"
              name="startDate"
              placeholder="코스 제목을 입력해주세요"
              value={formData.startDate}
              onChange={handleInputChange}
            />
          </FormGroup>
 
          <FormGroup>
            <Label>상세 설명</Label>
            <DetailBox>
              <DetailText>
                {formData.description || "코스에 대한 상세내용을 작성해보세요"}
              </DetailText>
              <DetailButton type="button" onClick={handleDescriptionEdit}>
                작성하기
              </DetailButton>
            </DetailBox>
          </FormGroup>
 
          <FormGroup>
            <Label>만남 장소</Label>
            <DetailBox>
              <DetailText>
                {formData.precautions || "발견자와 만날 장소를 설정하세요"}
              </DetailText>
              <DetailButton type="button" onClick={() => setShowMeetingPicker(true)}>
                만남 장소
              </DetailButton>
            </DetailBox>
          </FormGroup>
        </FormSection>
 
        <ButtonGroup>
          <ReserveButton isValid={true} onClick={handleRegister} />
        </ButtonGroup>
      </FormContainer>
    </PageWrapper>
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

  .leaflet-top,
  .leaflet-bottom {
    z-index: 1 !important;
  }

  .meeting-bubble-marker {
    background: transparent;
    border: none;
  }

  .meeting-bubble {
    width: 212px;
    height: 78px;
    padding: 15px 18px 16px;
    background: url("${MapBubble2}") center / 212px 78px no-repeat;
    box-sizing: border-box;
    font-family: "Pretendard", "Noto Sans KR", sans-serif;
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .meeting-bubble strong {
    width: 100%;
    color: #111;
    text-align: center;
    font-size: 14px;
    font-weight: 700;
    line-height: 20px;
  }

  .meeting-bubble span {
    width: 100%;
    margin-top: 5px;
    color: #4E4E4E;
    text-align: center;
    font-size: 12px;
    font-weight: 400;
    line-height: 16px;
    display: -webkit-box;
    overflow: hidden;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }
`;

const MeetingPageWrapper = styled.div`
  max-width: 390px;
  min-height: 100vh;
  margin: 0 auto;
  background: #fff;
  font-family: "Pretendard", "Noto Sans KR", sans-serif;
  overflow: hidden;
`;

const MeetingMapWrap = styled.div`
  width: 100%;
  height: calc(100vh - 57px);
  position: relative;

  .leaflet-container {
    z-index: 0;
  }
`;
 
const PageWrapper = styled.div`
  font-family: 'Noto Sans KR', 'Apple SD Gothic Neo', sans-serif;
  max-width: 390px;
  margin: 0 auto;
  min-height: 100vh;
  background-color: #fff;
  overflow-x: hidden;
  overflow-y: auto;
`;
 
const FormContainer = styled.div`
  padding-bottom: 21px;
`;
 
const Section = styled.div`
  padding: 24px 20px 20px;
`;
 
const SectionTitle = styled.h2`
  font-size: 21px;
  font-weight: 800;
  color: #111;
  margin: 0;
  line-height: 1.35;
`;
 
const SectionDescription = styled.p`
  font-size: 12px;
  color: #acacac;
  margin: 6px 0 0;
`;
 
const FormSection = styled.div`
  padding: 20px;
`;
 
const FormTitle = styled.h3`
  font-size: 16px;
  font-weight: 700;
  color: #111;
  margin: 0 0 16px;
`;
 
const FormGroup = styled.div`
  margin-bottom: 18px;
`;
 
const DoubleFormGroup = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-bottom: 18px;
 
  ${FormGroup} {
    margin-bottom: 0;
  }
`;
 
const Label = styled.label`
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: #333;
  margin-bottom: 8px;
`;
 
const Input = styled.input`
  width: 100%;
  height: 56px;
  padding: 12px 14px;
  border: 1px solid #e8e8e8;
  border-radius: 10px;
  font-size: 13px;
  font-family: 'Noto Sans KR', sans-serif;
  box-sizing: border-box;
  color: #111;
  outline: none;
  transition: border-color 0.2s;
 
  &::placeholder {
    color: #acacac;
  }
 
  &:focus {
    border-color: #c5f598;
    background-color: #fafafa;
  }
`;
 
const DetailBox = styled.div`
  width: 100%;
  min-height: 128px;
  padding: 18px 14px;
  border: 1px solid #dadada;
  border-radius: 12px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: #fff;
`;

const DetailText = styled.p`
  width: 100%;
  margin: 0 0 12px;
  color: #acacac;
  text-align: center;
  font-family: 'Noto Sans KR', sans-serif;
  font-size: 14px;
  font-weight: 400;
  line-height: 20px;
`;

const DetailButton = styled.button`
  width: 156px;
  height: 56px;
  background: #c5f598;
  border: none;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 700;
  color: #111;
  cursor: pointer;
  font-family: 'Noto Sans KR', sans-serif;
  transition: background-color 0.2s, transform 0.1s;
 
  &:hover {
    background-color: #b3e984;
  }
 
  &:active {
    transform: scale(0.95);
  }
`;
 
const ButtonGroup = styled.div`
  padding: 16px 20px 0;
  display: flex;
  justify-content: center;
`;
