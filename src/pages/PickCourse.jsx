import { useEffect, useState } from "react";
import Header from "../components/Header";
import PostCardList from "../components/PostCardList";
import styled from "styled-components";
import { getMyWishlists } from "../api/tomorang";
import { syncLikedPostsFromWishlists } from "../utils/wishlist";

export default function PickCourse() {
  const [likedPosts, setLikedPosts] = useState([]);

  useEffect(() => {
    let alive = true;

    getMyWishlists()
      .then((wishlists) => {
        if (!alive) return;
        setLikedPosts(wishlists);
        syncLikedPostsFromWishlists(wishlists);
      })
      .catch((error) => {
        console.error("찜한 코스 조회 실패", error);
        if (alive) setLikedPosts([]);
      });

    return () => {
      alive = false;
    };
  }, []);

  return (
    <>
      <Header coment="찜한 코스" />
      <ListWrapper>
        {likedPosts.length > 0 ? (
          likedPosts.map((post) => (
            <PostCardList key={post.postId ?? post.post_id ?? post.id} post={post} />
          ))
        ) : (
          <EmptyText>찜한 코스가 없어요.</EmptyText>
        )}
      </ListWrapper>
    </>
  );
}

const ListWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px 0;
`;

const EmptyText = styled.p`
  margin-top: 80px;
  color: #acacac;
  font-family: Pretendard;
  font-size: 14px;
  font-weight: 500;
`;
