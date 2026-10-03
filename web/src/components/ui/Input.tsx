import { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { Icon } from "./Icon";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: string;
  error?: string;
}

// Réplica de CiraInputContainerStyle: fondo blanco, sin borde, radio 8,
// altura mínima 56 y padding horizontal 14. El foco se marca con un anillo
// sutil (en MAUI lo da la plataforma).
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, icon, error, className = "", id, ...rest }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <label htmlFor={inputId} className="flex flex-col gap-1.5">
        {label && (
          <span className="text-cira-body font-semibold text-cira-text-primary">
            {label}
          </span>
        )}
        <div
          className={`flex min-h-14 items-center gap-2 rounded-cira-input bg-cira-input-bg px-3.5 ring-1 ring-transparent transition-shadow focus-within:ring-cira-accent
            ${error ? "ring-cira-btn-destructive-text" : ""}`}
        >
          {icon && <Icon name={icon} size={20} className="text-cira-text-helper" />}
          <input
            ref={ref}
            id={inputId}
            className={`min-h-12 w-full bg-transparent text-cira-control text-cira-text-primary placeholder:text-cira-text-helper focus:outline-none ${className}`}
            {...rest}
          />
        </div>
        {error && <span className="text-xs text-cira-btn-destructive-text">{error}</span>}
      </label>
    );
  },
);
Input.displayName = "Input";

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ label, className = "", id, ...rest }, ref) => {
    const areaId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <label htmlFor={areaId} className="flex flex-col gap-1.5">
        {label && (
          <span className="text-cira-body font-semibold text-cira-text-primary">
            {label}
          </span>
        )}
        <textarea
          ref={ref}
          id={areaId}
          rows={4}
          className={`min-h-28 w-full resize-none rounded-cira-input bg-cira-input-bg px-3.5 py-2.5 text-cira-body text-cira-text-primary ring-1 ring-transparent placeholder:text-cira-text-helper focus:outline-none focus:ring-cira-accent ${className}`}
          {...rest}
        />
      </label>
    );
  },
);
TextArea.displayName = "TextArea";
