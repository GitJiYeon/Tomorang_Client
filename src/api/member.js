import { API_BASE_URL, appendJsonPart, parseResponse } from "./client";

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
