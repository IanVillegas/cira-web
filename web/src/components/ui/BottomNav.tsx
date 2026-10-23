import { Link, useLocation } from "react-router-dom";
import { Icon } from "./Icon";
import { tr } from "@/lib/i18n";
import { useNoLeidos } from "@/lib/noLeidos";

// Cada ítem queda activo en su ruta y en las pantallas hijas/hermanas
// (por ejemplo "Explorar" cubre trabajadores, mis publicaciones, etc.).
const ITEMS = [
  { key: "mapa", to: "/mapa", label: tr("MAPA"), icon: "map", matches: ["/mapa"] },
  {
    key: "explorar",
    to: "/explorar",
    label: tr("EXPLORAR"),
    icon: "explore",
    matches: ["/explorar", "/trabajadores", "/publicaciones", "/mis-trabajos", "/crear-trabajo"],
  },
  { key: "chats", to: "/chats", label: tr("CHAT"), icon: "chat", matches: ["/chats"] },
  {
    key: "perfil",
    to: "/perfil",
    label: tr("PERFIL"),
    icon: "person",
    matches: ["/perfil", "/cuenta", "/historial"],
  },
];

/** Réplica de CiraBottomNavBar: 4 ítems de 64 px mín., icono 28, etiqueta 12 semibold. */
export function BottomNav() {
  const { pathname } = useLocation();
  const noLeidos = useNoLeidos();

  return (
    <nav className="rounded-t-[28px] bg-cira-nav-bg px-3 pb-2.5 pt-1.5">
      <div className="grid grid-cols-4 gap-1.5">
        {ITEMS.map((item) => {
          const active = item.matches.some((m) => pathname.startsWith(m));
          return (
            <Link
              key={item.key}
              to={item.to}
              className={`flex min-h-16 flex-col items-center justify-center gap-0.5 rounded-cira-nav-item px-2 py-[7px] transition-colors ${
                active ? "bg-cira-nav-item-selected-bg" : ""
              }`}
            >
              <span className="relative">
                <Icon
                  name={item.icon}
                  filled={active}
                  size={28}
                  className={active ? "text-cira-nav-active" : "text-cira-nav-inactive"}
                />
                {item.key === "chats" && noLeidos > 0 && (
                  <span
                    aria-label={`${noLeidos}`}
                    className="absolute -top-1 -right-2 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-cira-btn-destructive-text px-1 text-[11px] font-bold text-white"
                  >
                    {noLeidos > 9 ? "9+" : noLeidos}
                  </span>
                )}
              </span>
              <span
                className={`text-cira-nav font-semibold ${
                  active ? "text-cira-nav-active" : "text-cira-nav-inactive"
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
