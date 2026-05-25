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
  { path: "/chat/1", iconSrc: MessageIcon, label: "메시지" },
  { path: "/profile", iconSrc: MyPageIcon, label: "마이페이지" },
];

export default function BottomNav({ activeIndex = 0, onNavChange }) {
  const navigate = useNavigate();

  return (
    <div
      style={{
        position: "fixed",
        bottom: 16,
        left: "50%",
        transform: "translateX(-50%)",
        width: 390,
        maxWidth: "100vw",
        display: "flex",
        justifyContent: "center",
        zIndex: 200,
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
              onClick={() => {
                onNavChange?.(index);
                navigate(item.path);
              }}
              style={{
                width: 66.8,
                height: 52,
                borderRadius: 70,
                background: isActive ? "#C5F598" : "transparent",
                border: "none",
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