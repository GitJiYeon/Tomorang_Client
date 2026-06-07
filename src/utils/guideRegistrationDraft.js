export const GUIDE_REGISTRATION_DRAFT_KEY = "guideRegistrationDraft";

let representativeImageFile = null;
let representativeImagePreview = "";
let contentImageFiles = [];
let contentImagePreviews = {};

export function getRepresentativeImageDraft() {
  return {
    file: representativeImageFile,
    preview: representativeImagePreview,
  };
}

export function setRepresentativeImageDraft(file, preview) {
  representativeImageFile = file;
  representativeImagePreview = preview;
}

export function clearRepresentativeImageDraft() {
  representativeImageFile = null;
  representativeImagePreview = "";
}

export function addContentImageDraft(file, preview) {
  const id = `content_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  contentImageFiles = [...contentImageFiles, { id, file }];
  contentImagePreviews = { ...contentImagePreviews, [id]: preview };
  return id;
}

export function getContentImageDrafts() {
  return {
    files: contentImageFiles.map((item) => item.file),
    previews: contentImagePreviews,
  };
}

export function clearContentImageDrafts() {
  contentImageFiles = [];
  contentImagePreviews = {};
}

export function clearGuideRegistrationDraftFiles() {
  clearRepresentativeImageDraft();
  clearContentImageDrafts();
}
