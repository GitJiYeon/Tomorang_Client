export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "https://tomorang.mirim-it-show.site";

const AUTH_STORAGE_KEYS = [
  "accessToken",
  "tokenType",
  "userId",
  "role",
  "profile",
  "likedPosts",
  "hiddenGuides",
  "hiddenGuideProfiles",
];

function decodeJwtPayload(token) {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    const normalizedPayload = payload.replace(/-/g, "+").replace(/_/g, "/");
    const decodedPayload = atob(normalizedPayload);
    return JSON.parse(decodedPayload);
  } catch {
    return null;
  }
}

export function clearAuthStorage() {
  AUTH_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key));
}

export function hasValidAuthToken() {
  const token = localStorage.getItem("accessToken");
  if (!token) return false;

  const payload = decodeJwtPayload(token);
  if (!payload?.exp) return true;

  const expiresAt = payload.exp * 1000;
  if (expiresAt > Date.now()) return true;

  clearAuthStorage();
  return false;
}

export function getAuthHeader() {
  if (!hasValidAuthToken()) return {};

  const token = localStorage.getItem("accessToken");
  const tokenType = localStorage.getItem("tokenType") || "Bearer";

  return token ? { Authorization: `${tokenType} ${token}` } : {};
}

export async function parseResponse(response) {
  const contentType = response.headers.get("content-type") || "";
  const rawText = await response.text();
  let data = rawText;

  if (contentType.includes("application/json") && rawText) {
    try {
      data = JSON.parse(rawText);
    } catch {
      data = rawText;
    }
  }

  if (!response.ok) {
    const message =
      typeof data === "string"
        ? data
        : data?.message ||
          data?.error ||
          data?.detail ||
          data?.reason ||
          Object.values(data ?? {}).find((value) => typeof value === "string") ||
          JSON.stringify(data);
    const error = new Error(
      `[${response.status}] ${message || response.statusText || "Request failed"}`
    );
    error.status = response.status;
    error.url = response.url;
    error.data = data;
    console.error("[Tomorang API]", {
      status: error.status,
      url: error.url,
      body: error.data,
    });
    throw error;
  }

  return data;
}

export async function apiFetch(path, options = {}) {
  if (options.auth && !hasValidAuthToken()) {
    throw new Error("로그인이 필요합니다.");
  }

  const headers = {
    Accept: "application/json",
    ...(options.auth ? getAuthHeader() : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (options.auth && [401, 403].includes(response.status)) {
    clearAuthStorage();
  }

  return parseResponse(response);
}

export function appendJsonPart(formData, name, value) {
  formData.append(
    name,
    new Blob([JSON.stringify(value)], { type: "application/json" })
  );
}
