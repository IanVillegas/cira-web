import { cx } from "./cx";

export interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  /** Etiqueta accesible (obligatoria si no hay texto visible al lado). */
  label?: string;
}

/** Interruptor iOS: el pulgar se estira al presionar y salta con rebote. */
export function Switch({ checked, onChange, disabled = false, label = "Interruptor" }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cx("ca-switch", checked && "is-on")}
    >
      <span className="ca-switch__thumb" />
    </button>
  );
}
