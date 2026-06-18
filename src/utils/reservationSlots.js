const toNumber = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
};

export const getPostScheduleList = (post) => {
  if (Array.isArray(post?.availableSchedules)) return post.availableSchedules;
  if (Array.isArray(post?.available_schedules)) return post.available_schedules;
  if (Array.isArray(post?.schedules)) return post.schedules;
  if (Array.isArray(post?.schedule)) return post.schedule;
  return [];
};

export const hasPostScheduleData = (post) =>
  Array.isArray(post?.availableSchedules) ||
  Array.isArray(post?.available_schedules) ||
  Array.isArray(post?.schedules) ||
  Array.isArray(post?.schedule);

const getScheduleSlots = (schedule) => {
  if (Array.isArray(schedule?.timeSlots)) return schedule.timeSlots;
  if (Array.isArray(schedule?.time_slots)) return schedule.time_slots;
  if (Array.isArray(schedule?.slots)) return schedule.slots;
  return [];
};

export const isReservableSlot = (slot) => {
  const status = String(slot?.status ?? slot?.slotStatus ?? slot?.slot_status ?? "").toUpperCase();
  const bookedCount = toNumber(
    slot?.bookedCount ??
      slot?.booked_count ??
      slot?.reservationCount ??
      slot?.reservation_count ??
      slot?.currentCount ??
      slot?.current_count
  );

  if (slot?.available === false || slot?.isAvailable === false || slot?.is_available === false) return false;
  if (bookedCount > 0) return false;
  if (!status) return true;
  return ["OPEN", "AVAILABLE"].includes(status);
};

export const hasReservableSlots = (post) =>
  getPostScheduleList(post).some((schedule) =>
    getScheduleSlots(schedule).some((slot) => isReservableSlot(slot))
  );

export const getPostClosedStatus = (post) => {
  const explicitStatus = String(
    post?.reservationStatus ??
      post?.reservation_status ??
      post?.bookingStatus ??
      post?.booking_status ??
      post?.postStatus ??
      post?.post_status ??
      post?.status ??
      ""
  ).toUpperCase();
  const explicitClosed =
    post?.closed ??
    post?.isClosed ??
    post?.is_closed ??
    post?.soldOut ??
    post?.sold_out ??
    post?.fullyBooked ??
    post?.fully_booked;

  if (typeof explicitClosed === "boolean") return explicitClosed;
  if (["CLOSED", "FULL", "SOLD_OUT", "UNAVAILABLE"].includes(explicitStatus)) return true;
  if (["OPEN", "AVAILABLE"].includes(explicitStatus) && !hasPostScheduleData(post)) return false;
  if (!hasPostScheduleData(post)) return null;
  return !hasReservableSlots(post);
};

export const isPostClosedForReservation = (post) => getPostClosedStatus(post) === true;
