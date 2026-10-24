import { Badge, Icon } from "@/components/aire";
import { frecuenciaTexto, limiteTexto } from "@/lib/fechas";
import { tr } from "@/lib/i18n";
import type { Trabajo } from "@/lib/types";

/**
 * Datos de agenda de un trabajo: hora límite, si es una limpieza entre huéspedes, si es una visita de un servicio recurrente, en qué propiedad
 * y, para quien hace el trabajo, las instrucciones fijas de esa propiedad.
 */
export function VisitaInfo({ trabajo, instrucciones = false }: { trabajo: Trabajo; instrucciones?: boolean }) {
  const { serie, propiedad, limite, turno } = trabajo;
  if (!serie && !propiedad && !limite) return null;
  return (
    <div className="grid gap-2">
      <div className="flex flex-wrap gap-1.5">
        {limite && (
          <Badge tone="warning">
            <Icon name="timer" size={14} />
            {limiteTexto(limite, trabajo.fecha)}
          </Badge>
        )}
        {turno && (
          <Badge tone="accent">
            <Icon name="luggage" size={14} />
            {tr("Entre huéspedes")}
          </Badge>
        )}
        {serie && (
          <Badge tone="accent">
            <Icon name="event_repeat" size={14} />
            {frecuenciaTexto(serie.frecuencia, trabajo.fecha)}
          </Badge>
        )}
        {propiedad && (
          <Badge tone="neutral">
            <Icon name="home_work" size={14} />
            {propiedad.nombre}
          </Badge>
        )}
      </div>
      {instrucciones && propiedad?.instrucciones && (
        <p className="aire-text-footnote flex items-start gap-2 rounded-aire-md bg-aire-surface-2 p-3 text-aire-ink-2">
          <Icon name="sticky_note_2" size={18} className="mt-px shrink-0 text-aire-accent-text" />
          <span>
            <span className="font-semibold text-aire-ink">{tr("Instrucciones:")}</span> {propiedad.instrucciones}
          </span>
        </p>
      )}
    </div>
  );
}
