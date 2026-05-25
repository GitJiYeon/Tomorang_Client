import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import regionData from "../data/regionData.json";
import RegionCard from "../components/mainComponents/RegionCard";
import ChevronIcon from "../assets/detailIcon.svg";
import SearchIcon from "../assets/searchIcon2.svg";
import BackArrow from "../assets/backarrow.svg";

const TRENDING = [
  { rank: 1, keyword: "맛집투어" },
  { rank: 2, keyword: "소도시" },
  { rank: 3, keyword: "가성비" },
  { rank: 4, keyword: "야경" },
  { rank: 5, keyword: "온천" },
];

const HISTORY_KEY = "searchHistory";

function getHistory() {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
  } catch {
    return [];
  }
}

function addHistory(keyword) {
  const prev = getHistory().filter((k) => k !== keyword);
  localStorage.setItem(HISTORY_KEY, JSON.stringify([keyword, ...prev].slice(0, 10)));
}

function clearHistory() {
  localStorage.removeItem(HISTORY_KEY);
}

export default function SearchPage() {
  const navigate = useNavigate();
  const [history, setHistory] = useState(getHistory);
  const [expanded, setExpanded] = useState(false);
  const [inputVal, setInputVal] = useState("");
  const previewRegions = regionData.slice(0, 4);

  const visibleTrending = expanded ? TRENDING : TRENDING.slice(0, 3);

  const handleSearch = (keyword) => {
    const kw = keyword ?? inputVal;
    if (!kw.trim()) return;
    addHistory(kw.trim());
    setHistory(getHistory());
    navigate("/search-result", { state: { keyword: kw.trim() } });
  };

  const handleClear = () => {
    clearHistory();
    setHistory([]);
  };

  return (
    <Wrapper>
      {/* 상단 검색바 */}
      <SearchBarRow>
        <BackBtn onClick={() => navigate(-1)}>
          <img src={BackArrow} alt="뒤로가기" width={24} height={24} />
        </BackBtn>
        <SearchBar>
          <SearchIconBtn onClick={() => handleSearch()}>
            <img src={SearchIcon} alt="search" width={28} height={28} />
          </SearchIconBtn>
          <SearchInput
            placeholder="미식의 구마모토로..."
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            autoFocus
          />
        </SearchBar>
      </SearchBarRow>

      {/* 내가 검색한 */}
      {history.length > 0 && (
        <Section>
          <SectionHeader>
            <SectionTitle>내가 검색한</SectionTitle>
            <ClearBtn onClick={handleClear}>지우기</ClearBtn>
          </SectionHeader>
          <HistoryRow>
            {history.map((keyword) => (
              <HistoryChip key={keyword} onClick={() => handleSearch(keyword)}>
                {keyword}
              </HistoryChip>
            ))}
          </HistoryRow>
        </Section>
      )}

      {/* 지금 가장 인기있는 */}
      <Section>
        <SectionTitle>지금 가장 인기있는</SectionTitle>
        <TrendingWrapper>
          <TrendingList>
            {visibleTrending.map(({ rank, keyword }, idx) => (
              <TrendingItem
                key={rank}
                onClick={() => handleSearch(keyword)}
                $faded={!expanded && idx === 2}
              >
                <Rank>{rank}</Rank>
                <TrendingKeyword>{keyword}</TrendingKeyword>
              </TrendingItem>
            ))}
          </TrendingList>

          {/* 3번째 항목 아래 페이드 + 토글 버튼 */}
          {!expanded && (
            <FadeOverlay onClick={() => setExpanded(true)}>
              <ToggleBtn>
                <img src={ChevronIcon} alt="펼치기" width={14} height={14} />
              </ToggleBtn>
            </FadeOverlay>
          )}
          {expanded && (
            <CollapseBtn onClick={() => setExpanded(false)}>
              <img src={ChevronIcon} alt="접기" width={14} height={14} style={{ transform: "rotate(180deg)" }} />
            </CollapseBtn>
          )}
        </TrendingWrapper>
      </Section>

      {/* 여행지 카드 그리드 */}
      <Section>
        <Grid>
          {previewRegions.map((region) => (
            <RegionCard key={region.regionId} region={region} lang="ko" />
          ))}
        </Grid>
      </Section>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  min-height: 100vh;
  width: 100%;
  max-width: 390px;
  margin: 0 auto;
  background: #fff;
  font-family: "Pretendard", sans-serif;
  padding: 0 0 40px;
  box-sizing: border-box;
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
  gap: 1px;
  padding: 0 5px;
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

const Section = styled.div`
  padding: 12px 21px;
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`;

const SectionTitle = styled.div`
  font-weight: 500;
  font-size: 14px;
  line-height: 22px;
  letter-spacing: -0.7px;
  color: #ACACAC;
  margin-bottom: 12px;
`;

const ClearBtn = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  font-family: "Pretendard", sans-serif;
  font-weight: 500;
  font-size: 12px;
  line-height: 22px;
  letter-spacing: -0.7px;
  color: #4E4E4E;
  padding: 0;
  margin-bottom: 12px;
`;

const HistoryRow = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

const HistoryChip = styled.button`
  height: 42px;
  border-radius: 60px;
  padding: 10px 14px;
  background: #EDFCDF;
  border: none;
  cursor: pointer;
  font-family: "Pretendard", sans-serif;
  font-weight: 500;
  font-size: 14px;
  line-height: 22px;
  letter-spacing: -0.7px;
  color: #111;
  white-space: nowrap;
`;

const TrendingWrapper = styled.div`
  position: relative;
`;

const TrendingList = styled.div`
  display: flex;
  flex-direction: column;
`;

const TrendingItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 0;
  cursor: pointer;
  opacity: ${({ $faded }) => ($faded ? 0.35 : 1)};
  transition: opacity 0.2s;
`;

const Rank = styled.span`
  font-weight: 600;
  font-size: 17.22px;
  line-height: 100%;
  letter-spacing: 2%;
  color: #B1DD89;
  width: 16px;
  text-align: center;
`;

const TrendingKeyword = styled.span`
  font-weight: 500;
  font-size: 14px;
  line-height: 100%;
  letter-spacing: 2%;
  color: #111;
`;

const FadeOverlay = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 60px;
  background: linear-gradient(to bottom, transparent, #fff);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding-bottom: 4px;
  cursor: pointer;
`;

const ToggleBtn = styled.div`
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const CollapseBtn = styled.div`
  display: flex;
  justify-content: center;
  padding: 4px 0;
  cursor: pointer;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px 16px;

  & > * {
    width: 100% !important;
  }
`;