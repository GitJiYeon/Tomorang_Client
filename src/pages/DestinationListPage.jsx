import { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { useLocation } from "react-router-dom";
import Header from "../components/Header";
import FilterBar from "../components/FilterBar";
import PostCardList from "../components/PostCardList";
import { getPosts } from "../api/tomorang";
import { getPostRatingAverage, getPostWishlistCount } from "../utils/postStats";

export default function DestinationListPage() {
  const { state } = useLocation();
  const lang = "ko";
  const [posts, setPosts] = useState([]);
  const [filter, setFilter] = useState({
    sort: "추천순",
    category: "",
  });

  const cityName = state?.cityName?.[lang]?.cityName ?? "여행지";
  const tags = state?.tags?.[lang] ?? [];
  const image = state?.image ?? "";

  useEffect(() => {
    let alive = true;

    getPosts(cityName === "여행지" ? {} : { city: cityName })
      .then((items) => {
        if (alive) setPosts(items);
      })
      .catch((error) => {
        console.error("여행지 코스 조회 실패", error);
        if (alive) setPosts([]);
      });

    return () => {
      alive = false;
    };
  }, [cityName]);

  const filteredPosts = useMemo(() => {
    const filtered = filter.category
      ? posts.filter((post) =>
          post.tags?.some((tag) => String(tag?.name ?? tag?.value ?? tag).includes(filter.category)) ||
          post.tag?.ko?.includes(filter.category) ||
          post.title?.includes(filter.category)
        )
      : posts;

    return [...filtered].sort((a, b) => {
      if (filter.sort === "인기순") {
        return getPostWishlistCount(b) - getPostWishlistCount(a);
      }

      if (filter.sort === "가격순") {
        const priceA = Number(String(a.price ?? 0).replace(/,/g, ""));
        const priceB = Number(String(b.price ?? 0).replace(/,/g, ""));
        return priceA - priceB;
      }

      return getPostRatingAverage(b) - getPostRatingAverage(a);
    });
  }, [filter, posts]);

  return (
    <PageWrapper>
      <Header coment={cityName} />

      {image && (
        <ImageSection>
          <MainImage src={image} alt={cityName} />
          <Gradient />
          <ImageText>
            <TagRow>
              {tags.map((tag) => (
                <Tag key={tag}>#{tag}</Tag>
              ))}
            </TagRow>
            <Question>탐나는 여행을 골라보세요</Question>
          </ImageText>
        </ImageSection>
      )}

      <FilterBar onFilterChange={setFilter} />

      <ListSection>
        {filteredPosts.length > 0 ? (
          filteredPosts.map((post) => (
            <PostCardList key={post.postId ?? post.post_id ?? post.id} post={post} />
          ))
        ) : (
          <EmptyText>표시할 코스가 없습니다.</EmptyText>
        )}
      </ListSection>
    </PageWrapper>
  );
}

const PageWrapper = styled.div`
  width: min(var(--app-page-width), 100vw);
  margin: 0 auto;
  min-height: 100vh;
  background-color: #fff;
  display: flex;
  flex-direction: column;
`;

const ImageSection = styled.div`
  position: relative;
  width: 100%;
  height: 350px;
  overflow: hidden;
`;

const MainImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const Gradient = styled.div`
  position: absolute;
  inset: 0;
  background: linear-gradient(
    180deg,
    rgba(0, 0, 0, 0) 50%,
    rgba(0, 0, 0, 0.7) 100%
  );
`;

const ImageText = styled.div`
  position: absolute;
  bottom: 20px;
  left: 20px;
  color: white;
  z-index: 2;
`;

const TagRow = styled.div`
  display: flex;
  gap: 6px;
  margin-bottom: 8px;
  flex-wrap: wrap;
`;

const Tag = styled.div`
  font-size: 14px;
  opacity: 0.9;
`;

const Question = styled.div`
  font-size: 20px;
  font-weight: bold;
  line-height: 1.3;
`;

const ListSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 20px 16px;
  align-items: center;
  flex: 1;
`;

const EmptyText = styled.div`
  padding: 60px 0;
  color: #999;
  font-size: 14px;
`;
