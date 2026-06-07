import HomeIcon from "../../assets/navIcons/home.svg";
import MapIcon from "../../assets/navIcons/map.svg";
import BookIcon from "../../assets/navIcons/book.svg";
import MessageIcon from "../../assets/navIcons/message.svg";
import MyPageIcon from "../../assets/navIcons/mypage.svg";
import { useNavigate } from "react-router-dom";

const NAV_ITEMS = [
  { path: "/main", iconSrc: HomeIcon, label: "홈" },
  { path: "/map", iconSrc: MapIcon, label: "탐색" },
  { path: "/book", iconSrc: BookIcon, label: "예약" },
  { path: "/chats", iconSrc: MessageIcon, label: "메시지" },
  { path: "/profile", iconSrc: MyPageIcon, label: "마이페이지" },
];

export default function BottomNav({ activeIndex = 0, onNavChange }) {
  const navigate = useNavigate();
  const resetViewportScroll = () => {
    document
      .querySelector(".app-viewport")
      ?.scrollTo({ top: 0, left: 0, behavior: "auto" });
  };

  return (
    <div
      style={{
        position: "fixed",
        right: 0,
        bottom: "calc(16px + env(safe-area-inset-bottom))",
        left: 0,
        width: "min(390px, 100vw)",
        maxWidth: "100vw",
        margin: "0 auto",
        display: "flex",
        justifyContent: "center",
        zIndex: 1000,
        pointerEvents: "none",
      }}
    >
      <nav
        style={{
          width: 350,
          height: 68,
          background: "#222222",
          borderRadius: 70,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 8px",
          pointerEvents: "auto",
          boxShadow: "0 4px 24px rgba(0,0,0,0.25)",
        }}
      >
        {NAV_ITEMS.map((item, index) => {
          const isActive = activeIndex === index;

          return (
            <button
              key={index}
              type="button"
              onClick={() => {
                onNavChange?.(index);
                resetViewportScroll();
                navigate(item.path);
              }}
              style={{
                width: 66.8,
                height: 52,
                borderRadius: 70,
                background: isActive ? "#C5F598" : "transparent",
                border: "none",
                outline: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <img
                src={item.iconSrc}
                alt={item.label}
                style={{
                  width: 24,
                  height: 24,
                  filter: isActive
                    ? "brightness(0)"
                    : "brightness(0) invert(1)",
                }}
              />
            </button>
          );
        })}
      </nav>
    </div>
  );
}
