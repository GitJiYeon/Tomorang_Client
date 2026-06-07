import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import styled, { createGlobalStyle } from "styled-components";
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import Header from "../components/Header";
import ReserveButton from "../components/ReserveButton";
import MapBubble2 from "../assets/mapBubble2.svg";
import ImageIcon from "../assets/imageIcon.svg";
import { createPost, getPosts } from "../api/tomorang";
import {
  clearGuideRegistrationDraftFiles,
  getContentImageDrafts,
  getRepresentativeImageDraft,
  GUIDE_REGISTRATION_DRAFT_KEY,
  setRepresentativeImageDraft,
} from "../utils/guideRegistrationDraft";

const initialFormData = {
  location: "",
  category: "",
  price: "",
  duration: "",
  startTime: "",
  title: "",
  description: "",
  meetingAddress: "",
  meetingPlace: undefined,
};

const escapeHtml = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

function loadDraft() {
  try {
    return { ...initialFormData, ...JSON.parse(sessionStorage.getItem(GUIDE_REGISTRATION_DRAFT_KEY) || "{}") };
  } catch {
    return initialFormData;
  }
}

function buildContentBlocks(markdown, meetingAddress, imageMap = {}) {
  const value = meetingAddress
    ? `${markdown || "코스 상세 설명"}\n\n### 만남 장소\n${meetingAddress}`
    : markdown || "코스 상세 설명";
  const blocks = [];
  const imagePattern = /!\[[^\]]*]\(tomorang-content-image:\/\/[^)\s]+\)/g;
  let lastIndex = 0;
  let sequence = 0;
  let match;

  while ((match = imagePattern.exec(value)) !== null) {
    const text = value.slice(lastIndex, match.index).trim();
    if (text) {
      blocks.push({ type: "text", value: text, sequence });
      sequence += 1;
    }
    const id = match[0].match(/tomorang-content-image:\/\/([^)\s]+)/)?.[1];
    blocks.push({ type: "image", value: imageMap[id] ?? "", sequence });
    sequence += 1;
    lastIndex = match.index + match[0].length;
  }

  const rest = value.slice(lastIndex).trim();
  if (rest) blocks.push({ type: "text", value: rest, sequence });
  return blocks.length > 0 ? blocks : [{ type: "text", value, sequence: 0 }];
}

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
    click: (event) => onPick(event.latlng),
  });
  return null;
}

function MapCenterSync({ point }) {
  const map = useMap();
  useEffect(() => {
    if (point) map.setView([point.lat, point.lng], 15);
  }, [map, point]);
  return null;
}

function MeetingPlacePicker({ onBack, onSelect }) {
  const [pickedPoint, setPickedPoint] = useState(null);
  const [pickedAddress, setPickedAddress] = useState("지도를 클릭해 위치를 선택하세요");
  const [addressInput, setAddressInput] = useState("");
  const [isSearching, setIsSearching] = useState(false);
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

  const handleAddressSearch = async () => {
    const query = addressInput.trim();
    if (!query || isSearching) return;
    setIsSearching(true);
    try {
      const params = new URLSearchParams({
        format: "jsonv2",
        q: query,
        limit: "1",
        "accept-language": "ko",
      });
      const response = await fetch(`https://nominatim.openstreetmap.org/search?${params}`);
      const data = await response.json();
      const first = Array.isArray(data) ? data[0] : null;
      if (!first) {
        setPickedPoint(null);
        setPickedAddress(query);
        return;
      }
      setPickedPoint({ lat: Number(first.lat), lng: Number(first.lon) });
      setPickedAddress(first.display_name || query);
    } catch {
      setPickedPoint(null);
      setPickedAddress(query);
    } finally {
      setIsSearching(false);
    }
  };

  const selectDirectAddress = () => {
    const label = addressInput.trim();
    if (!label) return;
    onSelect({ lat: pickedPoint?.lat, lng: pickedPoint?.lng, label });
  };

  return (
    <MeetingPageWrapper>
      <LeafletZFix />
      <Header coment="만남 장소" onBack={onBack} />
      <AddressSearchPanel>
        <AddressInput
          value={addressInput}
          onChange={(event) => setAddressInput(event.target.value)}
          placeholder="주소나 장소명을 입력하세요"
          onKeyDown={(event) => {
            if (event.key === "Enter") handleAddressSearch();
          }}
        />
        <AddressButton type="button" onClick={handleAddressSearch} disabled={isSearching}>
          {isSearching ? "검색 중" : "검색"}
        </AddressButton>
        <AddressButton type="button" onClick={selectDirectAddress} disabled={!addressInput.trim()}>
          이 주소로 설정
        </AddressButton>
      </AddressSearchPanel>
      <MeetingMapWrap>
        <MapContainer center={initialCenter} zoom={11} style={{ width: "100%", height: "100%", zIndex: 0 }} zoomControl={false}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="" />
          <MapCenterSync point={pickedPoint} />
          <MapClickHandler onPick={handlePick} />
          {pickedPoint && (
            <Marker
              position={pickedPoint}
              icon={createMeetingBubbleIcon(pickedAddress)}
              eventHandlers={{
                click: () => onSelect({ lat: pickedPoint.lat, lng: pickedPoint.lng, label: pickedAddress }),
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
  const fileInputRef = useRef(null);
  const [showMeetingPicker, setShowMeetingPicker] = useState(false);
  const [formData, setFormData] = useState(loadDraft);
  const [representativeImage, setRepresentativeImage] = useState(getRepresentativeImageDraft);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setFormData(loadDraft());
    setRepresentativeImage(getRepresentativeImageDraft());
  }, []);

  useEffect(() => {
    sessionStorage.setItem(GUIDE_REGISTRATION_DRAFT_KEY, JSON.stringify(formData));
  }, [formData]);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageAdd = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const preview = URL.createObjectURL(file);
    setRepresentativeImageDraft(file, preview);
    setRepresentativeImage({ file, preview });
    event.target.value = "";
  };

  const handleDescriptionEdit = () => {
    sessionStorage.setItem(GUIDE_REGISTRATION_DRAFT_KEY, JSON.stringify(formData));
    navigate("/guide-description-edit", { state: { description: formData.description } });
  };

  const handleMeetingSelect = (meetingPlace) => {
    setFormData((prev) => ({ ...prev, meetingAddress: meetingPlace.label, meetingPlace }));
    setShowMeetingPicker(false);
  };

  const handleRegister = async () => {
    if (isSubmitting) return;
    const userId = localStorage.getItem("userId");
    if (!userId) {
      setErrorMessage("로그인 후 코스를 등록해주세요.");
      return;
    }
    if (!representativeImage.file) {
      setErrorMessage("코스 사진을 최소 1장 등록해주세요.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");
    try {
      const times = formData.startTime.split(",").map((time) => time.trim()).filter(Boolean);
      const today = new Date().toISOString().slice(0, 10);
      const { files: contentImages } = getContentImageDrafts();
      const postDto = {
        user_id: userId,
        title: formData.title.trim(),
        subtitle: formData.category.trim(),
        price: Number(String(formData.price).replace(/,/g, "")) || 0,
        discount_rate: 0,
        duration: `${formData.duration || 1}시간`,
        max_participants: 4,
        city_name: formData.location.trim(),
        country: "",
        lat: formData.meetingPlace?.lat,
        lng: formData.meetingPlace?.lng,
        contentBlocks: buildContentBlocks(formData.description, formData.meetingAddress),
        tags: formData.category ? [{ langCode: "ko", tagName: formData.category.trim() }] : [],
        schedules: [
          {
            date: today,
            timeSlots: times.map((time, index) => ({
              id: `slot_${Date.now()}_${index}`,
              time,
              status: "OPEN",
              maxCapacity: 4,
              bookedCount: 0,
            })),
          },
        ],
      };

      const createdPost = await createPost(postDto, {
        courseImages: [representativeImage.file],
        contentImages,
      });
      console.log("[Tomorang] 게시물 등록 응답:", createdPost);

      const myPostsAfterCreate = await getPosts({ userId });
      console.log("[Tomorang] 등록 후 내 게시물 목록:", myPostsAfterCreate);
      sessionStorage.removeItem(GUIDE_REGISTRATION_DRAFT_KEY);
      clearGuideRegistrationDraftFiles();
      navigate("/guide", { replace: true });
    } catch (error) {
      setErrorMessage(error.message || "코스 등록에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showMeetingPicker) {
    return <MeetingPlacePicker onBack={() => setShowMeetingPicker(false)} onSelect={handleMeetingSelect} />;
  }

  return (
    <PageWrapper>
      <Header coment="코스등록" />
      <FormContainer>
        <Section>
          <SectionTitle>발견자에게 안내할</SectionTitle>
          <SectionTitle>코스를 등록해주세요</SectionTitle>
          <SectionDescription>등록한 코스는 메인에서 확인해 볼 수 있어요.</SectionDescription>
        </Section>
        <FormSection>
          <FormTitle>기본 정보</FormTitle>
          <FormGroup>
            <Label>활동 도시</Label>
            <Input name="location" placeholder="도쿄, 아이치, 나고야..." value={formData.location} onChange={handleInputChange} />
          </FormGroup>
          <FormGroup>
            <Label>카테고리</Label>
            <Input name="category" placeholder="풍경, 사진, 맛집..." value={formData.category} onChange={handleInputChange} />
          </FormGroup>
          <DoubleFormGroup>
            <FormGroup>
              <Label>참가비(¥)</Label>
              <Input name="price" value={formData.price} onChange={handleInputChange} />
            </FormGroup>
            <FormGroup>
              <Label>소요시간(시간)</Label>
              <Input name="duration" value={formData.duration} onChange={handleInputChange} />
            </FormGroup>
          </DoubleFormGroup>
          <FormGroup>
            <Label>가능 시간대(쉼표로 구분)</Label>
            <Input name="startTime" placeholder="10:00,14:00..." value={formData.startTime} onChange={handleInputChange} />
          </FormGroup>
        </FormSection>
        <FormSection>
          <FormTitle>코스 정보</FormTitle>
          <FormGroup>
            <Label>코스 제목</Label>
            <Input name="title" placeholder="코스 제목을 입력해주세요" value={formData.title} onChange={handleInputChange} />
          </FormGroup>
          <FormGroup>
            <Label>대표 사진</Label>
            <PhotoBox>
              <PhotoMainButton type="button" onClick={() => fileInputRef.current?.click()} $hasImage={!!representativeImage.preview}>
                {representativeImage.preview ? (
                  <MainPreview src={representativeImage.preview} alt="대표 사진" />
                ) : (
                  <PhotoGuide>
                    <img src={ImageIcon} alt="" />
                    <span>대표 사진을 등록해주세요</span>
                  </PhotoGuide>
                )}
              </PhotoMainButton>
              <HiddenFileInput ref={fileInputRef} type="file" accept="image/*" onChange={handleImageAdd} />
              <PhotoHint>대표 사진 1장을 등록해주세요. 본문 이미지는 상세 설명에서 삽입할 수 있어요.</PhotoHint>
            </PhotoBox>
          </FormGroup>
          <FormGroup>
            <Label>상세 설명</Label>
            <DetailBox>
              <DetailText>{formData.description || "코스에 대한 상세내용을 작성해보세요"}</DetailText>
              <DetailButton type="button" onClick={handleDescriptionEdit}>작성하기</DetailButton>
            </DetailBox>
          </FormGroup>
          <FormGroup>
            <Label>만남 장소</Label>
            <DetailBox>
              <AddressTextInput
                value={formData.meetingAddress}
                onChange={(event) => setFormData((prev) => ({ ...prev, meetingAddress: event.target.value, meetingPlace: undefined }))}
                placeholder="주소나 장소명을 직접 입력하세요"
              />
              <DetailText>{formData.meetingAddress || "발견자와 만날 장소를 설정하세요"}</DetailText>
              <DetailButton type="button" onClick={() => setShowMeetingPicker(true)}>만남 장소</DetailButton>
            </DetailBox>
          </FormGroup>
        </FormSection>
        <ButtonGroup>
          {errorMessage && <ErrorText>{errorMessage}</ErrorText>}
          <ReserveButton isValid={!isSubmitting} onClick={handleRegister} />
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
  .leaflet-map-pane { z-index: 0 !important; }
  .leaflet-top,
  .leaflet-bottom { z-index: 1 !important; }
  .meeting-bubble-marker { background: transparent; border: none; }
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
  height: calc(100vh - 161px);
  position: relative;
  .leaflet-container { z-index: 0; }
`;

const AddressSearchPanel = styled.div`
  display: grid;
  grid-template-columns: 1fr 72px;
  gap: 8px;
  padding: 12px 16px;
  border-bottom: 1px solid #f3f4f3;
  background: #fff;
  box-sizing: border-box;
`;

const AddressInput = styled.input`
  grid-column: 1 / 2;
  width: 100%;
  height: 42px;
  padding: 0 12px;
  border: 1px solid #dadada;
  border-radius: 10px;
  box-sizing: border-box;
  font-size: 13px;
  outline: none;
  &:focus { border-color: #c5f598; }
`;

const AddressButton = styled.button`
  min-width: 0;
  height: 42px;
  border: 0;
  border-radius: 10px;
  background: ${({ disabled }) => (disabled ? "#eefbe3" : "#c5f598")};
  color: ${({ disabled }) => (disabled ? "#acacac" : "#111")};
  font-size: 12px;
  font-weight: 700;
  cursor: ${({ disabled }) => (disabled ? "default" : "pointer")};
  &:last-child { grid-column: 1 / 3; }
`;

const PageWrapper = styled.div`
  font-family: "Noto Sans KR", "Apple SD Gothic Neo", sans-serif;
  max-width: 390px;
  margin: 0 auto;
  min-height: 100vh;
  background-color: #fff;
  overflow-x: hidden;
  overflow-y: auto;
`;

const FormContainer = styled.div`padding-bottom: 21px;`;
const Section = styled.div`padding: 24px 20px 20px;`;
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
const FormSection = styled.div`padding: 20px;`;
const FormTitle = styled.h3`
  font-size: 16px;
  font-weight: 700;
  color: #111;
  margin: 0 0 16px;
`;
const FormGroup = styled.div`margin-bottom: 18px;`;
const DoubleFormGroup = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-bottom: 18px;
  ${FormGroup} { margin-bottom: 0; }
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
  font-family: "Noto Sans KR", sans-serif;
  box-sizing: border-box;
  color: #111;
  outline: none;
  transition: border-color 0.2s;
  &::placeholder { color: #acacac; }
  &:focus {
    border-color: #c5f598;
    background-color: #fafafa;
  }
`;
const PhotoBox = styled.div`
  width: 100%;
  padding: 12px;
  border: 1px solid #dadada;
  border-radius: 12px;
  box-sizing: border-box;
`;
const PhotoMainButton = styled.button`
  width: 100%;
  aspect-ratio: 345 / 220;
  border: ${({ $hasImage }) => ($hasImage ? "0" : "1px dashed #dadada")};
  border-radius: 16px;
  background: #fafafa;
  overflow: hidden;
  padding: 0;
  cursor: pointer;
`;
const MainPreview = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
`;
const PhotoGuide = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
  justify-content: center;
  color: #acacac;
  font-size: 13px;
  img {
    width: 28px;
    height: 28px;
  }
`;
const HiddenFileInput = styled.input`display: none;`;
const PhotoHint = styled.p`
  margin: 10px 0 0;
  color: #acacac;
  font-size: 12px;
  line-height: 18px;
`;
const DetailBox = styled.div`
  width: 100%;
  min-height: 118px;
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
  font-family: "Noto Sans KR", sans-serif;
  font-size: 14px;
  line-height: 20px;
  display: -webkit-box;
  overflow: hidden;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  white-space: pre-line;
`;
const AddressTextInput = styled.input`
  width: 100%;
  height: 48px;
  padding: 0 12px;
  margin-bottom: 10px;
  border: 1px solid #e8e8e8;
  border-radius: 10px;
  box-sizing: border-box;
  color: #111;
  font-size: 13px;
  outline: none;
  &::placeholder { color: #acacac; }
  &:focus {
    border-color: #c5f598;
    background-color: #fafafa;
  }
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
  font-family: "Noto Sans KR", sans-serif;
`;
const ButtonGroup = styled.div`
  padding: 16px 20px 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
  justify-content: center;
`;
const ErrorText = styled.p`
  margin: 0;
  color: #d93025;
  font-size: 13px;
  font-weight: 500;
`;
