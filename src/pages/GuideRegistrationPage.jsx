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
import DateIcon from "../assets/reservation/DateIcon.svg";
import Clocklogo from "../assets/reservation/Clocklogo.svg";
import { createPost, getMypage, getPosts } from "../api/tomorang";
import { hasValidAuthToken } from "../api/client";
import { cacheLocalPost } from "../utils/localPostCache";
import { normalizeRole } from "../utils/authRole";
import {
  clearGuideRegistrationDraftFiles,
  getContentImageDrafts,
  getRepresentativeImageDraft,
  GUIDE_REGISTRATION_DRAFT_KEY,
  setRepresentativeImageDraft,
} from "../utils/guideRegistrationDraft";
import { useI18n } from "../i18n/I18nProvider";

const REGISTRATION_CATEGORY_ROWS = [
  ["체험", "힐링", "풍경", "쇼핑", "맛집"],
  ["탐방", "사진", "액티비티", "애니메이션"],
];

const AVAILABLE_TIME_OPTIONS = Array.from({ length: 24 }, (_, hour) => `${hour}:00`);
const DEFAULT_MEETING_CENTER = [35.3191, 139.5467];
const MEETING_PICKER_ZOOM = 17;

const decodeJwtPayload = (token) => {
  try {
    const payload = token?.split(".")?.[1];
    if (!payload) return null;
    return JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
  } catch {
    return null;
  }
};

const readSavedProfile = () => {
  try {
    return JSON.parse(localStorage.getItem("profile") || "{}");
  } catch {
    return {};
  }
};

async function refreshGuidePermission() {
  const tokenPayload = decodeJwtPayload(localStorage.getItem("accessToken"));
  let mypage = null;

  try {
    mypage = await getMypage();
  } catch {
    // 등록 API가 최종 권한을 판단하므로, 마이페이지 조회 실패 시 토큰 역할만 확인합니다.
  }

  const role = normalizeRole(mypage, tokenPayload);
  if (mypage && typeof mypage === "object") {
    const savedProfile = readSavedProfile();
    const nextProfile = {
      ...savedProfile,
      ...mypage,
      role: role || mypage.role || savedProfile.role,
    };
    localStorage.setItem("profile", JSON.stringify(nextProfile));
  }
  if (role) localStorage.setItem("role", role);

  return role === "GUIDE";
}

const initialFormData = {
  location: "",
  category: "",
  scheduleDates: [],
  price: "",
  duration: "",
  startTime: "",
  title: "",
  description: "",
  courseAdditionalDescription: "",
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
    const draft = { ...initialFormData, ...JSON.parse(sessionStorage.getItem(GUIDE_REGISTRATION_DRAFT_KEY) || "{}") };
    if (!Array.isArray(draft.scheduleDates)) {
      draft.scheduleDates = draft.scheduleDate ? [draft.scheduleDate] : [];
    }
    delete draft.scheduleDate;
    return draft;
  } catch {
    return initialFormData;
  }
}

const splitCommaList = (value) =>
  String(value ?? "")
    .split(/[,\n]/)
    .map((item) => item.trim())
    .filter(Boolean);

const hasMeetingPoint = (meetingPlace) =>
  Number.isFinite(Number(meetingPlace?.lat)) && Number.isFinite(Number(meetingPlace?.lng));

const createSlotBatchId = () => {
  const randomId =
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}_${Math.random().toString(36).slice(2)}`;
  return randomId.replace(/[^a-zA-Z0-9]/g, "").slice(0, 12);
};

const uniqueAddressParts = (parts) => {
  const seen = new Set();
  return parts
    .map((part) => String(part ?? "").trim())
    .filter((part) => {
      if (!part || seen.has(part)) return false;
      seen.add(part);
      return true;
    });
};

const formatShortAddress = (place, fallback = "") => {
  const address = place?.address ?? {};
  const parts = uniqueAddressParts([
    address.city ?? address.town ?? address.village ?? address.municipality ?? address.state,
    address.city_district ?? address.borough ?? address.county,
    address.suburb ?? address.quarter ?? address.neighbourhood ?? address.hamlet ?? address.road,
  ]);

  if (parts.length > 0) return parts.slice(0, 3).join(" ");

  const displayName = place?.display_name ?? fallback;
  return String(displayName)
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean)
    .slice(0, 3)
    .join(" ");
};

function buildContentBlocks(markdown, meetingAddress, imageMap = {}, labels = {}) {
  const detailTitle = labels.detailTitle ?? "코스 상세 설명";
  const meetingTitle = labels.meetingTitle ?? "만남 장소";
  const value = meetingAddress
    ? `${markdown || detailTitle}\n\n### ${meetingTitle}\n${meetingAddress}`
    : markdown || detailTitle;
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

const createMeetingBubbleIcon = (address, actionLabel) =>
  L.divIcon({
    className: "meeting-bubble-marker",
    iconSize: [212, 78],
    iconAnchor: [106, 78],
    html: `
      <div class="meeting-bubble">
        <strong>${escapeHtml(actionLabel)}</strong>
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

function MapCenterSync({ point, center, zoom = MEETING_PICKER_ZOOM }) {
  const map = useMap();
  useEffect(() => {
    if (point) {
      map.setView([point.lat, point.lng], zoom);
      return;
    }

    if (center) map.setView(center, zoom);
  }, [center, map, point, zoom]);
  return null;
}

function MeetingPlacePicker({ onBack, onSelect }) {
  const { language, t } = useI18n();
  const [pickedPoint, setPickedPoint] = useState(null);
  const [pickedAddress, setPickedAddress] = useState(t("지도를 클릭해 위치를 선택하세요"));
  const [addressInput, setAddressInput] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [mapCenter, setMapCenter] = useState(DEFAULT_MEETING_CENTER);
  const [mapZoom, setMapZoom] = useState(MEETING_PICKER_ZOOM);

  useEffect(() => {
    if (!navigator.geolocation) return undefined;

    let alive = true;
    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (!alive) return;
        setMapCenter([position.coords.latitude, position.coords.longitude]);
        setMapZoom(MEETING_PICKER_ZOOM);
      },
      () => {},
      {
        enableHighAccuracy: true,
        timeout: 7000,
        maximumAge: 60000,
      }
    );

    return () => {
      alive = false;
    };
  }, []);

  const handlePick = async (latlng) => {
    const fallbackAddress =
      language === "ja"
        ? `緯度 ${latlng.lat.toFixed(4)}, 経度 ${latlng.lng.toFixed(4)}`
        : `위도 ${latlng.lat.toFixed(4)}, 경도 ${latlng.lng.toFixed(4)}`;
    setPickedPoint(latlng);
    setSearchResults([]);
    setPickedAddress(t("주소 불러오는 중..."));
    try {
      const params = new URLSearchParams({
        format: "jsonv2",
        lat: String(latlng.lat),
        lon: String(latlng.lng),
        addressdetails: "1",
        "accept-language": language,
      });
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?${params}`);
      const data = await response.json();
      const shortAddress = formatShortAddress(data, fallbackAddress);
      setPickedAddress(shortAddress);
      setAddressInput(shortAddress);
    } catch {
      setPickedAddress(fallbackAddress);
      setAddressInput(fallbackAddress);
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
        limit: "5",
        addressdetails: "1",
        "accept-language": language,
      });
      const response = await fetch(`https://nominatim.openstreetmap.org/search?${params}`);
      const data = await response.json();
      const results = Array.isArray(data) ? data : [];
      setSearchResults(results);
      if (results.length === 0) {
        setPickedPoint(null);
        setPickedAddress(t("검색 결과가 없어요."));
        return;
      }
    } catch {
      setPickedPoint(null);
      setSearchResults([]);
      setPickedAddress(t("주소 검색에 실패했어요."));
    } finally {
      setIsSearching(false);
    }
  };

  const selectSearchResult = (result) => {
    const point = { lat: Number(result.lat), lng: Number(result.lon) };
    if (!Number.isFinite(point.lat) || !Number.isFinite(point.lng)) return;
    const label = formatShortAddress(result, addressInput.trim());
    setPickedPoint(point);
    setPickedAddress(label);
    setAddressInput(label);
    setSearchResults([]);
  };

  const selectDirectAddress = () => {
    const label = pickedAddress || addressInput.trim();
    if (!label || !pickedPoint) return;
    onSelect({ lat: pickedPoint.lat, lng: pickedPoint.lng, label });
  };

  return (
    <MeetingPageWrapper>
      <LeafletZFix />
      <Header coment={t("만남 장소")} onBack={onBack} />
      <AddressSearchPanel>
        <AddressInput
          value={addressInput}
          onChange={(event) => setAddressInput(event.target.value)}
          placeholder={t("주소나 장소명을 입력하세요")}
          onKeyDown={(event) => {
            if (event.key === "Enter") handleAddressSearch();
          }}
        />
        <AddressButton type="button" onClick={handleAddressSearch} disabled={isSearching}>
          {isSearching ? t("검색 중") : t("검색")}
        </AddressButton>
        <SelectedAddress>{pickedAddress}</SelectedAddress>
        {searchResults.length > 0 && (
          <SearchResultList>
            {searchResults.map((result) => (
              <SearchResultButton
                key={`${result.place_id}-${result.lat}-${result.lon}`}
                type="button"
                onClick={() => selectSearchResult(result)}
              >
                <SearchResultTitle>{formatShortAddress(result, result.display_name)}</SearchResultTitle>
                <SearchResultDetail>{result.display_name}</SearchResultDetail>
              </SearchResultButton>
            ))}
          </SearchResultList>
        )}
        <AddressButton type="button" onClick={selectDirectAddress} disabled={!pickedPoint}>
          {t("이 주소로 설정")}
        </AddressButton>
      </AddressSearchPanel>
      <MeetingMapWrap>
        <MapContainer center={mapCenter} zoom={mapZoom} style={{ width: "100%", height: "100%", zIndex: 0 }} zoomControl={false}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="" />
          <MapCenterSync point={pickedPoint} center={mapCenter} zoom={mapZoom} />
          <MapClickHandler onPick={handlePick} />
          {pickedPoint && (
            <Marker
              position={pickedPoint}
              icon={createMeetingBubbleIcon(pickedAddress, t("이 위치로 설정하기"))}
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
  const { language, t } = useI18n();
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

  const selectedCategories = splitCommaList(formData.category);

  const handleCategoryToggle = (category) => {
    setFormData((prev) => {
      const currentCategories = splitCommaList(prev.category);
      const nextCategories = currentCategories.includes(category)
        ? currentCategories.filter((item) => item !== category)
        : [...currentCategories, category];
      return { ...prev, category: nextCategories.join(", ") };
    });
  };

  const handleDateToggle = (event) => {
    const date = event.target.value;
    if (!date) return;
    setFormData((prev) => {
      const dates = Array.isArray(prev.scheduleDates) ? prev.scheduleDates : [];
      const nextDates = dates.includes(date)
        ? dates.filter((item) => item !== date)
        : [...dates, date].sort();
      return { ...prev, scheduleDates: nextDates };
    });
    event.target.value = "";
  };

  const handleDateRemove = (date) => {
    setFormData((prev) => ({
      ...prev,
      scheduleDates: (prev.scheduleDates ?? []).filter((item) => item !== date),
    }));
  };

  const handleTimeSelect = (event) => {
    const time = event.target.value;
    if (!time) return;
    setFormData((prev) => {
      const currentTimes = splitCommaList(prev.startTime);
      if (currentTimes.includes(time)) return prev;
      const nextTimes = [...currentTimes, time].sort(
        (a, b) => AVAILABLE_TIME_OPTIONS.indexOf(a) - AVAILABLE_TIME_OPTIONS.indexOf(b)
      );
      return { ...prev, startTime: nextTimes.join(", ") };
    });
    event.target.value = "";
  };

  const handleTimeRemove = (time) => {
    setFormData((prev) => ({
      ...prev,
      startTime: splitCommaList(prev.startTime).filter((item) => item !== time).join(", "),
    }));
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

  const isFormComplete = Boolean(
    formData.location.trim() &&
      formData.category.trim() &&
      (formData.scheduleDates ?? []).length > 0 &&
      String(formData.price).trim() &&
      String(formData.duration).trim() &&
      splitCommaList(formData.startTime).length > 0 &&
      formData.title.trim() &&
      formData.description.trim() &&
      formData.meetingAddress.trim() &&
      hasMeetingPoint(formData.meetingPlace) &&
      representativeImage.file
  );
  const canSubmit = isFormComplete && !isSubmitting;

  const handleRegister = async () => {
    if (isSubmitting) return;
    if (!isFormComplete) {
      setErrorMessage(t("모든 항목을 작성해주세요."));
      return;
    }
    const userId = localStorage.getItem("userId");
    if (!userId || !hasValidAuthToken()) {
      setErrorMessage(t("로그인 후 코스를 등록해주세요."));
      return;
    }
    if (!representativeImage.file) {
      setErrorMessage(t("코스 사진을 최소 1장 등록해주세요."));
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");
    try {
      const hasGuidePermission = await refreshGuidePermission();
      if (!hasGuidePermission) {
        setErrorMessage(t("안내자 권한이 있는 계정으로 다시 로그인해주세요."));
        return;
      }

      const dates = Array.isArray(formData.scheduleDates) ? formData.scheduleDates : [];
      const times = splitCommaList(formData.startTime);
      if (dates.length === 0) {
        setErrorMessage(t("예약 가능한 날짜를 선택해주세요."));
        return;
      }
      if (times.length === 0) {
        setErrorMessage(t("예약 가능한 시간을 1개 이상 입력해주세요."));
        return;
      }
      if (!hasMeetingPoint(formData.meetingPlace)) {
        setErrorMessage(t("만남 장소는 지도에서 위치를 선택해 주세요."));
        return;
      }
      const { files: contentImages } = getContentImageDrafts();
      const durationValue = Number(String(formData.duration).replace(/[^0-9.]/g, "")) || 1;
      const slotBatchId = createSlotBatchId();
      const postDto = {
        user_id: userId,
        title: formData.title.trim(),
        subtitle: selectedCategories.join(", "),
        price: Number(String(formData.price).replace(/,/g, "")) || 0,
        discount_rate: 0,
        duration: `${durationValue}시간`,
        max_participants: 4,
        city_name: formData.location.trim(),
        country: "",
        lat: formData.meetingPlace?.lat,
        lng: formData.meetingPlace?.lng,
        meetingAddress: formData.meetingAddress,
        meetingPoint: formData.meetingAddress,
        meetingPointAddress: formData.meetingAddress,
        meetingPointLat: formData.meetingPlace?.lat,
        meetingPointLng: formData.meetingPlace?.lng,
        courseAdditionalDescription: formData.courseAdditionalDescription.trim(),
        contentBlocks: buildContentBlocks(formData.description, formData.meetingAddress, {}, {
          detailTitle: t("코스 상세 설명"),
          meetingTitle: t("만남 장소"),
        }),
        tags: selectedCategories.map((tagName) => ({ langCode: "ko", tagName })),
        schedules: dates.map((date, dateIndex) => ({
          date,
          timeSlots: times.map((time, index) => ({
            id: `slot_${slotBatchId}_${date.replaceAll("-", "")}_${dateIndex}_${time.replace(/[^0-9]/g, "")}_${index}`,
            time,
            status: "OPEN",
            maxCapacity: 4,
            bookedCount: 0,
          })),
        })),
      };

      const createdPost = await createPost(postDto, {
        courseImages: [representativeImage.file],
        contentImages,
      });
      cacheLocalPost({
        ...createdPost,
        ...postDto,
        postId: createdPost.postId ?? createdPost.post_id ?? createdPost.id,
        userId,
        images: createdPost.images ?? [],
        contentBlocks: postDto.contentBlocks,
        availableSchedules: postDto.schedules,
        schedules: postDto.schedules,
      });
      console.log("[Tomorang] 게시물 등록 응답:", createdPost);

      const myPostsAfterCreate = await getPosts({ userId });
      console.log("[Tomorang] 등록 후 내 게시물 목록:", myPostsAfterCreate);
      sessionStorage.removeItem(GUIDE_REGISTRATION_DRAFT_KEY);
      clearGuideRegistrationDraftFiles();
      navigate("/guide", { replace: true });
    } catch (error) {
      const message =
        error.status === 403
          ? t("안내자 권한이 있는 계정으로 다시 로그인해주세요.")
          : error.message || t("코스 등록에 실패했습니다.");
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showMeetingPicker) {
    return <MeetingPlacePicker onBack={() => setShowMeetingPicker(false)} onSelect={handleMeetingSelect} />;
  }

  return (
    <PageWrapper>
      <Header coment={t("코스등록")} />
      <FormContainer>
        <Section>
          <SectionTitle>{t("발견자에게 안내할")}</SectionTitle>
          <SectionTitle>{t("코스를 등록해주세요")}</SectionTitle>
          <SectionDescription>{t("등록한 코스는 메인에서 확인해 볼 수 있어요.")}</SectionDescription>
        </Section>
        <FormSection>
          <FormTitle>{t("기본 정보")}</FormTitle>
          <FormGroup>
            <Label>{t("활동 도시")}</Label>
            <Input name="location" placeholder={t("도쿄, 아이치, 나고야...")} value={formData.location} onChange={handleInputChange} />
          </FormGroup>
          <FormGroup>
            <Label>{t("카테고리")}</Label>
            <CategoryChipGroup>
              {REGISTRATION_CATEGORY_ROWS.map((row) => (
                <CategoryChipRow key={row.join("-")}>
                  {row.map((category) => {
                    const selected = selectedCategories.includes(category);
                    const label = t(category);
                    const compactCategory =
                      label.includes("액티비티") ||
                      label.includes("애니메이션") ||
                      label.includes("アクティビティ") ||
                      label.includes("アニメ");
                    return (
                      <CategoryChip
                        key={category}
                        type="button"
                        $selected={selected}
                        $labelLength={label.length}
                        $language={language}
                        $compactCategory={compactCategory}
                        onClick={() => handleCategoryToggle(category)}
                      >
                        {label}
                      </CategoryChip>
                    );
                  })}
                </CategoryChipRow>
              ))}
            </CategoryChipGroup>
          </FormGroup>
          <FormGroup>
            <Label>{t("예약 가능 날짜")}</Label>
            <PickerField>
              <PickerText>{t("날짜를 선택하세요")}</PickerText>
              <PickerIcon src={DateIcon} alt="" />
              <DateInput
                type="date"
                onChange={handleDateToggle}
                aria-label={t("예약 가능 날짜")}
              />
            </PickerField>
            <DateChipRow>
              {(formData.scheduleDates ?? []).map((date) => (
                <DateChip key={date} type="button" onClick={() => handleDateRemove(date)}>
                  {date}
                  <DateChipRemove aria-hidden="true">×</DateChipRemove>
                </DateChip>
              ))}
            </DateChipRow>
          </FormGroup>
          <DoubleFormGroup>
            <FormGroup>
              <Label>{t("참가비(원)")}</Label>
              <Input name="price" value={formData.price} onChange={handleInputChange} />
            </FormGroup>
            <FormGroup>
              <Label>{t("소요시간(시간)")}</Label>
              <Input name="duration" value={formData.duration} onChange={handleInputChange} />
            </FormGroup>
          </DoubleFormGroup>
          <FormGroup>
            <Label>{t("가능 시간대")}</Label>
            <PickerField>
              <PickerText>{t("시간을 선택하세요")}</PickerText>
              <PickerIcon src={Clocklogo} alt="" />
              <SelectInput defaultValue="" onChange={handleTimeSelect} aria-label={t("가능 시간대")}>
              <option value="">{t("시간을 선택하세요")}</option>
              {AVAILABLE_TIME_OPTIONS.map((time) => (
                <option key={time} value={time}>
                  {time}
                </option>
              ))}
              </SelectInput>
            </PickerField>
            <DateChipRow>
              {splitCommaList(formData.startTime).map((time) => (
                <DateChip key={time} type="button" onClick={() => handleTimeRemove(time)}>
                  {time}
                  <DateChipRemove aria-hidden="true">×</DateChipRemove>
                </DateChip>
              ))}
            </DateChipRow>
          </FormGroup>
        </FormSection>
        <FormSection>
          <FormTitle>{t("코스 정보")}</FormTitle>
          <FormGroup>
            <Label>{t("코스 제목")}</Label>
            <Input name="title" placeholder={t("코스 제목을 입력해주세요")} value={formData.title} onChange={handleInputChange} />
          </FormGroup>
          <FormGroup>
            <Label>{t("대표 사진")}</Label>
            <PhotoBox>
              <PhotoMainButton type="button" onClick={() => fileInputRef.current?.click()} $hasImage={!!representativeImage.preview}>
                {representativeImage.preview ? (
                  <MainPreview src={representativeImage.preview} alt={t("대표 사진")} />
                ) : (
                  <PhotoGuide>
                    <img src={ImageIcon} alt="" />
                    <span>{t("대표 사진을 등록해주세요")}</span>
                  </PhotoGuide>
                )}
              </PhotoMainButton>
              <HiddenFileInput ref={fileInputRef} type="file" accept="image/*" onChange={handleImageAdd} />
              <PhotoHint>{t("대표 사진 1장을 등록해주세요. 본문 이미지는 상세 설명에서 삽입할 수 있어요.")}</PhotoHint>
            </PhotoBox>
          </FormGroup>
          <FormGroup>
            <Label>{t("상세 설명")}</Label>
            <DetailBox>
              <DetailText>{formData.description || t("코스에 대한 상세내용을 작성해보세요")}</DetailText>
              <DetailButton type="button" onClick={handleDescriptionEdit}>{t("작성하기")}</DetailButton>
            </DetailBox>
          </FormGroup>
          <FormGroup>
            <Label>{t("코스 부가설명")}</Label>
            <TextArea
              name="courseAdditionalDescription"
              placeholder={t("가이드 탭에 보여줄 설명을 입력해주세요")}
              value={formData.courseAdditionalDescription}
              onChange={handleInputChange}
            />
          </FormGroup>
          <FormGroup>
            <Label>{t("만남 장소")}</Label>
            <DetailBox>
              <AddressTextInput
                value={formData.meetingAddress}
                onChange={(event) => setFormData((prev) => ({ ...prev, meetingAddress: event.target.value, meetingPlace: undefined }))}
                placeholder={t("주소나 장소명을 직접 입력하세요")}
              />
              <DetailText>{formData.meetingAddress || t("발견자와 만날 장소를 설정하세요")}</DetailText>
              <DetailButton type="button" onClick={() => setShowMeetingPicker(true)}>{t("만남 장소")}</DetailButton>
            </DetailBox>
          </FormGroup>
        </FormSection>
        <ButtonGroup>
          {errorMessage && <ErrorText>{errorMessage}</ErrorText>}
          <ReserveButton
            isValid={canSubmit}
            label={isSubmitting ? "작성 중..." : "작성하기"}
            onClick={handleRegister}
          />
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
  max-width: var(--app-page-width);
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
  padding: 14px 16px 12px;
  border-bottom: 1px solid #f3f4f3;
  background: #fff;
  box-sizing: border-box;
`;

const AddressInput = styled.input`
  grid-column: 1 / 2;
  width: 100%;
  height: 42px;
  padding: 0 14px;
  border: 1px solid #dadada;
  border-radius: 12px;
  box-sizing: border-box;
  font-size: 14px;
  font-family: "Pretendard", "Noto Sans KR", sans-serif;
  outline: none;
  &:focus { border-color: #c5f598; }
`;

const AddressButton = styled.button`
  min-width: 0;
  height: 42px;
  border: 0;
  border-radius: 12px;
  background: ${({ disabled }) => (disabled ? "#eefbe3" : "#c5f598")};
  color: ${({ disabled }) => (disabled ? "#acacac" : "#111")};
  font-size: 12px;
  font-weight: 700;
  cursor: ${({ disabled }) => (disabled ? "default" : "pointer")};
  &:last-child { grid-column: 1 / 3; }
`;

const SelectedAddress = styled.p`
  grid-column: 1 / 3;
  margin: 0;
  padding: 10px 12px;
  border-radius: 12px;
  background: #f7ffef;
  color: #4e4e4e;
  font-size: 13px;
  font-weight: 600;
  line-height: 19px;
  word-break: keep-all;
`;

const SearchResultList = styled.div`
  grid-column: 1 / 3;
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-height: 148px;
  overflow-y: auto;
`;

const SearchResultButton = styled.button`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #f3f4f3;
  border-radius: 10px;
  background: #fff;
  color: #111;
  font-family: "Pretendard", "Noto Sans KR", sans-serif;
  font-size: 12px;
  line-height: 17px;
  text-align: left;
  cursor: pointer;

  &:active {
    background: #f7ffef;
  }
`;

const SearchResultTitle = styled.span`
  display: block;
  color: #111;
  font-size: 13px;
  font-weight: 700;
  line-height: 18px;
`;

const SearchResultDetail = styled.span`
  display: block;
  margin-top: 3px;
  color: #9b9b9b;
  font-size: 11px;
  line-height: 16px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const PageWrapper = styled.div`
  font-family: "Noto Sans KR", "Apple SD Gothic Neo", sans-serif;
  max-width: var(--app-page-width);
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
const FormGroup = styled.div`
  min-width: 0;
  margin-bottom: 18px;
`;
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
  max-width: 100%;
  min-width: 0;
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
const TextArea = styled.textarea`
  width: 100%;
  max-width: 100%;
  min-width: 0;
  min-height: 112px;
  padding: 14px;
  border: 1px solid #e8e8e8;
  border-radius: 10px;
  font-size: 13px;
  font-family: "Noto Sans KR", sans-serif;
  box-sizing: border-box;
  color: #111;
  line-height: 20px;
  outline: none;
  resize: vertical;
  transition: border-color 0.2s;
  &::placeholder { color: #acacac; }
  &:focus {
    border-color: #c5f598;
    background-color: #fafafa;
  }
`;
const CategoryChipGroup = styled.div`
  width: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 9px;
`;
const CategoryChipRow = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  flex-wrap: wrap;
  gap: 8px;
`;
const CategoryChip = styled.button`
  height: 34px;
  width: ${({ $language, $labelLength, $compactCategory }) => {
    if ($compactCategory) {
      if ($language === "ja") {
        if ($labelLength >= 6) return "82px";
        if ($labelLength >= 5) return "72px";
        if ($labelLength >= 4) return "64px";
        return "56px";
      }
      if ($labelLength >= 5) return "92px";
      if ($labelLength >= 4) return "76px";
      return "58px";
    }
    if ($language === "ja") {
      if ($labelLength >= 6) return "88px";
      if ($labelLength >= 5) return "76px";
      if ($labelLength >= 4) return "68px";
      if ($labelLength >= 3) return "58px";
      return "46px";
    }
    if ($labelLength >= 5) return "112px";
    if ($labelLength >= 4) return "96px";
    return "58px";
  }};
  padding: 0 ${({ $language, $compactCategory }) => ($compactCategory ? "6px" : $language === "ja" ? "8px" : "12px")};
  border: ${({ $selected }) => ($selected ? "1px solid #c5f598" : "1px solid #dadada")};
  border-radius: 60px;
  background: ${({ $selected }) => ($selected ? "#c5f598" : "#fff")};
  color: #111;
  font-family: "Noto Sans KR", sans-serif;
  font-size: 12px;
  font-weight: ${({ $selected }) => ($selected ? 700 : 500)};
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;
`;
const PickerField = styled.div`
  position: relative;
  width: 100%;
  height: 56px;
  padding: 0 14px;
  border: 1px solid #e8e8e8;
  border-radius: 10px;
  background: #fff;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: space-between;
  overflow: hidden;

  &:focus-within {
    border-color: #c5f598;
    background-color: #fafafa;
  }
`;

const PickerText = styled.span`
  min-width: 0;
  color: #111;
  font-family: "Noto Sans KR", sans-serif;
  font-size: 14px;
  font-weight: 500;
  line-height: 20px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  pointer-events: none;
`;

const PickerIcon = styled.img`
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  pointer-events: none;
`;

const NativePickerControl = `
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  min-width: 0;
  border: 0;
  opacity: 0;
  cursor: pointer;
  font-size: 16px;
`;

const DateInput = styled.input`
  ${NativePickerControl}
`;
const SelectInput = styled.select`
  ${NativePickerControl}
`;
const DateChipRow = styled.div`
  width: 100%;
  max-width: 100%;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
  min-height: 32px;
  overflow: hidden;
`;
const DateChip = styled.button`
  max-width: 100%;
  height: 32px;
  padding: 0 10px 0 12px;
  border: 1px solid #c5f598;
  border-radius: 16px;
  background: #f7ffef;
  color: #111;
  font-family: "Noto Sans KR", sans-serif;
  font-size: 12px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
`;
const DateChipRemove = styled.span`
  color: #7ca65b;
  font-size: 14px;
  font-weight: 700;
  line-height: 1;
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
  display: none;
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
