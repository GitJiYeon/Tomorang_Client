const toNumber = (value, fallback = 0) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
};

const firstNumber = (...values) => {
  const found = values.find((value) => value !== undefined && value !== null && value !== "");
  return toNumber(found, 0);
};

export function getPostRatingAverage(post) {
  const reviews = Array.isArray(post?.reviews)
    ? post.reviews
    : Array.isArray(post?.reviewList)
      ? post.reviewList
      : [];
  const reviewAverage = reviews.length > 0 ? getReviewRatingAverage(reviews) : undefined;

  return firstNumber(
    reviewAverage,
    post?.avgRating,
    post?.avg_rating,
    post?.averageRating,
    post?.average_rating,
    post?.rating
  );
}

export function getPostWishlistCount(post) {
  const wishlistArray = Array.isArray(post?.wishlists)
    ? post.wishlists
    : Array.isArray(post?.wishlist)
      ? post.wishlist
      : Array.isArray(post?.likes)
        ? post.likes
        : [];

  return firstNumber(
    post?.wishlistCount,
    post?.wishlist_count,
    post?.wishCount,
    post?.wish_count,
    post?.likeCount,
    post?.like_count,
    post?.totalLikes,
    post?.total_likes,
    wishlistArray.length || undefined
  );
}

export function getReviewRatingAverage(reviews = [], fallback = 0) {
  const ratings = reviews
    .map((review) => toNumber(review?.rating, NaN))
    .filter(Number.isFinite);

  if (ratings.length === 0) return toNumber(fallback, 0);
  return ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
}

export function formatRating(value) {
  return toNumber(value, 0).toFixed(1);
}
