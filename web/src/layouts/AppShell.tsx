import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { BottomNav } from "@/components/ui/BottomNav";
import { PhoneFrame } from "./PhoneFrame";

/**
 * Pantallas autenticadas. Igual que en MAUI: fondo azul de la barra inferior,
 * una "superficie" clara con las esquinas de abajo redondeadas (28) y la barra
 * de navegación pegada debajo.
 */
export function AppShell() {
  const { isAuthenticated, lastIdentifier } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to={lastIdentifier ? "/sesion-expirada" : "/login"} replace />;
  }

  return (
    <PhoneFrame>
      <div className="flex min-h-0 flex-1 flex-col bg-cira-nav-bg">
        <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto rounded-b-[28px] bg-cira-base">
          <Outlet />
        </div>
        <BottomNav />
      </div>
    </PhoneFrame>
  );
}
