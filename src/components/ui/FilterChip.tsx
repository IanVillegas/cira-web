import type { ButtonHTMLAttributes } from "react";
import { Icon } from "./Icon";

interface FilterChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  active?: boolean;
}

export function FilterChip({ label, active = false, className = "", ...rest }: FilterChipProps) {
  return (
    <button
      className={`flex shrink-0 items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition-colors
        ${active
          ? "border-cira-accent bg-cira-secondary text-cira-accent"
          : "border-cira-border bg-cira-card text-cira-text-secondary hover:border-cira-accent"}
        ${className}`}
      {...rest}
    >
      {label}
      <Icon name="expand_more" size={16} />
    </button>
  );
}
