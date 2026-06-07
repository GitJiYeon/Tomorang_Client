import { useEffect, useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import MainHeader from "../components/mainComponents/MainHeader";
import GuideBottomNav from "../components/mainComponents/GuideBottomNav";
import PostCard from "../components/mainComponents/PostCard";
import PlusIcon from "../assets/plusIcon.svg";
import GuideEmptyLogo from "../assets/guideEmptyLogo.svg";
import { getPosts } from "../api/tomorang";

export default function GuidePage() {
  const navigate = useNavigate();
  const currentUserId = localStorage.getItem("userId");
  const [myPosts, setMyPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(!!currentUserId);
  const [errorMessage, setErrorMessage] = useState(
    currentUserId ? "" : "로그인 후 내 코스를 확인할 수 있어요."
  );

  useEffect(() => {
    if (!currentUserId) return;

    let ignore = false;

    getPosts({ userId: currentUserId })
      .then((posts) => {
        if (ignore) return;
        console.log("[Tomorang] 가이드 메인 내 게시물 목록:", posts);
        setMyPosts(posts);
      })
      .catch((error) => {
        if (ignore) return;
        console.error("[Tomorang] 가이드 메인 게시물 조회 실패:", error);
        setErrorMessage(error.message || "내 코스를 불러오지 못했습니다.");
        setMyPosts([]);
      })
      .finally(() => {
        if (!ignore) setIsLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [currentUserId]);

  const hasContent = myPosts.length > 0;

  return (
    <PageWrapper>
      <MainHeader
        searchIcon={PlusIcon}
        searchAlt="코스 등록"
        onSearchClick={() => navigate("/guide-registration")}
      />

      {isLoading ? (
        <StateArea>
          <StateText>내 코스를 불러오는 중...</StateText>
        </StateArea>
      ) : hasContent ? (
        <ContentArea>
          <GuideCardList>
            {myPosts.map((post, index) => (
              <GuideCardWrapper
                key={post.postId ?? post.post_id ?? `${post.title}-${index}`}
                onClick={() => navigate("/course", { state: { post } })}
              >
                <PostCard post={post} showHeart={false} showStats fullWidth />
              </GuideCardWrapper>
            ))}
          </GuideCardList>
        </ContentArea>
      ) : (
        <EmptyArea>
          <EmptyLogo src={GuideEmptyLogo} alt="등록한 코스가 없습니다" />
          {errorMessage && <StateText>{errorMessage}</StateText>}
        </EmptyArea>
      )}

      <GuideBottomNav activeIndex={0} />
    </PageWrapper>
  );
}

const PageWrapper = styled.div`
  font-family: "Noto Sans KR", "Apple SD Gothic Neo", sans-serif;
  width: min(390px, 100vw);
  height: 100dvh;
  max-height: 100dvh;
  margin: 0 auto;
  background-color: #fff;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  position: relative;
`;

const ContentArea = styled.div`
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 12px 12px;
  padding-bottom: calc(100px + env(safe-area-inset-bottom));
  display: flex;
  flex-direction: column;
  gap: 12px;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const GuideCardList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const GuideCardWrapper = styled.div`
  width: 100%;

  > div {
    width: 100%;
  }
`;

const StateArea = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 30px 20px calc(100px + env(safe-area-inset-bottom));
  background-color: #fff;
`;

const EmptyArea = styled(StateArea)`
  flex-direction: column;
  gap: 14px;
`;

const EmptyLogo = styled.img`
  width: 100%;
  max-width: 280px;
  object-fit: contain;
`;

const StateText = styled.p`
  margin: 0;
  color: #acacac;
  font-size: 13px;
  text-align: center;
`;
