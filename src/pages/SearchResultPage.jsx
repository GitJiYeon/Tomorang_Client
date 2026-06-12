import { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import styled from "styled-components";
import FilterBar from "../components/FilterBar";
import PostCardList from "../components/PostCardList";
import SearchIcon from "../assets/searchIcon2.svg";
import BackArrow from "../assets/backarrow.svg";
import XCircleIcon from "../assets/bookStatusIcons/xIcon.svg";
import { getPosts } from "../api/tomorang";
import { getPostRatingAverage, getPostWishlistCount } from "../utils/postStats";

export default function SearchResultPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const initialKeyword = location.state?.keyword || "";
  const initialCategory = location.state?.category || "";

  const [inputVal, setInputVal] = useState(initialKeyword);
  const [query, setQuery] = useState(initialKeyword);
  const [posts, setPosts] = useState([]);
  const [filter, setFilter] = useState({ sort: "추천순", category: initialCategory });

  useEffect(() => {
    setInputVal(initialKeyword);
    setQuery(initialKeyword);
    setFilter((prev) => ({ ...prev, category: initialCategory }));
  }, [initialCategory, initialKeyword]);

  useEffect(() => {
    let alive = true;

    getPosts(query ? { keyword: query } : {})
      .then((items) => {
        if (alive) setPosts(items);
      })
      .catch((error) => {
        console.error("검색 결과 조회 실패", error);
        if (alive) setPosts([]);
      });

    return () => {
      alive = false;
    };
  }, [query]);

  const handleSearch = () => {
    setQuery(inputVal.trim());
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") handleSearch();
  };

  const sorted = useMemo(() => {
    const getPostCategoryText = (post) => {
      const values = [
        post.category,
        post.categoryName,
        post.category_name,
        post.tag?.ko,
        post.title,
      ];

      if (Array.isArray(post.categories)) values.push(...post.categories);
      if (Array.isArray(post.tags)) {
        values.push(...post.tags.map((tag) => tag?.name ?? tag?.value ?? tag));
      }

      return values
        .filter(Boolean)
        .flatMap((value) => String(value).split(","))
        .map((value) => value.trim())
        .join(" ");
    };

    const tagFiltered = filter.category
      ? posts.filter((post) =>
          getPostCategoryText(post).includes(filter.category)
        )
      : posts;

    return [...tagFiltered].sort((a, b) => {
      if (filter.sort === "인기순") return getPostWishlistCount(b) - getPostWishlistCount(a);
      if (filter.sort === "가격순") {
        const priceA = Number(String(a.price ?? 0).replace(/,/g, ""));
        const priceB = Number(String(b.price ?? 0).replace(/,/g, ""));
        return priceA - priceB;
      }
      return getPostRatingAverage(b) - getPostRatingAverage(a);
    });
  }, [filter, posts]);

  return (
    <Wrapper>
      <SearchBarRow>
        <BackBtn onClick={() => navigate(-1)}>
          <img src={BackArrow} alt="뒤로가기" width={24} height={24} />
        </BackBtn>
        <SearchBar>
          <SearchIconBtn onClick={handleSearch}>
            <img src={SearchIcon} alt="search" width={28} height={28} />
          </SearchIconBtn>
          <SearchInput
            value={inputVal}
            onChange={(event) => setInputVal(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="검색어를 입력하세요"
            autoFocus
          />
          {inputVal.length > 0 && (
            <ClearBtn onClick={() => { setInputVal(""); setQuery(""); }}>
              <img src={XCircleIcon} alt="clear" width={18} height={18} />
            </ClearBtn>
          )}
        </SearchBar>
      </SearchBarRow>

      <FilterBar onFilterChange={setFilter} defaultCategory={initialCategory} />

      <ResultList>
        {sorted.length === 0 ? (
          <Empty>검색 결과가 없습니다</Empty>
        ) : (
          sorted.map((post) => (
            <PostCardList key={post.postId ?? post.post_id ?? post.id} post={post} />
          ))
        )}
      </ResultList>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  min-height: 100vh;
  max-width: 390px;
  margin: 0 auto;
  background: #fff;
  font-family: "Pretendard", sans-serif;
  padding-bottom: 40px;
`;

const SearchBarRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 16px 21px;
`;

const BackBtn = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const SearchBar = styled.div`
  flex: 1;
  height: 40px;
  background: #F3F4F3;
  border-radius: 20px;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 0 10px;
`;

const SearchIconBtn = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  flex-shrink: 0;
`;

const SearchInput = styled.input`
  border: none;
  background: none;
  outline: none;
  font-family: "Pretendard", sans-serif;
  font-size: 14px;
  color: #111;
  width: 100%;
  &::placeholder { color: #ACACAC; }
`;

const ClearBtn = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  flex-shrink: 0;
`;

const ResultList = styled.div`
  padding: 16px 21px 0;
`;

const Empty = styled.div`
  text-align: center;
  color: #ACACAC;
  font-size: 14px;
  padding: 60px 0;
`;
