import type { ButtonHTMLAttributes } from "react";

interface FilterChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  active?: boolean;
}

/** Réplica de CiraFilterChip: blanco, radio 16, 12 semibold; activo = fondo suave + borde acento. */
export function FilterChip({ label, active = false, className = "", ...rest }: FilterChipProps) {
  return (
    <button
      className={`shrink-0 rounded-2xl border px-3 py-2 text-xs font-semibold transition-colors ${
        active
          ? "border-cira-accent bg-cira-nav-selected-bg text-cira-accent"
          : "border-transparent bg-cira-card text-cira-text-secondary"
      } ${className}`}
      {...rest}
    >
      {label}
    </button>
  );
}
