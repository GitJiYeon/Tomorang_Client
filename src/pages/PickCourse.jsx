import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import styled from "styled-components";
import Header from "../components/Header";
import PostCardList from "../components/PostCardList";
import { deletePost, getMyWishlists, getPosts, updatePost } from "../api/tomorang";
import { getPostDescription } from "../utils/postDisplay";
import { getPostOwnerId } from "../utils/postOwner";
import { getPostId, syncLikedPostsFromWishlists } from "../utils/wishlist";

const sameId = (a, b) => String(a ?? "") === String(b ?? "");

const getPostTime = (post) => {
  const value =
    post?.createdAt ??
    post?.created_at ??
    post?.updatedAt ??
    post?.updated_at ??
    post?.registeredAt ??
    post?.registered_at;

  if (Array.isArray(value)) {
    const [year, month, day, hour = 0, minute = 0, second = 0] = value;
    return new Date(year, Number(month) - 1, day, hour, minute, second).getTime();
  }

  if (value) {
    const time = new Date(value).getTime();
    if (!Number.isNaN(time)) return time;
  }

  const id = Number(getPostId(post));
  return Number.isNaN(id) ? 0 : id;
};

export default function PickCourse() {
  const { state } = useLocation();
  const profile = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("profile") || "{}");
    } catch {
      return {};
    }
  }, []);
  const currentUserId =
    localStorage.getItem("userId") ||
    profile?.id ||
    profile?.userId ||
    profile?.guideId ||
    profile?.memberId ||
    "";
  const isGuideMode = state?.mode === "guide" || profile?.role === "GUIDE";
  const [posts, setPosts] = useState([]);
  const [deletingId, setDeletingId] = useState("");
  const [editingId, setEditingId] = useState("");

  useEffect(() => {
    let alive = true;

    const loadGuidePosts = async () => {
      const directPosts = await getPosts({ userId: currentUserId, includeHidden: true });
      if (directPosts.length > 0) return directPosts;

      const allPosts = await getPosts({ includeHidden: true });
      return allPosts.filter((post) => sameId(getPostOwnerId(post), currentUserId));
    };

    const request = isGuideMode ? loadGuidePosts() : getMyWishlists();

    request
      .then((items) => {
        if (!alive) return;
        setPosts(items);
        if (!isGuideMode) syncLikedPostsFromWishlists(items);
      })
      .catch((error) => {
        console.error(isGuideMode ? "내 코스 조회 실패" : "찜한 코스 조회 실패", error);
        if (alive) setPosts([]);
      });

    return () => {
      alive = false;
    };
  }, [currentUserId, isGuideMode]);

  const visiblePosts = useMemo(
    () => [...posts].sort((a, b) => getPostTime(b) - getPostTime(a)),
    [posts]
  );

  const buildUpdatePayload = (post, updates) => ({
    ...post,
    ...updates,
    user_id: post.user_id ?? post.userId ?? currentUserId,
    city_name: updates.cityName ?? post.city_name ?? post.cityName,
    discount_rate: post.discount_rate ?? post.discountRate ?? 0,
    max_participants: post.max_participants ?? post.maxParticipants ?? 1,
    contentBlocks: post.contentBlocks ?? post.content_blocks ?? [],
    tags: post.tags ?? [],
    schedules: post.schedules ?? post.availableSchedules ?? [],
  });

  const handleDelete = async (post) => {
    const postId = getPostId(post);
    if (!postId || deletingId) return;

    const ok = window.confirm("이 코스를 삭제할까요?");
    if (!ok) return;

    setDeletingId(String(postId));
    try {
      await deletePost(postId);
      setPosts((items) => items.filter((item) => !sameId(getPostId(item), postId)));
    } catch (error) {
      console.error("코스 삭제 실패", error);
      alert(error.message || "코스 삭제에 실패했어요.");
    } finally {
      setDeletingId("");
    }
  };

  const handleEdit = async (post) => {
    const postId = getPostId(post);
    if (!postId || editingId) return;

    const nextTitle = window.prompt("제목", post.title ?? "");
    if (nextTitle === null) return;

    const nextDescription = window.prompt("한 줄 설명", post.subtitle ?? getPostDescription(post) ?? "");
    if (nextDescription === null) return;

    const nextPriceText = window.prompt("가격", String(post.price ?? "").replace(/,/g, ""));
    if (nextPriceText === null) return;

    const nextCityName = window.prompt("지역", post.cityName ?? post.city_name ?? "");
    if (nextCityName === null) return;

    const nextDuration = window.prompt("소요시간", post.duration ?? "");
    if (nextDuration === null) return;

    const nextPrice = Number(String(nextPriceText).replace(/,/g, ""));
    if (Number.isNaN(nextPrice)) {
      alert("가격은 숫자로 입력해주세요.");
      return;
    }

    setEditingId(String(postId));
    try {
      const updatedPost = await updatePost(
        postId,
        buildUpdatePayload(post, {
          title: nextTitle.trim(),
          subtitle: nextDescription.trim(),
          description: nextDescription.trim(),
          price: nextPrice,
          cityName: nextCityName.trim(),
          duration: nextDuration.trim(),
        })
      );

      setPosts((items) =>
        items.map((item) =>
          sameId(getPostId(item), postId)
            ? { ...item, ...(updatedPost && typeof updatedPost === "object" ? updatedPost : {}) }
            : item
        )
      );
    } catch (error) {
      console.error("코스 수정 실패", error);
      alert(error.message || "코스 수정에 실패했어요.");
    } finally {
      setEditingId("");
    }
  };

  const guideActions = [
    { label: editingId ? "수정 중" : "수정", icon: "edit", onClick: handleEdit },
    { label: deletingId ? "삭제 중" : "삭제", icon: "delete", onClick: handleDelete },
  ];

  return (
    <>
      <Header coment={isGuideMode ? "내 코스 보기" : "찜한 코스"} />
      <ListWrapper>
        {visiblePosts.length > 0 ? (
          visiblePosts.map((post, index) => (
            <PostCardList
              key={getPostId(post) ?? `${post.title ?? "post"}-${index}`}
              post={post}
              actions={isGuideMode ? guideActions : undefined}
              onWishlistChange={(postId, liked) => {
                if (liked || isGuideMode) return;
                setPosts((items) => items.filter((item) => !sameId(getPostId(item), postId)));
              }}
            />
          ))
        ) : (
          <EmptyText>{isGuideMode ? "등록한 코스가 없어요." : "찜한 코스가 없어요."}</EmptyText>
        )}
      </ListWrapper>
    </>
  );
}

const ListWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px 0 28px;
`;

const EmptyText = styled.p`
  margin-top: 80px;
  color: #acacac;
  font-family: Pretendard;
  font-size: 14px;
  font-weight: 500;
`;
