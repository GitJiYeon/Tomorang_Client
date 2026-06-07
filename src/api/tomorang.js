import { apiFetch, appendJsonPart, getAuthHeader, parseResponse, API_BASE_URL } from "./client";

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
  if (typeof image === "string") return image;
  return (
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
    value,
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
  return {
    ...post,
    postId: post.postId ?? post.post_id ?? post.id,
    userId: post.userId ?? post.user_id,
    price: toPriceText(post.price),
    discountRate: post.discountRate ?? post.discount_rate ?? 0,
    reviewCount: post.reviewCount ?? post.review_count ?? 0,
    likeCount: post.likeCount ?? post.like_count ?? 0,
    cityName: post.cityName ?? post.city_name,
    maxParticipants: post.maxParticipants ?? post.max_participants ?? 1,
    rating: Number(post.rating ?? 0),
    availableSchedules: post.availableSchedules ?? post.schedules ?? [],
    images: normalizeImages(post),
    contentBlocks: normalizeContentBlocks(post),
  };
}

export function normalizeReview(review) {
  return {
    ...review,
    reviewId: review.reviewId ?? review.id,
    postId: review.postId ?? review.post_id,
    nickname: review.nickname ?? review.memberNickName ?? review.memberId ?? "사용자",
    profile: review.profile ?? review.memberImage,
    postImages: review.postImages ?? review.images ?? [],
    createdAt: review.createdAt ?? new Date().toISOString(),
  };
}

export async function getPosts(params = {}) {
  const query = new URLSearchParams(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== "")
  );
  const data = await apiFetch(`/api/post${query.size ? `?${query.toString()}` : ""}`);
  return pickList(data).map(normalizePost);
}

export async function getPostDetail(postId) {
  return normalizePost(await apiFetch(`/api/post/${postId}`));
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

export async function bookReservation(reservationDto) {
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

export async function createReview(reviewDto, images = []) {
  const formData = new FormData();
  appendJsonPart(formData, "dto", reviewDto);
  images.forEach((file) => formData.append("images", file));

  const response = await fetch(`${API_BASE_URL}/api/review`, {
    method: "POST",
    headers: getAuthHeader(),
    body: formData,
  });

  return parseResponse(response);
}

export async function getPostReviews(postId) {
  const data = await apiFetch(`/api/review/post/${postId}`, { auth: !!localStorage.getItem("accessToken") });
  return pickList(data).map(normalizeReview);
}

export async function getPopularGuides() {
  const data = await apiFetch("/api/guides/popular");
  return pickList(data);
}

export async function getMypage() {
  return apiFetch("/api/mypage", { auth: true });
}

export async function getMyWishlists() {
  const profile = await getMypage();
  return pickList(profile?.wishlists ?? []).map(normalizePost);
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
