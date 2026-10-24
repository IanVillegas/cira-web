import { cx } from "./cx";
import { Icon } from "./Icon";

export type CalendarMark = "accent" | "success" | "warning" | "neutral";

export interface CalendarProps {
  /** Mes mostrado: año y mes (0–11). */
  year: number;
  month: number;
  /** Día elegido (YYYY-MM-DD). */
  value: string;
  onChange: (dia: string) => void;
  onMonthChange: (year: number, month: number) => void;
  /** Puntos por día: hasta tres tonos por día. */
  marks?: Record<string, CalendarMark[]>;
  /** Días tachados (p. ej. bloqueados). */
  blocked?: string[];
  /** Hoy (YYYY-MM-DD), para resaltarlo. */
  today: string;
  locale: string;
  labels: { previous: string; next: string };
}

const dos = (n: number) => String(n).padStart(2, "0");
const diaIso = (y: number, m: number, d: number) => `${y}-${dos(m + 1)}-${dos(d)}`;

/**
 * Calendario mensual: semanas de lunes a domingo, puntos de color por día (lo agendado) y días
 * bloqueados con fondo neutro. Cada día es un botón de 44px; el elegido lleva el color de acción.
 */
export function Calendar({ year, month, value, onChange, onMonthChange, marks = {}, blocked = [], today, locale, labels }: CalendarProps) {
  const primero = new Date(year, month, 1);
  const diasMes = new Date(year, month + 1, 0).getDate();
  // Lunes primero: getDay() 0 = domingo.
  const hueco = (primero.getDay() + 6) % 7;
  const mesAnio = primero.toLocaleDateString(locale, { month: "long", year: "numeric" });
  const titulo = mesAnio.charAt(0).toUpperCase() + mesAnio.slice(1);
  const semana = Array.from({ length: 7 }, (_, i) =>
    new Date(2024, 0, 1 + i).toLocaleDateString(locale, { weekday: "narrow" }),
  );

  const mover = (delta: number) => {
    const d = new Date(year, month + delta, 1);
    onMonthChange(d.getFullYear(), d.getMonth());
  };

  return (
    <div className="ca-cal">
      <div className="ca-cal__head">
        <button type="button" className="ca-iconbtn" aria-label={labels.previous} onClick={() => mover(-1)}>
          <Icon name="chevron_left" size={22} />
        </button>
        <p className="ca-cal__title" aria-live="polite">
          {titulo}
        </p>
        <button type="button" className="ca-iconbtn" aria-label={labels.next} onClick={() => mover(1)}>
          <Icon name="chevron_right" size={22} />
        </button>
      </div>
      <div className="ca-cal__grid" role="grid" aria-label={titulo}>
        {semana.map((d, i) => (
          <span key={i} className="ca-cal__dow" aria-hidden="true">
            {d}
          </span>
        ))}
        {Array.from({ length: hueco }, (_, i) => (
          <span key={`h${i}`} />
        ))}
        {Array.from({ length: diasMes }, (_, i) => {
          const dia = diaIso(year, month, i + 1);
          const puntos = marks[dia] ?? [];
          return (
            <button
              key={dia}
              type="button"
              aria-pressed={dia === value}
              aria-current={dia === today ? "date" : undefined}
              className={cx("ca-cal__day", dia === value && "is-selected", dia === today && "is-today", blocked.includes(dia) && "is-blocked")}
              onClick={() => onChange(dia)}
            >
              {i + 1}
              {puntos.length > 0 && (
                <span className="ca-cal__dots" aria-hidden="true">
                  {puntos.slice(0, 3).map((t, k) => (
                    <i key={k} className={`ca-cal__dot ca-cal__dot--${t}`} />
                  ))}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
