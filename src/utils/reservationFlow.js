export const STATUS = {
  PENDING: "PENDING",
  CONFIRMED: "CONFIRMED",
  REJECTED: "REJECTED",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
};

export function getReservationId(reservation) {
  return reservation?.reservationId ?? reservation?.reservation_id ?? reservation?.id;
}

export function getReservationPostId(reservation) {
  return (
    reservation?.postId ??
    reservation?.post_id ??
    reservation?.post?.postId ??
    reservation?.post?.post_id ??
    reservation?.post?.id
  );
}

export function getEffectiveReservationStatus(reservation) {
  const serverStatus = String(reservation?.status ?? STATUS.PENDING).toUpperCase();
  return serverStatus === "CANCELED" ? STATUS.CANCELLED : serverStatus;
}

export function getReservationStatusLabel(reservation) {
  const status = getEffectiveReservationStatus(reservation);
  if (status === STATUS.PENDING) return "대기중";
  if (status === STATUS.CONFIRMED) return "확정됨";
  if (status === STATUS.COMPLETED) return "완료됨";
  if (status === STATUS.REJECTED) return "거절됨";
  if (status === STATUS.CANCELLED) return "취소됨";
  return status;
}

export function getRequesterId(reservation) {
  return (
    reservation?.requesterId ??
    reservation?.requester_id ??
    reservation?.discovererId ??
    reservation?.discoverer_id ??
    reservation?.memberId ??
    reservation?.member_id ??
    reservation?.travelerId ??
    reservation?.traveler_id ??
    reservation?.userId ??
    reservation?.user_id
  );
}

export function isReviewForReservation(review, reservation) {
  const reviewPostId = review?.postId ?? review?.post_id;
  const reservationPostId = getReservationPostId(reservation);
  const reviewReservationId = review?.reservationId ?? review?.reservation_id;
  const reservationId = getReservationId(reservation);
  const reviewMemberId = review?.memberId ?? review?.member_id ?? review?.userId ?? review?.user_id;
  const requesterId = getRequesterId(reservation);

  if (reviewReservationId && reservationId) {
    return String(reviewReservationId) === String(reservationId);
  }

  if (String(reviewPostId) !== String(reservationPostId)) return false;
  if (!requesterId || !reviewMemberId) return true;
  return String(reviewMemberId) === String(requesterId);
}

export function applyReviewCompletion(reservation, reviews = []) {
  const currentStatus = getEffectiveReservationStatus(reservation);
  if (currentStatus !== STATUS.CONFIRMED && currentStatus !== STATUS.COMPLETED) {
    return { ...reservation, status: currentStatus };
  }

  const matchingReview = reviews.find((review) => isReviewForReservation(review, reservation));
  if (!matchingReview) return { ...reservation, status: currentStatus };

  return {
    ...reservation,
    status: STATUS.COMPLETED,
    myReview: reservation.myReview ?? matchingReview,
  };
}
