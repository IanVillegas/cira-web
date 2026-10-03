import { Icon } from "./Icon";
import { Field } from "./FieldCaption";

interface DateTimeFieldProps {
  label: string;
  icon: string;
  type: "date" | "time";
  value: string;
  onChange: (value: string) => void;
}

/** Réplica de CiraDateTimeField: etiqueta + contenedor con ícono acento y selector nativo. */
export function DateTimeField({ label, icon, type, value, onChange }: DateTimeFieldProps) {
  return (
    <Field label={label}>
      <div className="flex min-h-12 items-center gap-2 rounded-cira-input bg-cira-input-bg px-2.5">
        <Icon name={icon} size={18} className="shrink-0 text-cira-accent" />
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full min-w-0 bg-transparent text-xs text-cira-text-primary focus:outline-none"
        />
      </div>
    </Field>
  );
}
