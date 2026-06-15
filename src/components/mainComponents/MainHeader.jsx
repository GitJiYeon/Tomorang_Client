import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import LogoText from "../../assets/logoText.svg";
import BellIcon from "../../assets/bellIcon.svg";
import SearchIcon from "../../assets/searchIcon.svg";
import { getUnreadNotificationCount } from "../../api/tomorang";

export default function MainHeader({ searchIcon = SearchIcon, searchAlt = "검색", onSearchClick }) {
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (!localStorage.getItem("accessToken") || !userId) return undefined;

    let alive = true;
    const loadUnreadCount = () => {
      getUnreadNotificationCount(userId)
        .then((count) => {
          if (alive) setUnreadCount(count);
        })
        .catch(() => {
          if (alive) setUnreadCount(0);
        });
    };

    loadUnreadCount();
    window.addEventListener("focus", loadUnreadCount);
    return () => {
      alive = false;
      window.removeEventListener("focus", loadUnreadCount);
    };
  }, []);

  return (
    <Wrapper>
      <img src={LogoText} alt="TOMORANG" style={{ width: 104, height: 15 }} />
      <Icons>
        {/* 2. onClick에 화살표 함수 사용 (즉시 실행 방지) */}
        <BellBtn onClick={() => navigate("/notifications") }>
          <img src={BellIcon} alt="알림" style={{ width: 14.5, height: 18 }} />
          {unreadCount > 0 && <UnreadDot aria-hidden="true" />}
        </BellBtn>
        <SearchBtn onClick={() => {
          if (onSearchClick) {
            onSearchClick();
          } else {
            navigate("/search");
          }
        }}>
          <img src={searchIcon} alt={searchAlt} style={{ width: 16, height: 16.62 }} />
        </SearchBtn>
      </Icons>
    </Wrapper>
  );
}

const Wrapper = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 17px 20px 10px 20px;
  background-color: #fff;
  position: sticky;
  top: 0;
  z-index: 100;
`;

const Icons = styled.div`
  display: flex;
  gap: 4px;
  align-items: center;
`;

const BellBtn = styled.button`
  width: 34.5px;
  height: 38px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
`;

const UnreadDot = styled.span`
  position: absolute;
  top: 8px;
  right: 8px;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #c5f598;
`;

const SearchBtn = styled.button`
  width: 32px;
  height: 32px;
  background: #c5f598;
  border: none;
  border-radius: 60px;
  cursor: pointer;
  padding: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
`;
