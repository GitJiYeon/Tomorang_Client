export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "https://tomorangserver-production.up.railway.app";

export function getAuthHeader() {
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
    const message = typeof data === "string" ? data : data.message || data.error;
    throw new Error(message || "요청에 실패했습니다.");
  }

  return data;
}

export async function apiFetch(path, options = {}) {
  const headers = {
    Accept: "application/json",
    ...(options.auth ? getAuthHeader() : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  return parseResponse(response);
}

export function appendJsonPart(formData, name, value) {
  formData.append(
    name,
    new Blob([JSON.stringify(value)], { type: "application/json" })
  );
}
