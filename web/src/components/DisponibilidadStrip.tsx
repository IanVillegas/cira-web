import { useEffect, useRef, useState } from "react";
import { Icon, cx } from "@/components/aire";
import { api } from "@/lib/api";
import { aDate, hoyDia, sumarDias } from "@/lib/fechas";
import { localeActual, tr } from "@/lib/i18n";

const DIAS = 21;

interface DisponibilidadStripProps {
  usuarioId: string;
  nombre: string;
  /** Día elegido (YYYY-MM-DD). */
  value: string;
  onChange: (dia: string) => void;
  /** Avisa los días ocupados para que el formulario pueda advertir. */
  onOcupados?: (dias: string[]) => void;
}

/**
 * Próximas tres semanas de una persona: libre u ocupado (lo que bloqueó o ya tiene asignado).
 * Nunca muestra qué trabajo ni con quién. Tocar un día libre lo elige como fecha.
 */
export function DisponibilidadStrip({ usuarioId, nombre, value, onChange, onOcupados }: DisponibilidadStripProps) {
  const [ocupados, setOcupados] = useState<string[] | null>(null);
  const hoy = hoyDia();
  // El aviso al padre va en una ref: cambiar el callback no debe volver a pedir los datos.
  const avisar = useRef(onOcupados);
  useEffect(() => {
    avisar.current = onOcupados;
  });

  useEffect(() => {
    let vivo = true;
    api.agenda
      .ocupado(usuarioId, hoy, sumarDias(hoy, DIAS - 1))
      .then((r) => {
        if (!vivo) return;
        setOcupados(r.ocupados);
        avisar.current?.(r.ocupados);
      })
      .catch(() => vivo && setOcupados([]));
    return () => {
      vivo = false;
    };
  }, [usuarioId, hoy]);

  const dias = Array.from({ length: DIAS }, (_, i) => sumarDias(hoy, i));

  return (
    <div className="grid gap-2">
      <p className="aire-text-eyebrow flex items-center gap-1.5 text-aire-ink-2">
        <Icon name="event_available" size={16} />
        {tr("Disponibilidad de {nombre}", { nombre })}
      </p>
      <div className="no-scrollbar -mx-4 flex gap-1.5 overflow-x-auto px-4 pb-1" role="listbox" aria-label={tr("Elige un día")}>
        {dias.map((dia) => {
          const d = aDate(dia);
          const ocupado = ocupados?.includes(dia) ?? false;
          const elegido = dia === value;
          return (
            <button
              key={dia}
              type="button"
              role="option"
              aria-selected={elegido}
              aria-label={`${d.toLocaleDateString(localeActual(), { weekday: "long", day: "numeric", month: "long" })}${ocupado ? `, ${tr("Ocupado")}` : ""}`}
              disabled={ocupados === null}
              onClick={() => onChange(dia)}
              className={cx(
                "ca-daypill",
                ocupado && "is-busy",
                elegido && "is-selected",
              )}
            >
              <span className="aire-text-caption">{d.toLocaleDateString(localeActual(), { weekday: "short" }).replace(".", "")}</span>
              <span className="aire-text-headline">{d.getDate()}</span>
              <span className="ca-daypill__dot" aria-hidden="true" />
            </button>
          );
        })}
      </div>
      <p className="aire-text-caption flex items-center gap-3 text-aire-ink-2">
        <span className="inline-flex items-center gap-1">
          <span className="ca-daypill__legend" aria-hidden="true" />
          {tr("Libre")}
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="ca-daypill__legend is-busy" aria-hidden="true" />
          {tr("Ocupado")}
        </span>
      </p>
    </div>
  );
}
