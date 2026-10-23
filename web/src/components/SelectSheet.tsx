import { useState } from "react";
import { Icon, Input, Sheet, cx } from "@/components/aire";
import { tr } from "@/lib/i18n";

interface SelectSheetProps {
  label?: string;
  placeholder: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
  title?: string;
}

/** Selector en hoja inferior: un campo de solo lectura que abre la lista de opciones. */
export function SelectSheet({ label, placeholder, value, options, onChange, title }: SelectSheetProps) {
  const [abierto, setAbierto] = useState(false);
  return (
    <>
      <Input
        label={label}
        readOnly
        value={value ? tr(value) : ""}
        placeholder={placeholder}
        onClick={() => setAbierto(true)}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setAbierto(true)}
        trailing={<Icon name="expand_more" size={22} />}
        style={{ cursor: "pointer" }}
      />
      <Sheet open={abierto} onClose={() => setAbierto(false)} title={title ?? label ?? placeholder} contained>
        <div className="grid gap-1.5">
          {options.map((o) => (
            <button
              key={o}
              type="button"
              aria-pressed={o === value}
              onClick={() => {
                onChange(o);
                setAbierto(false);
              }}
              className={cx(
                "aire-text-body flex min-h-12 items-center justify-between rounded-aire-md px-4 text-left transition-transform duration-[100ms] ease-aire-pop active:scale-[0.98]",
                o === value ? "bg-aire-accent-soft font-semibold text-aire-accent-text" : "bg-aire-surface-2 text-aire-ink",
              )}
            >
              {tr(o)}
              {o === value && <Icon name="check" size={22} />}
            </button>
          ))}
        </div>
      </Sheet>
    </>
  );
}
