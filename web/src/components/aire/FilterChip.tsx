import type { ButtonHTMLAttributes } from "react";
import { cx } from "./cx";
import { Icon } from "./Icon";

export interface FilterChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  active?: boolean;
}

/** Chip de filtro: al activarse se tiñe y un check entra deslizando. */
export function FilterChip({ label, active = false, className, ...rest }: FilterChipProps) {
  return (
    <button type="button" aria-pressed={active} className={cx("ca-chip", active && "is-active", className)} {...rest}>
      <span className="ca-chip__check" aria-hidden="true">
        <Icon name="check" size={16} />
      </span>
      {label}
    </button>
  );
}
