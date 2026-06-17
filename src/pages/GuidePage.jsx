import { useCallback, useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import MainHeader from "../components/mainComponents/MainHeader";
import GuideBottomNav from "../components/mainComponents/GuideBottomNav";
import PostCard from "../components/mainComponents/PostCard";
import PlusIcon from "../assets/plusIcon.svg";
import GuideEmptyLogo from "../assets/guideEmptyLogo.svg";
import { getPostDetail, getPosts } from "../api/tomorang";
import { getPostOwnerId } from "../utils/postOwner";
import { useI18n } from "../i18n/I18nProvider";

const getPostId = (post) => post?.postId ?? post?.post_id ?? post?.id;

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

export default function GuidePage() {
  const navigate = useNavigate();
  const { t } = useI18n();
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
  const [myPosts, setMyPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(!!currentUserId);
  const [errorMessage, setErrorMessage] = useState(
    currentUserId ? "" : t("로그인 후 내 코스를 확인할 수 있어요.")
  );

  const loadMyPosts = useCallback(async () => {
    const directPosts = await getPosts({ userId: currentUserId, includeHidden: true });
    const posts =
      directPosts.length > 0
        ? directPosts
        : (await getPosts({ includeHidden: true })).filter((post) =>
            sameId(getPostOwnerId(post), currentUserId)
          );

    const hydratedPosts = await Promise.all(
      posts.map(async (post) => {
        const postId = getPostId(post);
        if (!postId) return post;

        try {
          const detail = await getPostDetail(postId, { includeHidden: true });
          return { ...post, ...detail };
        } catch {
          return post;
        }
      })
    );

    return hydratedPosts;
  }, [currentUserId]);

  useEffect(() => {
    if (!currentUserId) return;

    let ignore = false;

    setIsLoading(true);
    setErrorMessage("");

    loadMyPosts()
      .then((posts) => {
        if (ignore) return;
        const sortedPosts = [...posts].sort((a, b) => getPostTime(b) - getPostTime(a));
        setMyPosts(sortedPosts);
      })
      .catch((error) => {
        if (ignore) return;
        console.error("[Tomorang] 가이드 메인 게시물 조회 실패:", error);
        setErrorMessage(error.message || t("내 코스를 불러오지 못했습니다."));
        setMyPosts([]);
      })
      .finally(() => {
        if (!ignore) setIsLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [currentUserId, loadMyPosts]);

  useEffect(() => {
    if (!currentUserId) return undefined;

    let ignore = false;
    const refreshMyPosts = () => {
      loadMyPosts()
        .then((posts) => {
          if (ignore) return;
          setMyPosts([...posts].sort((a, b) => getPostTime(b) - getPostTime(a)));
        })
        .catch((error) => console.error("[Tomorang] 가이드 게시물 새로고침 실패:", error));
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") refreshMyPosts();
    };

    window.addEventListener("focus", refreshMyPosts);
    window.addEventListener("pageshow", refreshMyPosts);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      ignore = true;
      window.removeEventListener("focus", refreshMyPosts);
      window.removeEventListener("pageshow", refreshMyPosts);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [currentUserId, loadMyPosts]);

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
          <StateText>{t("내 코스를 불러오는 중...")}</StateText>
        </StateArea>
      ) : hasContent ? (
        <ContentArea>
          <GuideCardList>
            {myPosts.map((post, index) => (
              <GuideCardWrapper
                key={getPostId(post) ?? `${post.title}-${index}`}
                onClick={() => navigate("/course", { state: { post } })}
              >
                <PostCard post={post} showHeart={false} showStats fullWidth />
              </GuideCardWrapper>
            ))}
          </GuideCardList>
        </ContentArea>
      ) : (
        <EmptyArea>
          <EmptyLogo src={GuideEmptyLogo} alt={t("등록한 코스가 없습니다")} />
          {errorMessage && <StateText>{errorMessage}</StateText>}
        </EmptyArea>
      )}

      <GuideBottomNav activeIndex={0} />
    </PageWrapper>
  );
}

const PageWrapper = styled.div`
  font-family: "Noto Sans KR", "Apple SD Gothic Neo", sans-serif;
  width: min(var(--app-page-width), 100vw);
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
  padding: 12px;
  padding-bottom: var(--app-bottom-nav-reserved-space);
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
  padding: 30px 20px var(--app-bottom-nav-reserved-space);
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
