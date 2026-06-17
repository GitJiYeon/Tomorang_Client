export function getReviewCreatedAt(review) {
  return (
    review?.createdAt ??
    review?.created_at ??
    review?.createdDate ??
    review?.created_date ??
    review?.createdTime ??
    review?.created_time ??
    review?.registeredAt ??
    review?.registered_at ??
    review?.timestamp ??
    review?.time ??
    ""
  );
}

export function getReviewTimestamp(review) {
  const value = getReviewCreatedAt(review);
  const timestamp = new Date(value).getTime();
  return Number.isFinite(timestamp) ? timestamp : 0;
}

export function sortReviewsByRecent(reviews = []) {
  return [...reviews].sort((a, b) => getReviewTimestamp(b) - getReviewTimestamp(a));
}
