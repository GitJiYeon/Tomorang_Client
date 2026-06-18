import { useEffect, useState } from "react";
import { getPostDetail } from "../api/tomorang";
import { getPostClosedStatus } from "../utils/reservationSlots";
import { getPostId } from "../utils/wishlist";

const closedStatusCache = new Map();

export default function usePostClosedStatus(post) {
  const postId = getPostId(post);
  const immediateStatus = getPostClosedStatus(post);
  const [isClosed, setIsClosed] = useState(() => immediateStatus === true);

  useEffect(() => {
    if (immediateStatus !== null) {
      setIsClosed(immediateStatus === true);
      return undefined;
    }

    if (!postId) {
      setIsClosed(false);
      return undefined;
    }

    const cacheKey = String(postId);
    if (closedStatusCache.has(cacheKey)) {
      setIsClosed(closedStatusCache.get(cacheKey));
      return undefined;
    }

    let alive = true;
    getPostDetail(postId)
      .then((detail) => {
        const closed = getPostClosedStatus(detail) === true;
        closedStatusCache.set(cacheKey, closed);
        if (alive) setIsClosed(closed);
      })
      .catch(() => {
        if (alive) setIsClosed(false);
      });

    return () => {
      alive = false;
    };
  }, [immediateStatus, postId]);

  return isClosed;
}
