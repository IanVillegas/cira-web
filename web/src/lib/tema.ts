import { useSyncExternalStore } from "react";

/** Preferencia de apariencia: seguir al teléfono, o forzar claro u oscuro. */
export type Tema = "sistema" | "claro" | "oscuro";

const KEY = "cira.tema";
const oyentes = new Set<() => void>();

function leer(): Tema {
  try {
    const v = localStorage.getItem(KEY);
    if (v === "claro" || v === "oscuro" || v === "sistema") return v;
  } catch {
    /* sin almacenamiento: se sigue al sistema */
  }
  return "sistema";
}

let actual: Tema = leer();
const media = typeof window !== "undefined" ? window.matchMedia?.("(prefers-color-scheme: dark)") : undefined;

/** true si, con la preferencia actual, la app se ve oscura. */
export const esOscuro = () => actual === "oscuro" || (actual === "sistema" && !!media?.matches);

/** Pone data-theme en <html> (los tokens --aire-* cambian solos) y el color de la barra del navegador. */
function aplicar() {
  const oscuro = esOscuro();
  const html = document.documentElement;
  html.dataset.theme = oscuro ? "dark" : "light";
  html.style.colorScheme = oscuro ? "dark" : "light";
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", oscuro ? "#121212" : "#f5f5f7");
  oyentes.forEach((o) => o());
}

/** Se llama una vez al arrancar: aplica el tema y sigue los cambios del sistema en modo "sistema". */
export function iniciarTema() {
  aplicar();
  media?.addEventListener?.("change", () => actual === "sistema" && aplicar());
}

export function cambiarTema(nuevo: Tema) {
  actual = nuevo;
  try {
    localStorage.setItem(KEY, nuevo);
  } catch {
    /* sin almacenamiento la elección dura solo esta sesión */
  }
  aplicar();
}

function suscribir(oyente: () => void) {
  oyentes.add(oyente);
  return () => {
    oyentes.delete(oyente);
  };
}

/** Preferencia elegida y si la app se ve oscura ahora mismo. */
export function useTema() {
  const tema = useSyncExternalStore(suscribir, () => actual);
  const oscuro = useSyncExternalStore(suscribir, esOscuro);
  return { tema, oscuro };
}
