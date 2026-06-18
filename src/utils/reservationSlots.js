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

export const isPostClosedForReservation = (post) => {
  const schedules = getPostScheduleList(post);
  if (schedules.length === 0) return false;
  return !hasReservableSlots(post);
};
