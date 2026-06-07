const LIKED_POSTS_KEY = "likedPosts";
const WISHLIST_CHANGED_EVENT = "tomorang:wishlist-changed";

const toId = (id) => String(id ?? "");

export const getPostId = (post) => post?.postId ?? post?.post_id ?? post?.id;

export function readLikedPostIds() {
  try {
    const ids = JSON.parse(localStorage.getItem(LIKED_POSTS_KEY) ?? "[]");
    return Array.isArray(ids) ? ids.map(toId).filter(Boolean) : [];
  } catch {
    return [];
  }
}

export function writeLikedPostIds(ids) {
  const normalizedIds = [...new Set(ids.map(toId).filter(Boolean))];
  localStorage.setItem(LIKED_POSTS_KEY, JSON.stringify(normalizedIds));
  window.dispatchEvent(new CustomEvent(WISHLIST_CHANGED_EVENT, { detail: normalizedIds }));
  return normalizedIds;
}

export function isPostLiked(postId) {
  return readLikedPostIds().includes(toId(postId));
}

export function setPostLiked(postId, liked) {
  const id = toId(postId);
  if (!id) return readLikedPostIds();

  const ids = readLikedPostIds();
  return writeLikedPostIds(liked ? [...ids, id] : ids.filter((item) => item !== id));
}

export function syncLikedPostsFromWishlists(wishlists = []) {
  return writeLikedPostIds(wishlists.map(getPostId));
}

export function subscribeWishlistChanges(callback) {
  const handler = () => callback(readLikedPostIds());
  window.addEventListener("storage", handler);
  window.addEventListener(WISHLIST_CHANGED_EVENT, handler);
  return () => {
    window.removeEventListener("storage", handler);
    window.removeEventListener(WISHLIST_CHANGED_EVENT, handler);
  };
}
