import { Icon } from "@/components/aire";
import { ETAPAS } from "@/lib/etapas";
import { tr } from "@/lib/i18n";
import type { EtapaTrabajo } from "@/lib/types";

/** Línea de seguimiento tipo Uber: Aceptado → En camino → Llegó → Terminado. */
export function SeguimientoTrabajo({ etapa }: { etapa?: EtapaTrabajo }) {
  const actual = etapa ? ETAPAS.indexOf(etapa) : -1;
  return (
    <ol className="flex items-start" aria-label={tr("Seguimiento del trabajo")}>
      {ETAPAS.map((e, i) => {
        const hecho = i <= actual;
        return (
          <li key={e} className="flex flex-1 flex-col items-center gap-1.5" aria-current={i === actual ? "step" : undefined}>
            <div className="flex w-full items-center">
              <span
                className={`h-0.5 flex-1 transition-colors duration-[320ms] ${
                  i === 0 ? "bg-transparent" : i <= actual ? "bg-aire-accent" : "bg-aire-surface-3"
                }`}
              />
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-aire-full transition-colors duration-[320ms] ${
                  hecho ? "bg-aire-accent text-aire-on-accent" : "bg-aire-surface-3 text-aire-ink-3"
                }`}
              >
                <Icon name={hecho ? "check" : "circle"} size={hecho ? 18 : 8} />
              </span>
              <span
                className={`h-0.5 flex-1 transition-colors duration-[320ms] ${
                  i === ETAPAS.length - 1 ? "bg-transparent" : i < actual ? "bg-aire-accent" : "bg-aire-surface-3"
                }`}
              />
            </div>
            <span className={`aire-text-caption ${hecho ? "text-aire-accent-text" : "text-aire-ink-2"}`}>{tr(e)}</span>
          </li>
        );
      })}
    </ol>
  );
}
