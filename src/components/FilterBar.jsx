// 호출방법: <FilterBar onFilterChange={handleFilterChange} />

import { useEffect, useState, useRef } from "react";
import styled from "styled-components";
import DownArrowIcon from "../assets/downarrow.svg"; 

const SORT_OPTIONS = ["추천순", "인기순", "가격순"];
export const FILTER_TAGS = ["체험", "힐링", "풍경", "액티비티", "애니메이션", "쇼핑", "맛집", "탐방", "사진"];

export default function FilterBar({ onFilterChange, defaultCategory = "애니메이션" }) {
  const [sortOpen, setSortOpen] = useState(false);
  const [selectedSort, setSelectedSort] = useState("추천순");
  const [selectedTag, setSelectedTag] = useState(defaultCategory);
  const scrollRef = useRef(null);

  useEffect(() => {
    setSelectedTag(defaultCategory);
  }, [defaultCategory]);

  const handleTagSelect = (tag) => {
    setSelectedTag(tag);

    onFilterChange({
      sort: selectedSort,
      category: tag,
    });
  };

  const handleSortSelect = (option) => {
    setSelectedSort(option);
    setSortOpen(false);

    onFilterChange({
      sort: option,
      category: selectedTag,
    });
  };

  return (
    <Wrapper>
      <DropdownWrapper>
        <DropdownTrigger onClick={() => setSortOpen(!sortOpen)}>
          {selectedSort}
          <Arrow open={sortOpen} src={DownArrowIcon} alt="arrow" />
        </DropdownTrigger>
        
        {sortOpen && (
          <DropdownMenu>
            {SORT_OPTIONS.map((option) => (
              <DropdownItem
                key={option}
                selected={option === selectedSort}
                onClick={() => handleSortSelect(option)}
              >
                {option}
              </DropdownItem>
            ))}
          </DropdownMenu>
        )}
      </DropdownWrapper>

      <TagScroll ref={scrollRef}>
        {FILTER_TAGS.map((tag) => (
          <TagChip
            key={tag}
            selected={tag === selectedTag}
            onClick={() => handleTagSelect(tag)}
          >
            {tag}
          </TagChip>
        ))}
      </TagScroll>
    </Wrapper>
  );
}


const Wrapper = styled.div`
  display: flex;
  align-items: center;
  width: var(--app-page-width);
  padding-top: 16px;
  padding-left: 21px;
  padding-bottom: 5px;
  box-sizing: border-box;
  gap: 8px;
  font-family: "Pretendard", sans-serif;
  overflow: visible;
  position: relative;
`;

const DropdownWrapper = styled.div`
  position: relative;
  flex-shrink: 0;
`;

const DropdownTrigger = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 87px;
  height: 42px;
  padding: 0 14px;
  border-radius: 60px;
  border: none;
  background: #111111; 
  color: #ffffff;
  font-size: 14px;
  cursor: pointer;

  &:focus {
    outline: none;
  }
`;

const Arrow = styled.img`
  width: 10px;
  transition: transform 0.2s;
  transform: ${({ open }) => (open ? "rotate(180deg)" : "rotate(0deg)")};
  filter: brightness(0) invert(1); 
`;

const DropdownMenu = styled.div`
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  background: #fff;
  border: 1px solid #dadada;
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  z-index: 100;
  min-width: 100px;
`;

const DropdownItem = styled.div`
  padding: 12px 16px;
  font-size: 13px;
  font-weight: ${({ selected }) => (selected ? "600" : "400")};
  background: ${({ selected }) => (selected ? "#f5fdf0" : "#fff")};
  cursor: pointer;

  &:hover {
    background: #f8f8f8;
  }
`;

const TagScroll = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  overflow-x: auto;
  flex: 1;
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }
`;

const TagChip = styled.button`
  flex-shrink: 0;
  height: 42px;
  padding: 10px 14px;
  border-radius: 60px;
  border: ${({ selected }) => (selected ? "none" : "1px solid #dadada")};
  background: ${({ selected }) => (selected ? "#C5F598" : "#ffffff")};
  font-size: 14px;
  font-weight: 500;
  font-family: Pretendard;
  line-height: 22px;
  cursor: pointer;

  /* order: -1 속성을 삭제하여 순서가 바뀌지 않도록 설정했습니다. */
  transition: all 0.2s ease;

  &:focus {
    outline: none;
  }
`;
