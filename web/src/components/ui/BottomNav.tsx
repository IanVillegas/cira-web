import { NavLink } from "react-router-dom";
import { Icon } from "./Icon";

const ITEMS = [
  { key: "mapa", to: "/mapa", label: "MAPA", icon: "map" },
  { key: "explorar", to: "/explorar", label: "EXPLORAR", icon: "explore" },
  { key: "chats", to: "/chats", label: "CHAT", icon: "chat" },
  { key: "perfil", to: "/perfil", label: "PERFIL", icon: "person" },
];

export function BottomNav() {
  return (
    <nav className="rounded-cira-nav-bar bg-cira-nav-bg px-3 pb-3 pt-2">
      <div className="grid grid-cols-4 gap-1.5">
        {ITEMS.map((item) => (
          <NavLink
            key={item.key}
            to={item.to}
            className={({ isActive }) =>
              `flex min-h-16 flex-col items-center justify-center gap-0.5 rounded-cira-nav-item px-2 py-1.5 transition-colors ${
                isActive ? "bg-cira-nav-item-selected-bg" : ""
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  name={item.icon}
                  filled={isActive}
                  size={26}
                  className={isActive ? "text-cira-nav-active" : "text-cira-nav-inactive"}
                />
                <span
                  className={`text-[11px] font-semibold tracking-wide ${
                    isActive ? "text-cira-nav-active" : "text-cira-nav-inactive"
                  }`}
                >
                  {item.label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
