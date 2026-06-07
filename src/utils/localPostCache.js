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
      images: post.images?.length ? post.images : direct.images ?? [],
      contentBlocks: post.contentBlocks?.length ? post.contentBlocks : direct.contentBlocks ?? [],
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
    images: post.images?.length ? post.images : looseFallback.images ?? [],
    contentBlocks: post.contentBlocks?.length ? post.contentBlocks : looseFallback.contentBlocks ?? [],
  };
}
