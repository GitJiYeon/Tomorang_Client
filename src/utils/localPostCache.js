const CACHE_KEY = "tomorangLocalPostCache";

const makePostCacheKey = (post) =>
  [
    post.postId ?? post.post_id ?? post.id ?? "",
    post.userId ?? post.user_id ?? "",
    post.title ?? "",
    post.price ?? "",
    post.duration ?? "",
  ].join("|");

function readCache() {
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY) || "{}");
  } catch {
    return {};
  }
}

function writeCache(cache) {
  localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
}

const keepServerValue = (serverValue, cachedValue) => {
  if (Array.isArray(serverValue)) return serverValue.length ? serverValue : cachedValue ?? serverValue;
  return serverValue ?? cachedValue;
};

export function cacheLocalPost(post) {
  const cache = readCache();
  cache[makePostCacheKey(post)] = post;
  writeCache(cache);
}

export function mergeLocalPostCache(post) {
  const cache = readCache();
  const direct = cache[makePostCacheKey(post)];
  if (direct) {
    return {
      ...post,
      subtitle: keepServerValue(post.subtitle, direct.subtitle ?? direct.subTitle ?? direct.sub_title),
      subTitle: keepServerValue(post.subTitle, direct.subTitle ?? direct.subtitle ?? direct.sub_title),
      category: keepServerValue(post.category, direct.category),
      categoryName: keepServerValue(post.categoryName, direct.categoryName ?? direct.category_name),
      category_name: keepServerValue(post.category_name, direct.category_name ?? direct.categoryName),
      tags: keepServerValue(post.tags, direct.tags),
      tag: keepServerValue(post.tag, direct.tag),
      images: post.images?.length ? post.images : direct.images ?? [],
      contentBlocks: post.contentBlocks?.length ? post.contentBlocks : direct.contentBlocks ?? [],
      availableSchedules: post.availableSchedules?.length ? post.availableSchedules : direct.availableSchedules ?? [],
      schedules: post.schedules?.length ? post.schedules : direct.schedules ?? [],
    };
  }

  const fallback = Object.values(cache).find(
    (cached) =>
      String(cached.title ?? "") === String(post.title ?? "") &&
      String(cached.price ?? "") === String(post.price ?? "") &&
      String(cached.duration ?? "") === String(post.duration ?? "")
  );

  const looseFallback = fallback ?? Object.values(cache).find(
    (cached) =>
      String(cached.title ?? "") === String(post.title ?? "") &&
      String(cached.price ?? "") === String(post.price ?? "")
  );

  if (!looseFallback) return post;

  return {
    ...post,
    subtitle: keepServerValue(post.subtitle, looseFallback.subtitle ?? looseFallback.subTitle ?? looseFallback.sub_title),
    subTitle: keepServerValue(post.subTitle, looseFallback.subTitle ?? looseFallback.subtitle ?? looseFallback.sub_title),
    category: keepServerValue(post.category, looseFallback.category),
    categoryName: keepServerValue(post.categoryName, looseFallback.categoryName ?? looseFallback.category_name),
    category_name: keepServerValue(post.category_name, looseFallback.category_name ?? looseFallback.categoryName),
    tags: keepServerValue(post.tags, looseFallback.tags),
    tag: keepServerValue(post.tag, looseFallback.tag),
    images: post.images?.length ? post.images : looseFallback.images ?? [],
    contentBlocks: post.contentBlocks?.length ? post.contentBlocks : looseFallback.contentBlocks ?? [],
    availableSchedules: post.availableSchedules?.length ? post.availableSchedules : looseFallback.availableSchedules ?? [],
    schedules: post.schedules?.length ? post.schedules : looseFallback.schedules ?? [],
  };
}
