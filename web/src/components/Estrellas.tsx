import { Icon } from "./ui/Icon";

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
    return <span className={`text-xs font-semibold text-cira-text-helper ${className}`}>Nuevo</span>;
  }
  return (
    <span className={`inline-flex items-center gap-0.5 text-xs font-semibold text-cira-text-primary ${className}`}>
      <Icon name="star" filled size={15} className="text-amber-500" />
      {valor.toFixed(1)}
      {total !== undefined && <span className="font-normal text-cira-text-helper">({total})</span>}
    </span>
  );
}

/** Selector de 1 a 5 estrellas. */
export function EstrellasInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex justify-center gap-1.5" role="radiogroup" aria-label="Calificación">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={value === n}
          aria-label={`${n} estrella${n > 1 ? "s" : ""}`}
          onClick={() => onChange(n)}
        >
          <Icon name="star" filled={n <= value} size={40} className={n <= value ? "text-amber-500" : "text-cira-border"} />
        </button>
      ))}
    </div>
  );
}
