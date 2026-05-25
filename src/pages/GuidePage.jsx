import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import MainHeader from "../components/mainComponents/MainHeader";
import GuideBottomNav from "../components/mainComponents/GuideBottomNav";
import PostCard from "../components/mainComponents/PostCard";
import PlusIcon from "../assets/plusIcon.svg";
import GuideEmptyLogo from "../assets/guideEmptyLogo.svg";
import guideData from "../data/guideData.json";
import postData from "../data/postData.json";

export default function GuidePage() {
  const navigate = useNavigate();
  
  const currentUserKey = localStorage.getItem("userId") || "1";
  const currentGuide =
    guideData.find((guide) => String(guide.id) === String(currentUserKey)) ||
    guideData.find((guide) => guide.username === currentUserKey) ||
    guideData[0];

  const myPosts = postData.filter((post) => currentGuide.postIds.includes(post.postId));
  const hasContent = myPosts.length > 0;

  return (
    <PageWrapper>
      <MainHeader
        searchIcon={PlusIcon}
        searchAlt="가이드 만들기"
        onSearchClick={() => {
          navigate("/guide-registration");
        }}
      />
      
      {hasContent ? (
        <ContentArea>
          <GuideCardList>
            {myPosts.map((post) => (
              <GuideCardWrapper key={post.postId}>
                <PostCard
                  post={post}
                  showHeart={false}
                  showStats={true}
                  fullWidth={true}
                />
              </GuideCardWrapper>
            ))}
          </GuideCardList>
        </ContentArea>
      ) : (
        <EmptyArea>
          <EmptyLogo src={GuideEmptyLogo} alt="가이드가 비어 있습니다" />
        </EmptyArea>
      )}
      
      <GuideBottomNav activeIndex={0} />
    </PageWrapper>
  );
}

const PageWrapper = styled.div`
  font-family: 'Noto Sans KR', 'Apple SD Gothic Neo', sans-serif;
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

const EmptyArea = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 30px 20px calc(100px + env(safe-area-inset-bottom));
  background-color: #fff;
`;

const EmptyLogo = styled.img`
  width: 100%;
  max-width: 280px;
  object-fit: contain;
`;

