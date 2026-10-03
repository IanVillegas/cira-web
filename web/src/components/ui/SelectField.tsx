import { Icon } from "./Icon";

interface SelectFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  options: string[];
}

/** Réplica de CiraSelectField: contenedor blanco de 56 px con la flecha hacia abajo a la derecha. */
export function SelectField({ value, onChange, placeholder, options }: SelectFieldProps) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`min-h-14 w-full appearance-none rounded-cira-input bg-cira-input-bg px-3.5 pr-11 text-cira-control focus:outline-none ${
          value ? "text-cira-text-primary" : "text-cira-text-helper"
        }`}
      >
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
      <Icon
        name="keyboard_arrow_down"
        size={24}
        className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-cira-text-secondary"
      />
    </div>
  );
}
