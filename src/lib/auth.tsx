import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { api } from "./api";
import type { Usuario } from "./types";

interface AuthContextValue {
  isAuthenticated: boolean;
  usuario: Usuario | null;
  login: () => void;
  logout: () => void;
  refrescarUsuario: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const STORAGE_KEY = "cira.session";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(
    () => sessionStorage.getItem(STORAGE_KEY) === "true",
  );
  const [usuario, setUsuario] = useState<Usuario | null>(null);

  const refrescarUsuario = async () => {
    try {
      const data = await api.usuario.obtener();
      setUsuario(data);
    } catch {
      // El backend local no está corriendo: la app sigue usable, solo sin datos reales.
      setUsuario(null);
    }
  };

  useEffect(() => {
    if (isAuthenticated) refrescarUsuario();
  }, [isAuthenticated]);

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
      value={{ isAuthenticated, usuario, login, logout, refrescarUsuario }}
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
