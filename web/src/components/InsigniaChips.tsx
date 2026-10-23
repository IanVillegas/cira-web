import { Icon } from "./ui/Icon";
import type { Insignia } from "@/lib/types";

const INSIGNIAS: Record<Insignia, { icon: string; label: string; className: string }> = {
  plus: { icon: "star", label: "Plus", className: "bg-amber-100 text-amber-700" },
  cedula: { icon: "verified", label: "Cédula verificada", className: "bg-cira-secondary text-cira-accent" },
  antecedentes: { icon: "description", label: "Hoja de delincuencia al día", className: "bg-cira-secondary text-cira-accent" },
  mas50: { icon: "workspace_premium", label: "+50 trabajos", className: "bg-emerald-100 text-emerald-700" },
  urgencias: { icon: "bolt", label: "Responde urgencias", className: "bg-cira-btn-destructive-bg text-cira-btn-destructive-text" },
};

/** Insignias de verificación; en las tarjetas se muestran solo con el ícono (compact). */
export function InsigniaChips({ insignias, compact = false }: { insignias: Insignia[]; compact?: boolean }) {
  if (insignias.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1.5">
      {insignias.map((i) => {
        const def = INSIGNIAS[i];
        return (
          <span
            key={i}
            title={def.label}
            aria-label={def.label}
            className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-semibold ${def.className}`}
          >
            <Icon name={def.icon} filled size={14} />
            {!compact || i === "plus" ? def.label : null}
          </span>
        );
      })}
    </div>
  );
}
