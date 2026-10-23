import { Icon } from "@/components/aire";
import { tr } from "@/lib/i18n";

/** Promedio con una estrella: "4.8 (12)" o "Nuevo" cuando todavía no hay calificaciones. */
export function Calificacion({
  valor,
  total,
  className = "",
}: {
  valor: number | null;
  total?: number;
  className?: string;
}) {
  if (valor === null) {
    return <span className={`aire-text-caption text-aire-ink-2 ${className}`}>{tr("Nuevo")}</span>;
  }
  return (
    <span className={`aire-text-caption inline-flex items-center gap-0.5 text-aire-ink ${className}`}>
      <Icon name="star" filled size={15} className="text-aire-warning" />
      {valor.toFixed(1)}
      {total !== undefined && <span className="text-aire-ink-2">({total})</span>}
    </span>
  );
}

/** Selector de 1 a 5 estrellas. */
export function EstrellasInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex justify-center gap-1" role="radiogroup" aria-label={tr("Calificación")}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={value === n}
          aria-label={`${n} ${tr(n > 1 ? "estrellas" : "estrella")}`}
          onClick={() => onChange(n)}
          className="flex h-12 w-12 items-center justify-center rounded-aire-full transition-transform duration-[100ms] ease-aire-pop active:scale-90"
        >
          <Icon name="star" filled={n <= value} size={40} className={n <= value ? "text-aire-warning" : "text-aire-surface-3"} />
        </button>
      ))}
    </div>
  );
}
