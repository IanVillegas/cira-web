import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { BottomNav } from "@/components/ui/BottomNav";
import { PhoneFrame } from "./PhoneFrame";

/** Layout para las pantallas autenticadas: contenido con scroll + bottom nav fija. */
export function AppShell() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <PhoneFrame>
      <div className="no-scrollbar flex-1 overflow-y-auto">
        <Outlet />
      </div>
      <div className="px-3 pb-3 pt-1">
        <BottomNav />
      </div>
    </PhoneFrame>
  );
}
