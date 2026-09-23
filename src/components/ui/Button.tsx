import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "outlined" | "inverted" | "destructive";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  fullWidth?: boolean;
  children: ReactNode;
}

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-cira-btn-primary-bg text-white shadow-[0_10px_20px_-8px_rgba(62,123,225,0.55)] hover:brightness-105 active:brightness-95 disabled:shadow-none",
  secondary:
    "bg-cira-btn-secondary-bg text-cira-accent hover:brightness-95",
  outlined:
    "bg-transparent text-cira-accent border border-cira-btn-outlined-border hover:bg-cira-surface-muted",
  inverted:
    "bg-cira-btn-inverted-bg text-white hover:brightness-110",
  destructive:
    "bg-cira-btn-destructive-bg text-cira-btn-destructive-text border border-cira-btn-destructive-border hover:brightness-95",
};

export function Button({
  variant = "primary",
  fullWidth = false,
  className = "",
  disabled,
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 rounded-cira-button px-6 py-3 text-sm font-semibold tracking-wide uppercase transition-all duration-150
        ${fullWidth ? "w-full" : ""}
        ${disabled ? "cursor-not-allowed bg-cira-btn-disabled-bg text-cira-btn-disabled-text" : variantClasses[variant]}
        ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
