import { useState } from "react";
import Header from "../components/Header";
import PostCardList from "../components/PostCardList";
import postdata from "../data/postData.json";
import styled from "styled-components";

export default function PickCourse() {
  // ✅ localStorage에서 찜한 postId 목록 읽어서 필터링
  const [likedIds] = useState(() =>
    JSON.parse(localStorage.getItem("likedPosts") ?? "[]")
  );

  const likedPosts = postdata.filter((post) => likedIds.includes(post.postId));

  return (
    <>
      <Header coment={"찜한 코스"} />
      <ListWrapper>
        {likedPosts.length > 0 ? (
          likedPosts.map((post) => (
            <PostCardList key={post.postId} post={post} />
          ))
        ) : (
          <EmptyText>찜한 코스가 없어요</EmptyText>
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