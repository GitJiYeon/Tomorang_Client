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

const KST_OFFSET_MS = 9 * 60 * 60 * 1000;

const parseArrayDate = (value) => {
  const [year, month = 1, day = 1, hour = 0, minute = 0, second = 0] = value;
  return new Date(year, Number(month) - 1, day, hour, minute, second).getTime();
};

export function parseReviewDate(value) {
  if (Array.isArray(value)) {
    const timestamp = parseArrayDate(value);
    return Number.isFinite(timestamp) ? new Date(timestamp) : null;
  }

  const text = String(value ?? "").trim();
  if (!text) return null;

  const parsed = new Date(text);
  const parsedTime = parsed.getTime();
  if (!Number.isFinite(parsedTime)) return null;

  if (/Z$/i.test(text)) {
    const localCandidate = new Date(text.replace(/Z$/i, ""));
    const localTime = localCandidate.getTime();

    if (
      Number.isFinite(localTime) &&
      Math.abs(Math.abs(localTime - parsedTime) - KST_OFFSET_MS) < 60 * 1000
    ) {
      return localCandidate;
    }
  }

  return parsed;
}

export function getReviewTimestamp(review) {
  const timestamp = parseReviewDate(getReviewCreatedAt(review))?.getTime() ?? 0;
  return Number.isFinite(timestamp) ? timestamp : 0;
}

export function sortReviewsByRecent(reviews = []) {
  return [...reviews].sort((a, b) => getReviewTimestamp(b) - getReviewTimestamp(a));
}

export function formatReviewTimeAgo(value, t = (text) => text) {
  const date = parseReviewDate(value);
  const timestamp = date?.getTime();
  if (!Number.isFinite(timestamp)) return t("방금 전");

  const diffMs = Math.max(0, Date.now() - timestamp);
  const diffMin = Math.floor(diffMs / 1000 / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffMin < 1) return t("방금 전");
  if (diffMin < 60) return `${diffMin}${t("분 전")}`;
  if (diffHour < 24) return `${diffHour}${t("시간 전")}`;
  return `${diffDay}${t("일 전")}`;
}
