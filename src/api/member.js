import { API_BASE_URL, appendJsonPart, getAuthHeader, parseResponse } from "./client";

const LANGUAGE_MAP = {
  ko: "KOREAN",
  ja: "JAPANESE",
  en: "ENGLISH",
};

const LEVEL_MAP = {
  beginner: 1,
  intermediate: 2,
  advanced: 3,
};

export function normalizeLanguages(selectedLanguages = []) {
  return selectedLanguages.reduce(
    (result, { languageCode, level }) => {
      const language = LANGUAGE_MAP[languageCode] || languageCode;
      const languageLevel = LEVEL_MAP[level] || level;

      if (language && languageLevel) {
        result.languages.push(language);
        result.levels.push(languageLevel);
      }

      return result;
    },
    { languages: [], levels: [] }
  );
}

export async function loginMember(id, pw) {
  const query = new URLSearchParams({ id, pw });
  const response = await fetch(`${API_BASE_URL}/api/login?${query.toString()}`, {
    method: "POST",
    headers: {
      Accept: "application/json",
    },
  });

  return parseResponse(response);
}

export async function signupMember(dto, imageFile) {
  const formData = new FormData();
  appendJsonPart(formData, "dto", dto);

  if (imageFile) {
    formData.append("image", imageFile);
  }

  const response = await fetch(`${API_BASE_URL}/api/signup`, {
    method: "POST",
    body: formData,
  });

  return parseResponse(response);
}

export async function updateMember(dto, imageFile) {
  const formData = new FormData();
  appendJsonPart(formData, "dto", dto);

  if (imageFile) {
    formData.append("image", imageFile);
  }

  const response = await fetch(`${API_BASE_URL}/api/member`, {
    method: "PUT",
    headers: getAuthHeader(),
    body: formData,
  });

  return parseResponse(response);
}
