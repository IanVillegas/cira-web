import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { api, getToken, setToken } from "./api";
import type { Usuario } from "./types";

interface AuthContextValue {
  isAuthenticated: boolean;
  /** Teléfono/correo recordado: si hay uno pero la sesión se perdió, se muestra "Sesión expirada". */
  lastIdentifier: string | null;
  usuario: Usuario | null;
  /** Valida teléfono/correo + PIN contra el servidor; lanza un Error con el mensaje a mostrar. */
  login: (identifier: string, pin: string) => Promise<void>;
  registrar: (datos: Parameters<typeof api.auth.registro>[0]) => Promise<void>;
  /** Cierra sesión y olvida la cuenta (vuelve al login normal). */
  logout: () => void;
  /** Olvida solo la cuenta recordada ("Cambiar de cuenta"). */
  forgetIdentifier: () => void;
  refrescarUsuario: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

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
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => getToken() !== null);
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

  const iniciarSesion = (token: string, identifier: string, datos: Usuario) => {
    setToken(token);
    writeStorage(localStorage, IDENTIFIER_KEY, identifier);
    setLastIdentifier(identifier);
    setUsuario(datos);
    setIsAuthenticated(true);
  };

  const login = async (identifier: string, pin: string) => {
    const { token, usuario: datos } = await api.auth.login(identifier, pin);
    iniciarSesion(token, identifier, datos);
  };

  const registrar = async (datos: Parameters<typeof api.auth.registro>[0]) => {
    const { token, usuario: nuevo } = await api.auth.registro(datos);
    iniciarSesion(token, datos.telefono, nuevo);
  };

  const forgetIdentifier = () => {
    writeStorage(localStorage, IDENTIFIER_KEY, null);
    setLastIdentifier(null);
  };

  const logout = () => {
    setToken(null);
    setUsuario(null);
    forgetIdentifier();
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, lastIdentifier, usuario, login, registrar, logout, forgetIdentifier, refrescarUsuario }}
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
