import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { api } from "./api";
import type { Usuario } from "./types";

interface AuthContextValue {
  isAuthenticated: boolean;
  /** Teléfono/correo recordado: si hay uno pero la sesión se perdió, se muestra "Sesión expirada". */
  lastIdentifier: string | null;
  usuario: Usuario | null;
  login: (identifier: string) => void;
  /** Cierra sesión y olvida la cuenta (vuelve al login normal). */
  logout: () => void;
  /** Olvida solo la cuenta recordada ("Cambiar de cuenta"). */
  forgetIdentifier: () => void;
  refrescarUsuario: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const SESSION_KEY = "cira.session";
const IDENTIFIER_KEY = "cira.identifier";

function readStorage(storage: Storage, key: string): string | null {
  try {
    return storage.getItem(key);
  } catch {
    return null;
  }
}

function writeStorage(storage: Storage, key: string, value: string | null) {
  try {
    if (value === null) storage.removeItem(key);
    else storage.setItem(key, value);
  } catch {
    /* almacenamiento no disponible: la sesión sigue en memoria */
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(
    () => readStorage(sessionStorage, SESSION_KEY) === "true",
  );
  const [lastIdentifier, setLastIdentifier] = useState<string | null>(() =>
    readStorage(localStorage, IDENTIFIER_KEY),
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

  const login = (identifier: string) => {
    writeStorage(sessionStorage, SESSION_KEY, "true");
    writeStorage(localStorage, IDENTIFIER_KEY, identifier);
    setLastIdentifier(identifier);
    setIsAuthenticated(true);
  };

  const forgetIdentifier = () => {
    writeStorage(localStorage, IDENTIFIER_KEY, null);
    setLastIdentifier(null);
  };

  const logout = () => {
    writeStorage(sessionStorage, SESSION_KEY, null);
    forgetIdentifier();
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, lastIdentifier, usuario, login, logout, forgetIdentifier, refrescarUsuario }}
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
