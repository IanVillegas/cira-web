import { Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
import { TabBar } from "@/components/aire";
import { useAuth } from "@/lib/auth";
import { tr } from "@/lib/i18n";
import { useNoLeidos } from "@/lib/noLeidos";
import { AlertBanner } from "@/components/AlertBanner";
import { ChatNotifier } from "@/components/ChatNotifier";
import { ToastHost } from "@/components/ToastHost";
import { PhoneFrame } from "./PhoneFrame";

// Cada pestaña cubre varias rutas (por ejemplo "Explorar" incluye trabajadores, publicaciones, etc.).
const TABS = [
  { key: "/mapa", label: "Mapa", icon: "map", matches: ["/mapa"] },
  {
    key: "/explorar",
    label: "Explorar",
    icon: "explore",
    matches: ["/explorar", "/trabajadores", "/publicaciones", "/mis-trabajos", "/crear-trabajo", "/alertas", "/usuarios"],
  },
  { key: "/chats", label: "Chats", icon: "chat_bubble", matches: ["/chats"] },
  { key: "/perfil", label: "Perfil", icon: "person", matches: ["/perfil", "/cuenta", "/historial", "/agenda", "/de-confianza"] },
];

/** Pantallas autenticadas: contenido con scroll, barra inferior de vidrio flotando encima y avisos. */
export function AppShell() {
  const { isAuthenticated, lastIdentifier } = useAuth();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const noLeidos = useNoLeidos();

  if (!isAuthenticated) {
    return <Navigate to={lastIdentifier ? "/sesion-expirada" : "/login"} replace />;
  }

  const actual = TABS.find((t) => t.matches.some((m) => pathname.startsWith(m)))?.key ?? "";
  const items = TABS.map((t) => ({
    key: t.key,
    label: tr(t.label),
    icon: t.icon,
    badge: t.key === "/chats" ? noLeidos : 0,
  }));

  return (
    <PhoneFrame>
      {/* El contenido corre por detrás de la cápsula; el mapa llega hasta el borde inferior. */}
      <div className={`no-scrollbar min-h-0 flex-1 overflow-y-auto ${pathname.startsWith("/mapa") ? "" : "ca-scroll-under-tabbar"}`}>
        <Outlet />
      </div>
      <div className="ca-tabbar-dock">
        <TabBar items={items} value={actual} onChange={(key) => navigate(key)} />
      </div>
      <AlertBanner />
      <ToastHost />
      <ChatNotifier />
    </PhoneFrame>
  );
}
