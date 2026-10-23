import { forwardRef, useId, type InputHTMLAttributes, type ReactNode, type TextareaHTMLAttributes } from "react";
import { cx } from "./cx";
import { Icon } from "./Icon";

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "prefix"> {
  label?: string;
  /** Ícono al inicio (Material Symbols). */
  icon?: string;
  /** Texto fijo antes del valor, p. ej. "₡" en montos. */
  prefix?: string;
  /** Contenido al final: ícono de despliegue, botón, unidad. */
  trailing?: ReactNode;
  hint?: string;
  /** Mensaje de error: borde rojo, sacudida breve y texto debajo. */
  error?: string;
}

/**
 * Campo de texto. El foco aparece como un anillo azul que crece desde el
 * borde; el error sacude el campo una vez. Sirve también para selects,
 * fechas y montos con `prefix` y `trailing`.
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, icon, prefix, trailing, hint, error, className, id, disabled, ...rest },
  ref,
) {
  const auto = useId();
  const inputId = id ?? auto;
  const msgId = `${inputId}-msg`;
  return (
    <div className={cx("ca-field", className)}>
      {label && (
        <label htmlFor={inputId} className="ca-field__label">
          {label}
        </label>
      )}
      <div className={cx("ca-input", error && "is-error", disabled && "is-disabled")}>
        {icon && <Icon name={icon} size={20} className="ca-input__icon" />}
        {prefix && <span className="ca-input__prefix">{prefix}</span>}
        <input
          ref={ref}
          id={inputId}
          disabled={disabled}
          aria-invalid={!!error || undefined}
          aria-describedby={error || hint ? msgId : undefined}
          {...rest}
        />
        {trailing && <span className="ca-input__trailing">{trailing}</span>}
      </div>
      {(error || hint) && (
        <span id={msgId} className={cx("ca-field__hint", error && "is-error")}>
          {error ?? hint}
        </span>
      )}
    </div>
  );
});

export interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(function TextArea(
  { label, hint, className, id, rows = 4, ...rest },
  ref,
) {
  const auto = useId();
  const areaId = id ?? auto;
  return (
    <div className={cx("ca-field", className)}>
      {label && (
        <label htmlFor={areaId} className="ca-field__label">
          {label}
        </label>
      )}
      <div className="ca-input ca-input--area">
        <textarea ref={ref} id={areaId} rows={rows} {...rest} />
      </div>
      {hint && <span className="ca-field__hint">{hint}</span>}
    </div>
  );
});
