import { Icon } from "./ui/Icon";
import { ETAPAS } from "@/lib/etapas";
import type { EtapaTrabajo } from "@/lib/types";
import { tr } from "@/lib/i18n";

/** Línea de seguimiento tipo Uber: Aceptado → En camino → Llegó → Terminado. */
export function SeguimientoTrabajo({ etapa }: { etapa?: EtapaTrabajo }) {
  const actual = etapa ? ETAPAS.indexOf(etapa) : -1;
  return (
    <ol className="flex items-start" aria-label={tr("Seguimiento del trabajo")}>
      {ETAPAS.map((e, i) => {
        const hecho = i <= actual;
        return (
          <li key={e} className="flex flex-1 flex-col items-center gap-1" aria-current={i === actual ? "step" : undefined}>
            <div className="flex w-full items-center">
              <span className={`h-0.5 flex-1 ${i === 0 ? "bg-transparent" : i <= actual ? "bg-cira-accent" : "bg-cira-border"}`} />
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-full ${
                  hecho ? "bg-cira-accent text-white" : "bg-cira-surface-disabled text-cira-text-helper"
                }`}
              >
                <Icon name={hecho ? "check" : "circle"} size={hecho ? 16 : 8} />
              </span>
              <span
                className={`h-0.5 flex-1 ${i === ETAPAS.length - 1 ? "bg-transparent" : i < actual ? "bg-cira-accent" : "bg-cira-border"}`}
              />
            </div>
            <span className={`text-[10px] font-semibold ${hecho ? "text-cira-accent" : "text-cira-text-helper"}`}>{tr(e)}</span>
          </li>
        );
      })}
    </ol>
  );
}
