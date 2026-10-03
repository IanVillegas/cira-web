import { Icon } from "./Icon";

interface BudgetFieldProps {
  value: string;
  onChange: (value: string) => void;
  /** Con borde (Crear Publicación) o plano (Servicios). */
  bordered?: boolean;
}

/** Campo de monto en colones: ícono payments + "₡" + número grande + "MONTO EN COLONES". */
export function BudgetField({ value, onChange, bordered = true }: BudgetFieldProps) {
  return (
    <div
      className={`flex h-[86px] items-center gap-2.5 rounded-[14px] bg-cira-input-bg p-4 ${
        bordered ? "border border-cira-border" : ""
      }`}
    >
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[10px] bg-cira-nav-selected-bg">
        <Icon name="payments" size={24} className="text-cira-accent" />
      </span>
      <span className="text-2xl font-semibold text-cira-text-primary">₡</span>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <input
          type="number"
          inputMode="numeric"
          min={1}
          placeholder="20000"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-transparent text-2xl font-semibold text-cira-text-primary placeholder:text-cira-text-helper focus:outline-none"
        />
        <span className="text-[9px] tracking-[0.12em] text-cira-text-helper">MONTO EN COLONES</span>
      </div>
    </div>
  );
}
