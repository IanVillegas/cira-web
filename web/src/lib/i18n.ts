import { EN } from "./i18n/en";

export type Idioma = "es" | "en";

const KEY = "cira.idioma";

function leerIdioma(): Idioma {
  try {
    const v = localStorage.getItem(KEY);
    if (v === "en" || v === "es") return v;
  } catch {
    /* almacenamiento no disponible: español por defecto */
  }
  return "es";
}

const actual: Idioma = leerIdioma();
if (typeof document !== "undefined") document.documentElement.lang = actual;

export const idioma = (): Idioma => actual;

/** Código de localización para fechas y números. */
export const localeActual = () => (actual === "en" ? "en-US" : "es-CR");

/** Guarda el idioma y recarga: así los textos definidos a nivel de módulo también cambian. */
export function cambiarIdioma(nuevo: Idioma) {
  try {
    localStorage.setItem(KEY, nuevo);
  } catch {
    /* sin almacenamiento no se puede recordar la elección */
  }
  window.location.reload();
}

/**
 * Traduce un texto escrito en español. Admite parámetros `{nombre}`.
 * Sin traducción disponible devuelve el texto original.
 */
export function tr(texto: string, params?: Record<string, string | number>): string {
  let resultado = actual === "en" ? (EN[texto] ?? texto) : texto;
  if (params) {
    for (const [k, v] of Object.entries(params)) resultado = resultado.replaceAll(`{${k}}`, String(v));
  }
  return resultado;
}
