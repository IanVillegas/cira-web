import { localeActual, tr } from "./i18n";

// Las fechas de los trabajos llegan como fecha y hora locales sin zona ("2026-10-31T09:00"),
// o null si el trabajo se atiende "lo antes posible" (urgencias).

const dos = (n: number) => String(n).padStart(2, "0");

/** "2026-10-31T09:00" → Date en la hora local del teléfono. */
export function aDate(iso: string): Date {
  const [d, h = "00:00"] = iso.split("T");
  const [y, m, dia] = d.split("-").map(Number);
  const [hh, mm] = h.split(":").map(Number);
  return new Date(y, m - 1, dia, hh, mm);
}

/** Date → "2026-10-31" (día local). */
export const aDia = (d: Date) => `${d.getFullYear()}-${dos(d.getMonth() + 1)}-${dos(d.getDate())}`;

/** Hoy (día local). */
export const hoyDia = () => aDia(new Date());

/** Suma días a un día "YYYY-MM-DD". */
export function sumarDias(dia: string, n: number) {
  const d = aDate(dia);
  d.setDate(d.getDate() + n);
  return aDia(d);
}

const hora = (d: Date) => d.toLocaleTimeString(localeActual(), { hour: "numeric", minute: "2-digit" });
const capitalizar = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/**
 * Fecha de un trabajo para leer de un vistazo: "Hoy, 3:00 p. m.", "Mañana, 8:00 a. m.",
 * "Viernes, 1:00 p. m." (esta semana), "31 oct, 9:00 a. m." o "Lo antes posible".
 */
export function fechaTrabajo(iso: string | null | undefined): string {
  if (!iso) return tr("Lo antes posible");
  const d = aDate(iso);
  const dia = aDia(d);
  const hoy = hoyDia();
  const dif = Math.round((aDate(dia).getTime() - aDate(hoy).getTime()) / 86_400_000);
  let cuando: string;
  if (dif === 0) cuando = tr("Hoy");
  else if (dif === 1) cuando = tr("Mañana");
  else if (dif === -1) cuando = tr("Ayer");
  else if (dif > 1 && dif < 7) cuando = capitalizar(d.toLocaleDateString(localeActual(), { weekday: "long" }));
  else
    cuando = d.toLocaleDateString(localeActual(), {
      day: "numeric",
      month: "short",
      ...(d.getFullYear() !== new Date().getFullYear() ? { year: "numeric" } : {}),
    });
  return `${cuando}, ${hora(d)}`;
}

/** Solo el día, para el historial: "12 sept 2026". */
export function fechaDia(iso: string | null | undefined): string {
  if (!iso) return "—";
  return aDate(iso).toLocaleDateString(localeActual(), { day: "numeric", month: "short", year: "numeric" });
}

/** Día del calendario con nombre: "viernes 31 de octubre". */
export function diaLargo(dia: string): string {
  return aDate(dia).toLocaleDateString(localeActual(), { weekday: "long", day: "numeric", month: "long" });
}

/** Solo la hora de una fecha de trabajo: "9:00 a. m.". */
export const horaDe = (iso: string) => hora(aDate(iso));

/** "semanal" → "Cada viernes"; "quincenal" → "Cada 2 semanas"; "mensual" → "Cada mes, el día 31". */
export function frecuenciaTexto(frecuencia: string, iso?: string | null): string {
  const d = iso ? aDate(iso) : null;
  if (frecuencia === "semanal") {
    return d ? tr("Cada {dia}", { dia: d.toLocaleDateString(localeActual(), { weekday: "long" }) }) : tr("Cada semana");
  }
  if (frecuencia === "quincenal") return tr("Cada 2 semanas");
  return d ? tr("Cada mes, el día {n}", { n: d.getDate() }) : tr("Cada mes");
}
