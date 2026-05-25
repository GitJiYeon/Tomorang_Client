/**
 * SearchResultPage - 검색 결과 페이지
 *
 * 라우터:
 * <Route path="/search-result" element={<SearchResultPage />} />
 *
 * 이동:
 * navigate("/search-result", { state: { keyword } })
 */

import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import styled from "styled-components";
import postData from "../data/postData.json";
import FilterBar from "../components/FilterBar";
import PostCardList from "../components/PostCardList";
import SearchIcon from "../assets/searchIcon2.svg";
import BackArrow from "../assets/backarrow.svg";
import XCircleIcon from "../assets/bookStatusIcons/xIcon.svg"; // 검색어 지우기 아이콘

export default function SearchResultPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const initialKeyword = location.state?.keyword || "";

  const [inputVal, setInputVal] = useState(initialKeyword);
  const [query, setQuery] = useState(initialKeyword);
  const [filter, setFilter] = useState({ sort: "추천순", category: "애니메이션" });

  const handleSearch = () => {
    if (!inputVal.trim()) return;
    setQuery(inputVal.trim());
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
  };

  // 검색어 필터링
  const filtered = postData.filter((p) => {
    if (!query) return true;
    return (
      p.title.includes(query) ||
      p.subtitle.includes(query) ||
      p.city.name.includes(query) ||
      p.tag?.ko?.some((t) => t.includes(query))
    );
  });

  // 태그 필터링
  const tagFiltered = filter.category
    ? filtered.filter((p) =>
        p.tag?.ko?.includes(filter.category) ||
        p.title.includes(filter.category)
      )
    : filtered;

  // 정렬
  const sorted = [...tagFiltered].sort((a, b) => {
    if (filter.sort === "인기순") return b.likeCount - a.likeCount;
    if (filter.sort === "가격순") {
      const priceA = parseInt(a.price.replace(/,/g, ""), 10);
      const priceB = parseInt(b.price.replace(/,/g, ""), 10);
      return priceA - priceB;
    }
    return b.rating - a.rating; // 추천순
  });

  return (
    <Wrapper>
      {/* 검색바 */}
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
            onChange={(e) => setInputVal(e.target.value)}
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

      {/* 필터바 */}
      <FilterBar onFilterChange={handleFilterChange} />

      {/* 결과 목록 */}
      <ResultList>
        {sorted.length === 0 ? (
          <Empty>검색 결과가 없습니다</Empty>
        ) : (
          sorted.map((post) => (
            <PostCardList key={post.postId} post={post} />
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