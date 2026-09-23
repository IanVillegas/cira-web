import { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { Icon } from "./Icon";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: string;
  error?: string;
}

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
          className={`flex items-center gap-2 rounded-cira-input border bg-cira-input-bg px-4 py-3 transition-colors focus-within:border-cira-accent
            ${error ? "border-cira-btn-destructive-text" : "border-cira-input-border"}`}
        >
          {icon && <Icon name={icon} size={20} className="text-cira-text-helper" />}
          <input
            ref={ref}
            id={inputId}
            className={`w-full bg-transparent text-cira-control text-cira-text-primary placeholder:text-cira-text-helper focus:outline-none ${className}`}
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
          className={`w-full resize-none rounded-cira-input border border-cira-input-border bg-cira-input-bg px-4 py-3 text-cira-control text-cira-text-primary placeholder:text-cira-text-helper focus:border-cira-accent focus:outline-none ${className}`}
          {...rest}
        />
      </label>
    );
  },
);
TextArea.displayName = "TextArea";
