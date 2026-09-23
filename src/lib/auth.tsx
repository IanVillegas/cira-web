import { createContext, useContext, useState, type ReactNode } from "react";
import { usuarioActual } from "./mockData";
import type { Usuario } from "./types";

interface AuthContextValue {
  isAuthenticated: boolean;
  usuario: Usuario;
  login: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const STORAGE_KEY = "cira.session";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(
    () => sessionStorage.getItem(STORAGE_KEY) === "true",
  );

  const login = () => {
    try {
      sessionStorage.setItem(STORAGE_KEY, "true");
    } catch {
      /* almacenamiento no disponible: la sesión sigue en memoria */
    }
    setIsAuthenticated(true);
  };

  const logout = () => {
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      /* almacenamiento no disponible */
    }
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, usuario: usuarioActual, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return ctx;
}
