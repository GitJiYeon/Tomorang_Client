import { createContext, useContext, useEffect, useState } from "react";
import { getMyReservations } from "../../api/tomorang";

const ReservationContext = createContext(null);

const asArray = (value) => {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.reservations)) return value.reservations;
  if (Array.isArray(value?.content)) return value.content;
  if (Array.isArray(value?.data)) return value.data;
  if (Array.isArray(value?.items)) return value.items;
  if (Array.isArray(value?.value)) return value.value;
  return value ? [value] : [];
};

const normalizeReservation = (reservation) => ({
  ...reservation,
  reservationId: reservation.reservationId ?? reservation.reservation_id ?? reservation.id,
  postId:
    reservation.postId ??
    reservation.post_id ??
    reservation.post?.postId ??
    reservation.post?.post_id ??
    reservation.post?.id,
  date: reservation.date ?? reservation.slotDate ?? reservation.slot_date ?? reservation.scheduleDate,
  time: reservation.time ?? reservation.slotTime ?? reservation.slot_time ?? reservation.timeSlot,
  adults: reservation.adults ?? reservation.adultCount ?? reservation.adult_count ?? 1,
  children: reservation.children ?? reservation.childCount ?? reservation.child_count ?? 0,
  request: reservation.request ?? reservation.memo ?? reservation.message ?? "",
  status: reservation.status ?? "PENDING",
});

export function ReservationProvider({ children }) {
  const [reservations, setReservations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const refreshReservations = async () => {
    if (!localStorage.getItem("accessToken")) {
      setReservations([]);
      return [];
    }

    setIsLoading(true);
    setErrorMessage("");
    try {
      const data = await getMyReservations();
      const nextReservations = asArray(data).map(normalizeReservation);
      setReservations(nextReservations);
      return nextReservations;
    } catch (error) {
      setErrorMessage(error.message || "예약 목록을 불러오지 못했습니다.");
      setReservations([]);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshReservations();
  }, []);

  const completeAndSaveReview = async (reservationId, review) => {
    setReservations((prev) =>
      prev.map((reservation) =>
        String(reservation.reservationId) === String(reservationId)
          ? {
              ...reservation,
              status: "COMPLETED",
              myReview: {
                rating: review.rating,
                content: review.content,
                images: review.images ?? [],
                answers: review.answers ?? {},
                createdAt: review.createdAt ?? new Date().toISOString(),
              },
            }
          : reservation
      )
    );
  };

  return (
    <ReservationContext.Provider
      value={{ reservations, isLoading, errorMessage, refreshReservations, completeAndSaveReview }}
    >
      {children}
    </ReservationContext.Provider>
  );
}

export function useReservations() {
  const ctx = useContext(ReservationContext);
  if (!ctx) throw new Error("useReservations must be used within ReservationProvider");
  return ctx;
}
