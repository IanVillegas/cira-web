import { Badge, Icon } from "@/components/aire";
import { tr } from "@/lib/i18n";
import type { Insignia } from "@/lib/types";

const INSIGNIAS: Record<Insignia, { icon: string; label: string; tone: "warning" | "accent" | "success" | "danger" }> = {
  plus: { icon: "star", label: "Plus", tone: "warning" },
  cedula: { icon: "verified", label: "Cédula verificada", tone: "accent" },
  antecedentes: { icon: "description", label: "Hoja de delincuencia al día", tone: "accent" },
  mas50: { icon: "workspace_premium", label: "+50 trabajos", tone: "success" },
  urgencias: { icon: "bolt", label: "Responde urgencias", tone: "danger" },
};

/** Insignias de verificación; en las tarjetas se muestran solo con el ícono (compact), salvo Plus. */
export function InsigniaChips({ insignias, compact = false }: { insignias: Insignia[]; compact?: boolean }) {
  if (insignias.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1.5">
      {insignias.map((i) => {
        const def = INSIGNIAS[i];
        const etiqueta = tr(def.label);
        return (
          <span key={i} title={etiqueta} aria-label={etiqueta}>
            <Badge tone={def.tone}>
              <Icon name={def.icon} filled size={14} />
              {!compact || i === "plus" ? etiqueta : null}
            </Badge>
          </span>
        );
      })}
    </div>
  );
}
