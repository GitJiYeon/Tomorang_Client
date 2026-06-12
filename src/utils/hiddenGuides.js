import { getPostOwnerId } from "./postOwner";

const LEGACY_HIDDEN_GUIDE_IDS_KEY = "hiddenGuides";
const LEGACY_HIDDEN_GUIDE_PROFILES_KEY = "hiddenGuideProfiles";
const HIDDEN_GUIDE_IDS_PREFIX = "hiddenGuides:";
const HIDDEN_GUIDE_PROFILES_PREFIX = "hiddenGuideProfiles:";
export const HIDDEN_GUIDES_EVENT = "hiddenGuidesChange";

const asId = (value) => {
  if (value === undefined || value === null || value === "") return null;
  return String(value);
};

const getViewerId = () => {
  try {
    const profile = JSON.parse(localStorage.getItem("profile") || "{}");
    return (
      localStorage.getItem("userId") ||
      profile?.id ||
      profile?.userId ||
      profile?.guideId ||
      profile?.memberId ||
      "anonymous"
    );
  } catch {
    return localStorage.getItem("userId") || "anonymous";
  }
};

const scopedIdsKey = () => `${HIDDEN_GUIDE_IDS_PREFIX}${getViewerId()}`;
const scopedProfilesKey = () => `${HIDDEN_GUIDE_PROFILES_PREFIX}${getViewerId()}`;

const safeParseArray = (key) => {
  try {
    const parsed = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const removeLegacyHiddenCache = (id) => {
  const nextLegacyIds = safeParseArray(LEGACY_HIDDEN_GUIDE_IDS_KEY).filter(
    (item) => String(item) !== String(id)
  );
  localStorage.setItem(LEGACY_HIDDEN_GUIDE_IDS_KEY, JSON.stringify(nextLegacyIds));

  const nextLegacyProfiles = safeParseArray(LEGACY_HIDDEN_GUIDE_PROFILES_KEY).filter((item) => {
    const itemId = getGuideId(item);
    return String(itemId) !== String(id);
  });
  localStorage.setItem(LEGACY_HIDDEN_GUIDE_PROFILES_KEY, JSON.stringify(nextLegacyProfiles));
};

export const getGuideId = (guide) =>
  asId(
    guide?.id ??
      guide?.guideId ??
      guide?.guide_id ??
      guide?.userId ??
      guide?.user_id ??
      guide?.hiddenUserId ??
      guide?.hidden_user_id ??
      guide?.username
  );

export function getHiddenGuideIds() {
  return new Set(safeParseArray(scopedIdsKey()).map(String));
}

export function getHiddenGuides() {
  return safeParseArray(scopedProfilesKey())
    .map(normalizeHiddenGuide)
    .filter((guide) => guide.id);
}

export function normalizeHiddenGuide(source) {
  if (!source || typeof source !== "object") return { id: asId(source) };

  const id = getGuideId(source);
  return {
    ...source,
    id,
    userId: source.userId ?? source.user_id ?? source.hiddenUserId ?? source.hidden_user_id ?? id,
    nickname:
      source.nickname ??
      source.nickName ??
      source.name ??
      source.guideName ??
      source.userId ??
      id,
    bio:
      source.bio ??
      source.oneWord ??
      source.introduction ??
      source.description ??
      source.guideDescription ??
      "",
    answertime:
      source.answertime ??
      source.answerTime ??
      source.responseTime ??
      source.avgResponseTime ??
      "",
    profileImage:
      source.profileImage ??
      source.image ??
      source.profile ??
      source.profileUrl ??
      source.profileImageUrl ??
      "",
  };
}

export function getHiddenGuideFromPost(post) {
  const guide = post?.guide ?? post?.guideProfile ?? post?.guideInfo ?? {};
  const id = getPostOwnerId(post);

  return normalizeHiddenGuide({
    ...guide,
    id,
    userId: id,
    nickname:
      guide?.nickname ??
      guide?.nickName ??
      post?.guideName ??
      post?.guideNickname ??
      post?.nickName ??
      id,
    bio:
      guide?.bio ??
      guide?.oneWord ??
      post?.guideBio ??
      post?.guideDescription ??
      post?.oneWord ??
      "",
    profileImage:
      guide?.profileImage ??
      guide?.image ??
      post?.guideImage ??
      post?.guideProfileImage ??
      post?.profileImage ??
      "",
  });
}

export function hideGuide(source) {
  const guide = normalizeHiddenGuide(source);
  if (!guide.id) return false;

  removeLegacyHiddenCache(guide.id);

  const ids = Array.from(getHiddenGuideIds());
  if (!ids.includes(guide.id)) {
    ids.push(guide.id);
  }
  localStorage.setItem(scopedIdsKey(), JSON.stringify(ids));

  const profiles = getHiddenGuides();
  const nextProfiles = [
    ...profiles.filter((item) => String(item.id) !== String(guide.id)),
    guide,
  ];
  localStorage.setItem(scopedProfilesKey(), JSON.stringify(nextProfiles));
  window.dispatchEvent(new CustomEvent(HIDDEN_GUIDES_EVENT, { detail: guide }));
  return true;
}

export function unhideGuide(guideOrId) {
  const id = typeof guideOrId === "object" ? getGuideId(guideOrId) : asId(guideOrId);
  if (!id) return false;

  removeLegacyHiddenCache(id);

  const nextIds = Array.from(getHiddenGuideIds()).filter((item) => String(item) !== String(id));
  localStorage.setItem(scopedIdsKey(), JSON.stringify(nextIds));

  const nextProfiles = getHiddenGuides().filter((item) => String(item.id) !== String(id));
  localStorage.setItem(scopedProfilesKey(), JSON.stringify(nextProfiles));
  window.dispatchEvent(new CustomEvent(HIDDEN_GUIDES_EVENT, { detail: { id, unhidden: true } }));
  return true;
}

export function isGuideHidden(guideOrId) {
  const id = typeof guideOrId === "object" ? getGuideId(guideOrId) : asId(guideOrId);
  return Boolean(id && getHiddenGuideIds().has(String(id)));
}

export function isPostFromHiddenGuide(post) {
  const guideId = getPostOwnerId(post);
  return Boolean(guideId && isGuideHidden(guideId));
}

export function filterVisiblePosts(posts, { includeHidden = false } = {}) {
  if (includeHidden) return posts;
  return posts.filter((post) => !isPostFromHiddenGuide(post));
}

export function filterVisibleGuides(guides, { includeHidden = false } = {}) {
  if (includeHidden) return guides;
  return guides.filter((guide) => !isGuideHidden(guide));
}
