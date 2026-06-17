import HomeIcon from "../../assets/navIcons/home.svg";
import MapIcon from "../../assets/navIcons/map.svg";
import BookIcon from "../../assets/navIcons/book.svg";
import MessageIcon from "../../assets/navIcons/message.svg";
import MyPageIcon from "../../assets/navIcons/mypage.svg";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { useI18n } from "../../i18n/I18nProvider";

const NAV_ITEMS = [
  { path: "/main", iconSrc: HomeIcon, labelKey: "홈" },
  { path: "/map", iconSrc: MapIcon, labelKey: "탐색" },
  { path: "/book", iconSrc: BookIcon, labelKey: "예약" },
  { path: "/chats", iconSrc: MessageIcon, labelKey: "메시지" },
  { path: "/profile", iconSrc: MyPageIcon, labelKey: "마이페이지" },
];

export default function BottomNav({ activeIndex = 0, onNavChange }) {
  const navigate = useNavigate();
  const { t } = useI18n();
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
              key={index}
              type="button"
              $active={isActive}
              onClick={() => {
                onNavChange?.(index);
                resetViewportScroll();
                navigate(item.path);
              }}
            >
              <NavIcon
                src={item.iconSrc}
                alt={t(item.labelKey)}
                $active={isActive}
              />
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
  bottom: var(--app-bottom-nav-bottom);
  left: 0;
  width: min(var(--app-page-width), 100vw);
  max-width: 100vw;
  margin: 0 auto;
  display: flex;
  justify-content: center;
  z-index: 1000;
  pointer-events: none;
`;

const NavBar = styled.nav`
  width: var(--app-bottom-nav-width);
  height: var(--app-bottom-nav-height);
  background: #222;
  border-radius: 70px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 8px;
  pointer-events: auto;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.25);
`;

const NavButton = styled.button`
  flex: 1;
  height: 52px;
  border-radius: 70px;
  background: ${({ $active }) => ($active ? "#c5f598" : "transparent")};
  border: none;
  color: ${({ $active }) => ($active ? "#111" : "#fff")};
  -webkit-text-fill-color: ${({ $active }) => ($active ? "#111" : "#fff")};
  appearance: none;
  -webkit-appearance: none;
  -webkit-tap-highlight-color: transparent;
  outline: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  padding: 0;
  text-decoration: none;
  touch-action: manipulation;
  user-select: none;
  -webkit-user-select: none;

  &:hover,
  &:focus,
  &:focus-visible,
  &:active {
    outline: none;
    color: ${({ $active }) => ($active ? "#111" : "#fff")};
    -webkit-text-fill-color: ${({ $active }) => ($active ? "#111" : "#fff")};
    background: ${({ $active }) => ($active ? "#c5f598" : "transparent")};
  }

  & * {
    color: inherit;
    -webkit-text-fill-color: currentColor;
  }
`;

const NavIcon = styled.img`
  width: 24px;
  height: 24px;
  filter: ${({ $active }) => ($active ? "brightness(0)" : "brightness(0) invert(1)")};
  pointer-events: none;
`;
