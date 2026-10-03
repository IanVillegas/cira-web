import { useRef, useState } from "react";

interface PinInputProps {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  /** Muestra "●" en vez del dígito (PIN). Con false se ven los caracteres (códigos SMS). */
  isPassword?: boolean;
  allowLetters?: boolean;
  autoUppercase?: boolean;
  autoFocus?: boolean;
  label?: string;
}

// Réplica de CiraPinInput: un input oculto + cajas de 48x58 (42 si son más de
// 4), radio 20, borde acento en la casilla activa y fondo suave al llenarse.
export function PinInput({
  value,
  onChange,
  length = 4,
  isPassword = true,
  allowLetters = false,
  autoUppercase = false,
  autoFocus = false,
  label,
}: PinInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [focused, setFocused] = useState(false);

  const sanitize = (raw: string) => {
    const filtered = raw
      .split("")
      .filter((c) => (allowLetters ? /[a-zA-Z0-9]/.test(c) : /\d/.test(c)))
      .slice(0, length)
      .join("");
    return autoUppercase ? filtered.toUpperCase() : filtered;
  };

  const compact = length > 4;

  return (
    <div className="flex flex-col items-center gap-2.5">
      {label && (
        <span className="text-[11px] font-bold tracking-[0.14em] text-cira-text-secondary uppercase">
          {label}
        </span>
      )}

      <div className="relative" onClick={() => inputRef.current?.focus()}>
        <input
          ref={inputRef}
          value={value}
          onChange={(e) => onChange(sanitize(e.target.value))}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          autoFocus={autoFocus}
          inputMode={allowLetters ? "text" : "numeric"}
          autoComplete="one-time-code"
          maxLength={length}
          aria-label={label ?? "PIN"}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        />

        <div className="pointer-events-none flex justify-center gap-3">
          {Array.from({ length }).map((_, i) => {
            const hasDigit = value.length > i;
            const isNext = focused && value.length === i;
            return (
              <div
                key={i}
                className={`flex h-[58px] items-center justify-center rounded-cira-card border font-bold text-cira-text-primary transition-colors
                  ${compact ? "w-[42px] text-[22px]" : "w-12 text-[26px]"}
                  ${hasDigit || isNext ? "border-cira-accent" : "border-cira-border"}
                  ${hasDigit ? "bg-cira-nav-selected-bg" : "bg-cira-input-bg"}`}
              >
                {hasDigit ? (isPassword ? "●" : value[i]) : ""}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
