import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import HomeIcon from "../../assets/navIcons/home.svg";
import BookIcon from "../../assets/navIcons/book.svg";
import MessageIcon from "../../assets/navIcons/message.svg";
import MyPageIcon from "../../assets/navIcons/mypage.svg";

const NAV_ITEMS = [
  { path: "/guide", iconSrc: HomeIcon, label: "홈" },
  { path: "/guide-reservations", iconSrc: BookIcon, label: "예약" },
  { path: "/guide-chat", iconSrc: MessageIcon, label: "메시지" },
  { path: "/guide-mypage", iconSrc: MyPageIcon, label: "마이" },
];

export default function GuideBottomNav({ activeIndex = 0 }) {
  const navigate = useNavigate();
  const resetViewportScroll = () => {
    document
      .querySelector(".app-viewport")
      ?.scrollTo({ top: 0, left: 0, behavior: "auto" });
  };

  return (
    <NavPosition>
      <NavBar>
        {NAV_ITEMS.map((item, index) => {
          const isActive = activeIndex === index;

          return (
            <NavButton
              key={item.path}
              type="button"
              $active={isActive}
              onClick={() => {
                resetViewportScroll();
                navigate(item.path);
              }}
            >
              <NavIcon src={item.iconSrc} alt={item.label} $active={isActive} />
              {isActive && <NavLabel>{item.label}</NavLabel>}
            </NavButton>
          );
        })}
      </NavBar>
    </NavPosition>
  );
}

const NavPosition = styled.div`
  position: fixed;
  right: 0;
  bottom: 16px;
  left: 0;
  width: min(390px, 100vw);
  max-width: 100vw;
  margin: 0 auto;
  display: flex;
  justify-content: center;
  z-index: 1000;
  pointer-events: none;
`;

const NavBar = styled.nav`
  width: 350px;
  height: 68px;
  padding: 0 10px;
  border-radius: 70px;
  background: #222;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.25);
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: space-between;
  pointer-events: auto;
`;

const NavButton = styled.button`
  width: 78px;
  height: 52px;
  border: none;
  border-radius: 70px;
  background: ${({ $active }) => ($active ? "#c5f598" : "transparent")};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  flex-shrink: 0;
  padding: 0;
  outline: none;
  cursor: pointer;
`;

const NavIcon = styled.img`
  width: 24px;
  height: 24px;
  filter: ${({ $active }) => ($active ? "brightness(0)" : "brightness(0) invert(1)")};
`;

const NavLabel = styled.span`
  color: #111;
  font-family: Pretendard, sans-serif;
  font-size: 14px;
  font-weight: 500;
  line-height: 20px;
  white-space: nowrap;
  overflow: hidden;
`;
