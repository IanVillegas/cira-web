// Fechas de los trabajos: se guardan como fecha y hora locales de Costa Rica, sin zona
// ("2026-10-31T09:00"). Un trabajo sin fecha (null) se atiende "lo antes posible" (urgencias).

/** Costa Rica no usa horario de verano: siempre UTC-6. */
const OFFSET_CR_MS = -6 * 60 * 60 * 1000;

export const RE_FECHA_HORA = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;
export const RE_DIA = /^\d{4}-\d{2}-\d{2}$/;

const dos = (n) => String(n).padStart(2, "0");

/** Fecha "de pared" de Costa Rica como Date cuyos campos UTC son la hora local. */
function ahoraCR() {
  return new Date(Date.now() + OFFSET_CR_MS);
}

const aIso = (d) => `${d.getUTCFullYear()}-${dos(d.getUTCMonth() + 1)}-${dos(d.getUTCDate())}T${dos(d.getUTCHours())}:${dos(d.getUTCMinutes())}`;
const deIso = (iso) => new Date(`${iso}:00Z`);

/** "2026-10-24T11:44": ahora en Costa Rica. */
export const ahoraIso = () => aIso(ahoraCR());

/** "2026-10-24": hoy en Costa Rica. */
export const hoyIso = () => ahoraIso().slice(0, 10);

/** Día (YYYY-MM-DD) de una fecha y hora. */
export const diaDe = (iso) => iso.slice(0, 10);

/** Dentro de `dias` días, a la hora indicada ("HH:MM"). */
export function enDias(dias, hora) {
  const d = ahoraCR();
  d.setUTCDate(d.getUTCDate() + dias);
  return `${aIso(d).slice(0, 10)}T${hora}`;
}

/** El próximo día de la semana pedido (0 = domingo … 6 = sábado), nunca hoy, a la hora indicada. */
export function proximo(diaSemana, hora) {
  const d = ahoraCR();
  const faltan = ((diaSemana - d.getUTCDay() + 7) % 7) || 7;
  return enDias(faltan, hora);
}

/** Siguiente visita de una serie: misma hora, una o dos semanas, o un mes después. */
export function siguienteVisita(iso, frecuencia) {
  const d = deIso(iso);
  if (frecuencia === "semanal") d.setUTCDate(d.getUTCDate() + 7);
  else if (frecuencia === "quincenal") d.setUTCDate(d.getUTCDate() + 14);
  else {
    // Mensual: mismo número de día; si el mes no lo tiene (31 → 30), el último día del mes.
    const dia = d.getUTCDate();
    d.setUTCDate(1);
    d.setUTCMonth(d.getUTCMonth() + 1);
    const ultimo = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0)).getUTCDate();
    d.setUTCDate(Math.min(dia, ultimo));
  }
  return aIso(d);
}

export function fechaHoraValida(v) {
  if (!RE_FECHA_HORA.test(String(v ?? ""))) return false;
  return !Number.isNaN(deIso(v).getTime());
}
