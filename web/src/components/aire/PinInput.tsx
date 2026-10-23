import { useRef, useState } from "react";
import { cx } from "./cx";

export interface PinInputProps {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  /** Muestra puntos en vez del dígito (PIN). Con false se ven los caracteres (códigos SMS). */
  isPassword?: boolean;
  allowLetters?: boolean;
  autoUppercase?: boolean;
  autoFocus?: boolean;
  label?: string;
  /** Marca el código como incorrecto: las casillas se sacuden en rojo. */
  error?: boolean;
}

/**
 * PIN / código: un input oculto y casillas. La casilla activa muestra un
 * cursor que parpadea; cada dígito entra con un pequeño rebote.
 */
export function PinInput({
  value,
  onChange,
  length = 4,
  isPassword = true,
  allowLetters = false,
  autoUppercase = false,
  autoFocus = false,
  label,
  error = false,
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

  return (
    <div className="ca-pin">
      {label && <span className="ca-caption">{label}</span>}
      <div className={cx("ca-pin__row", error && "is-error")} onClick={() => inputRef.current?.focus()}>
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
          aria-invalid={error || undefined}
          className="ca-pin__native"
        />
        {Array.from({ length }).map((_, i) => {
          const filled = value.length > i;
          const active = focused && value.length === i;
          return (
            <span key={i} className={cx("ca-pin__box", filled && "is-filled", active && "is-active", length > 4 && "is-compact")}>
              {filled && <span className="ca-pin__char">{isPassword ? <i className="ca-pin__dot" /> : value[i]}</span>}
              {active && <span className="ca-pin__caret" />}
            </span>
          );
        })}
      </div>
    </div>
  );
}
