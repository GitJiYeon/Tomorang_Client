import { apiFetch, appendJsonPart, getAuthHeader, parseResponse, API_BASE_URL } from "./client";
import { mergeLocalPostCache } from "../utils/localPostCache";
import { filterVisibleGuides, filterVisiblePosts } from "../utils/hiddenGuides";
import { getPostRatingAverage, getPostWishlistCount } from "../utils/postStats";
import { resolvePublicAsset } from "../utils/publicAsset";
import { getReviewCreatedAt, sortReviewsByRecent } from "../utils/reviews";

const toPriceText = (value) => String(value ?? 0);

const asArray = (value) => {
  if (value === undefined || value === null || value === "") return [];
  if (Array.isArray(value)) return value;
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return [];
    if (trimmed.startsWith("[") || trimmed.startsWith("{")) {
      try {
        const parsed = JSON.parse(trimmed);
        return Array.isArray(parsed) ? parsed : [parsed];
      } catch {
        return [trimmed];
      }
    }
    return [trimmed];
  }
  return [value];
};

const normalizeImageValue = (image) => {
  if (!image) return "";
  if (typeof image === "string") return resolvePublicAsset(image);
  return resolvePublicAsset(
    image.url ??
    image.imageUrl ??
    image.image_url ??
    image.fileUrl ??
    image.file_url ??
    image.s3Url ??
    image.s3_url ??
    image.path ??
    image.value ??
    image.image ??
    ""
  );
};

const isPlaceholderText = (value) => {
  const text = String(value ?? "").trim().toLowerCase();
  return !text || ["string", "null", "undefined", "example", "test"].includes(text);
};

const getGuideIdValue = (guide) =>
  guide?.id ??
  guide?.guideId ??
  guide?.guide_id ??
  guide?.userId ??
  guide?.user_id ??
  guide?.username;

const getGuideNameValue = (guide) =>
  guide?.nickname ??
  guide?.nickName ??
  guide?.name ??
  guide?.guideName ??
  guide?.memberNickName ??
  guide?.member_nick_name;

const isRealGuide = (guide) => {
  if (!guide || typeof guide !== "object") return false;

  const id = getGuideIdValue(guide);
  const name = getGuideNameValue(guide);
  const displayText = String(name ?? id ?? "");

  if (isPlaceholderText(id) && isPlaceholderText(name)) return false;
  if (/서울\s*가이드\s*김/i.test(displayText)) return false;

  return true;
};

const normalizeImages = (post) => {
  const candidates =
    post.images ??
    post.image ??
    post.thumbnail ??
    post.thumbnailUrl ??
    post.thumbnail_url ??
    post.courseImages ??
    post.course_images ??
    post.imageUrls ??
    post.image_urls ??
    post.courseImageUrls ??
    post.course_image_urls ??
    post.postImages ??
    post.post_images ??
    [];
  const images = asArray(candidates)
    .map(normalizeImageValue)
    .filter(Boolean);
  if (images.length > 0) return images;

  return asArray(post.contentBlocks ?? post.content_blocks)
    .map(normalizeContentBlock)
    .filter((block) => block?.type === "image")
    .map((block) => block.value)
    .filter(Boolean);
};

const normalizeContentBlock = (block, index) => {
  if (!block) return null;
  if (typeof block === "string") {
    return { type: "text", value: block, sequence: index };
  }

  const rawType = String(block.type ?? block.blockType ?? block.kind ?? "text").toLowerCase();
  const value =
    block.value ??
    block.content ??
    block.text ??
    block.url ??
    block.imageUrl ??
    block.image_url ??
    block.fileUrl ??
    block.file_url ??
    block.path ??
    "";

  if (!value) return null;

  return {
    ...block,
    type: rawType.includes("image") ? "image" : "text",
    value: normalizeImageValue(value),
    sequence: block.sequence ?? block.seq ?? block.order ?? index,
  };
};

const normalizeContentBlocks = (post) => {
  const blocks =
    post.contentBlocks ??
    post.content_blocks ??
    post.blocks ??
    post.contents ??
    post.postContents ??
    post.post_contents ??
    [];
  const normalizedBlocks = asArray(blocks)
    .map(normalizeContentBlock)
    .filter(Boolean)
    .sort((a, b) => (a.sequence ?? 0) - (b.sequence ?? 0));
  if (normalizedBlocks.length > 0) return normalizedBlocks;

  const fallbackText = post.description ?? post.content ?? post.detail ?? post.body ?? "";
  return fallbackText ? [{ type: "text", value: fallbackText, sequence: 0 }] : [];
};

const normalizeTimeSlots = (slots) =>
  asArray(slots).map((slot, index) => {
    if (typeof slot === "string") {
      return {
        id: `slot-${index}`,
        time: slot,
        status: "OPEN",
        bookedCount: 0,
      };
    }

    return {
      ...slot,
      id: slot.id ?? slot.slotId ?? slot.slot_id ?? `slot-${index}`,
      time: slot.time ?? slot.slotTime ?? slot.slot_time ?? slot.startTime ?? slot.start_time ?? "",
      status: slot.status ?? "OPEN",
      maxCapacity: slot.maxCapacity ?? slot.max_capacity,
      bookedCount: slot.bookedCount ?? slot.booked_count ?? 0,
    };
  });

const normalizeSchedules = (post) =>
  asArray(post.availableSchedules ?? post.available_schedules ?? post.schedules ?? post.schedule)
    .map((schedule) => ({
      ...schedule,
      date: schedule.date ?? schedule.slotDate ?? schedule.slot_date ?? schedule.scheduleDate ?? "",
      timeSlots: normalizeTimeSlots(schedule.timeSlots ?? schedule.time_slots ?? schedule.slots),
    }))
    .filter((schedule) => schedule.date);

const pickList = (data) => {
  if (Array.isArray(data)) return data;
  const candidates = [
    data?.posts,
    data?.postList,
    data?.content,
    data?.data,
    data?.items,
    data?.result,
    data?.value,
  ];
  const list = candidates.find(Array.isArray);
  return list ?? (data ? [data] : []);
};

export function normalizePost(post) {
  return mergeLocalPostCache({
    ...post,
    postId: post.postId ?? post.post_id ?? post.id,
    userId: post.userId ?? post.user_id,
    price: toPriceText(post.price),
    discountRate: post.discountRate ?? post.discount_rate ?? 0,
    reviewCount: post.reviewCount ?? post.review_count ?? 0,
    likeCount: getPostWishlistCount(post),
    cityName: post.cityName ?? post.city_name,
    maxParticipants: post.maxParticipants ?? post.max_participants ?? 1,
    meetingAddress:
      post.meetingAddress ??
      post.meeting_address ??
      post.meetingPointAddress ??
      post.meeting_point_address ??
      "",
    meetingPoint:
      post.meetingPoint ??
      post.meeting_point ??
      post.meetingPlace?.label ??
      post.meeting_place?.label ??
      "",
    meetingPointLat: post.meetingPointLat ?? post.meeting_point_lat ?? post.lat ?? post.latitude,
    meetingPointLng: post.meetingPointLng ?? post.meeting_point_lng ?? post.lng ?? post.longitude,
    rating: getPostRatingAverage(post),
    availableSchedules: normalizeSchedules(post),
    images: normalizeImages(post),
    contentBlocks: normalizeContentBlocks(post),
  });
}

export function normalizeHiddenUser(user) {
  if (!user || typeof user !== "object") {
    return { id: user ? String(user) : "" };
  }

  const id =
    user.hiddenUserId ??
    user.hidden_user_id ??
    user.userId ??
    user.user_id ??
    user.guideId ??
    user.guide_id ??
    user.id;

  return {
    ...user,
    id,
    userId: user.userId ?? user.user_id ?? id,
    nickname: user.nickname ?? user.nickName ?? user.name ?? id,
    bio: user.bio ?? user.oneWord ?? user.introduction ?? "",
    answertime:
      user.answertime ??
      user.answerTime ??
      user.avgAnswerTime ??
      user.averageAnswerTime ??
      user.average_answer_time ??
      user.responseTime ??
      user.response_time ??
      "",
    profileImage: normalizeImageValue(
      user.profileImage ??
        user.image ??
        user.profile ??
        user.profileUrl ??
        user.profileImageUrl ??
        ""
    ),
  };
}

export function normalizeReview(review) {
  const images = asArray(review.images ?? review.reviewImages ?? review.review_images ?? [])
    .map(normalizeImageValue)
    .filter(Boolean);
  const likeArray = Array.isArray(review.likes) ? review.likes : [];

  return {
    ...review,
    reviewId: review.reviewId ?? review.id,
    postId: review.postId ?? review.post_id,
    memberId: review.memberId ?? review.member_id,
    nickname: review.nickname ?? review.memberNickName ?? review.memberId ?? "사용자",
    profile: normalizeImageValue(review.profile ?? review.memberImage),
    images,
    postImages: asArray(review.postImages ?? review.post_images ?? images).map(normalizeImageValue).filter(Boolean),
    likeCount: review.likeCount ?? review.like_count ?? review.likesCount ?? likeArray.length ?? 0,
    liked: Boolean(review.liked ?? review.isLiked ?? review.is_liked ?? false),
    createdAt: getReviewCreatedAt(review) || new Date().toISOString(),
  };
}

export async function getPosts(params = {}) {
  const { includeHidden, ...queryParams } = params;
  const query = new URLSearchParams(
    Object.entries(queryParams).filter(([, value]) => value !== undefined && value !== "")
  );
  const data = await apiFetch(`/api/post${query.size ? `?${query.toString()}` : ""}`);
  return filterVisiblePosts(pickList(data).map(normalizePost), { includeHidden });
}

export async function getPostDetail(postId, options = {}) {
  const post = normalizePost(await apiFetch(`/api/post/${postId}`));
  return filterVisiblePosts([post], options)[0] ?? post;
}

export async function createPost(postDto, { courseImages = [], contentImages = [] } = {}) {
  const formData = new FormData();
  appendJsonPart(formData, "data", postDto);
  courseImages.forEach((file) => formData.append("courseImages", file));
  contentImages.forEach((file) => formData.append("contentImages", file));

  const response = await fetch(`${API_BASE_URL}/api/post`, {
    method: "POST",
    headers: getAuthHeader(),
    body: formData,
  });

  return parseResponse(response);
}

export async function updatePost(postId, postDto) {
  const data = await apiFetch(`/api/post/${postId}`, {
    method: "PUT",
    auth: true,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(postDto),
  });
  return data && typeof data === "object" ? normalizePost(data) : data;
}

export async function deletePost(postId) {
  return apiFetch(`/api/post/${postId}`, {
    method: "DELETE",
    auth: true,
  });
}

export async function bookReservation(reservationDto) {
  const jsonResponse = await fetch(`${API_BASE_URL}/api/reservation`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...getAuthHeader(),
    },
    body: JSON.stringify(reservationDto),
  });

  if (jsonResponse.status !== 415) {
    return parseResponse(jsonResponse);
  }

  const formData = new FormData();
  Object.entries(reservationDto).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      formData.append(key, value);
    }
  });

  const response = await fetch(`${API_BASE_URL}/api/reservation`, {
    method: "POST",
    headers: getAuthHeader(),
    body: formData,
  });

  return parseResponse(response);
}

export async function getMyReservations() {
  const data = await apiFetch("/api/reservation/my", { auth: true });
  return pickList(data);
}

export async function acceptReservation(reservationId) {
  return apiFetch(`/api/reservation/${reservationId}/accept`, {
    method: "PATCH",
    auth: true,
  });
}

export async function rejectReservation(reservationId) {
  return apiFetch(`/api/reservation/${reservationId}/reject`, {
    method: "PATCH",
    auth: true,
  });
}

export async function createReview(reviewDto, images = []) {
  const formData = new FormData();
  appendJsonPart(formData, "dto", reviewDto);
  images.forEach((file) => formData.append("images", file));

  const response = await fetch(`${API_BASE_URL}/api/review`, {
    method: "POST",
    headers: getAuthHeader(),
    body: formData,
  });

  const data = await parseResponse(response);
  return data && typeof data === "object" ? normalizeReview({ ...reviewDto, ...data }) : normalizeReview(reviewDto);
}

export async function createReport(reportDto) {
  const jsonResponse = await fetch(`${API_BASE_URL}/api/report`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...getAuthHeader(),
    },
    body: JSON.stringify(reportDto),
  });

  if (jsonResponse.status !== 415) {
    return parseResponse(jsonResponse);
  }

  const formData = new FormData();
  appendJsonPart(formData, "dto", reportDto);

  const response = await fetch(`${API_BASE_URL}/api/report`, {
    method: "POST",
    headers: getAuthHeader(),
    body: formData,
  });

  return parseResponse(response);
}

export async function getHiddenUsers() {
  const data = await apiFetch("/api/hidden-users", { auth: true });
  return pickList(data).map(normalizeHiddenUser).filter((user) => user.id);
}

export async function hideUser(hiddenUserId, reason = "MANUAL") {
  const query = new URLSearchParams();
  if (reason) query.set("reason", reason);
  const suffix = query.size ? `?${query.toString()}` : "";
  return apiFetch(`/api/hidden-users/${encodeURIComponent(hiddenUserId)}${suffix}`, {
    method: "POST",
    auth: true,
  });
}

export async function unhideUser(hiddenUserId) {
  return apiFetch(`/api/hidden-users/${encodeURIComponent(hiddenUserId)}`, {
    method: "DELETE",
    auth: true,
  });
}

export async function getPostReviews(postId) {
  const data = await apiFetch(`/api/review/post/${postId}`, { auth: !!localStorage.getItem("accessToken") });
  return sortReviewsByRecent(pickList(data).map(normalizeReview));
}

export async function likeReview(reviewId) {
  return apiFetch(`/api/review/${reviewId}/like`, {
    method: "POST",
    auth: true,
  });
}

export async function unlikeReview(reviewId) {
  return apiFetch(`/api/review/${reviewId}/like`, {
    method: "DELETE",
    auth: true,
  });
}

export async function getPopularGuides(options = {}) {
  const data = await apiFetch("/api/guides/popular");
  return filterVisibleGuides(pickList(data).filter(isRealGuide), options);
}

export async function getMypage() {
  return apiFetch("/api/mypage", { auth: true });
}

export async function getMyWishlists() {
  const profile = await getMypage();
  return filterVisiblePosts(pickList(profile?.wishlists ?? []).map(normalizePost));
}

export async function logoutMember() {
  return apiFetch("/api/logout", { method: "POST", auth: true });
}

export async function switchMemberRole(role) {
  const query = new URLSearchParams({ role });
  return apiFetch(`/api/member/role?${query.toString()}`, {
    method: "PUT",
    auth: true,
  });
}

export async function createOrGetChatRoom(user1, user2) {
  const query = new URLSearchParams({ user1, user2 });
  return apiFetch(`/api/chat/room?${query.toString()}`, { method: "POST" });
}

export async function getChatRooms(userId) {
  const query = new URLSearchParams({ userId });
  const data = await apiFetch(`/api/chat/rooms?${query.toString()}`);
  return pickList(data);
}

export async function getChatHistory(user1, user2) {
  const query = new URLSearchParams({ user1, user2 });
  const data = await apiFetch(`/api/chat/history?${query.toString()}`);
  return pickList(data);
}

export async function getChatHistoryByRoom(roomId) {
  const data = await apiFetch(`/api/chat/history/${roomId}`);
  return pickList(data);
}

export async function translateText(text, targetLang = "KO", sourceLang) {
  const query = new URLSearchParams({ text, targetLang });
  if (sourceLang) query.set("sourceLang", sourceLang);
  return apiFetch(`/api/translate?${query.toString()}`, { method: "POST" });
}

export async function sendChatMessage(messageDto) {
  const formData = new FormData();
  Object.entries(messageDto).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      formData.append(key, value);
    }
  });

  const response = await fetch(`${API_BASE_URL}/api/chat/message`, {
    method: "POST",
    headers: getAuthHeader(),
    body: formData,
  });

  return parseResponse(response);
}

export async function markChatRoomRead(roomId, userId) {
  const query = new URLSearchParams({ userId });
  return apiFetch(`/api/chat/room/${roomId}/read?${query.toString()}`, { method: "PATCH" });
}

export async function addWishlist(postId) {
  return apiFetch(`/api/wishlist/${postId}`, { method: "POST", auth: true });
}

export async function removeWishlist(postId) {
  return apiFetch(`/api/wishlist/${postId}`, { method: "DELETE", auth: true });
}

export function normalizeNotification(notification) {
  return {
    ...notification,
    notificationId:
      notification.notificationId ??
      notification.notification_id ??
      notification.id,
    receiverId: notification.receiverId ?? notification.receiver_id,
    senderId: notification.senderId ?? notification.sender_id,
    postId: notification.postId ?? notification.post_id,
    reservationId: notification.reservationId ?? notification.reservation_id,
    reviewId: notification.reviewId ?? notification.review_id,
    title: notification.title ?? "",
    message: notification.message ?? notification.body ?? notification.content ?? "",
    type: notification.type ?? "",
    isRead: Boolean(notification.isRead ?? notification.is_read ?? notification.read ?? false),
    createdAt: notification.createdAt ?? notification.created_at ?? notification.time ?? "",
  };
}

export async function getNotifications(userId) {
  const query = new URLSearchParams({ userId });
  const data = await apiFetch(`/api/notifications?${query.toString()}`, { auth: true });
  return pickList(data).map(normalizeNotification);
}

export async function markNotificationRead(notificationId) {
  return apiFetch(`/api/notifications/${notificationId}/read`, {
    method: "PATCH",
    auth: true,
  });
}

export async function markAllNotificationsRead(userId) {
  const query = new URLSearchParams({ userId });
  return apiFetch(`/api/notifications/read-all?${query.toString()}`, {
    method: "PATCH",
    auth: true,
  });
}

export async function getUnreadNotificationCount(userId) {
  const query = new URLSearchParams({ userId });
  const data = await apiFetch(`/api/notifications/unread-count?${query.toString()}`, { auth: true });
  return Number(data?.count ?? data ?? 0) || 0;
}
