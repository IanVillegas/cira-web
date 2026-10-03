import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "outlined" | "inverted" | "destructive";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  fullWidth?: boolean;
  children: ReactNode;
}

// Réplica de ButtonStyles.xaml: fuente semibold 16, altura mínima 44, radio
// completo y sombra negra (offset 0,6 / radio 14). El texto va tal cual se
// escribe (el MAUI original solo usa mayúsculas donde el texto ya viene así).
const variantClasses: Record<Variant, string> = {
  primary:
    "border-cira-btn-primary-bg bg-cira-btn-primary-bg text-cira-base shadow-[0_6px_14px_rgba(0,0,0,0.22)]",
  secondary:
    "border-cira-btn-secondary-bg bg-cira-btn-secondary-bg text-cira-text-primary shadow-[0_6px_14px_rgba(0,0,0,0.12)]",
  outlined:
    "border-cira-btn-outlined-border bg-transparent text-cira-text-primary shadow-[0_6px_14px_rgba(0,0,0,0.10)]",
  inverted:
    "border-cira-btn-inverted-bg bg-cira-btn-inverted-bg text-cira-base shadow-[0_6px_14px_rgba(0,0,0,0.22)]",
  destructive:
    "border-cira-btn-destructive-border bg-cira-btn-destructive-bg text-cira-btn-destructive-text shadow-[0_6px_14px_rgba(217,75,95,0.25)]",
};

export function Button({
  variant = "primary",
  fullWidth = true,
  className = "",
  disabled,
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      disabled={disabled}
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-cira-button border px-5 py-2.5 text-cira-control font-semibold transition-opacity duration-150 hover:opacity-95 active:opacity-85
        ${fullWidth ? "w-full" : ""}
        ${
          disabled
            ? "cursor-not-allowed border-cira-btn-disabled-bg bg-cira-btn-disabled-bg text-cira-btn-disabled-text shadow-[0_6px_14px_rgba(0,0,0,0.10)]"
            : variantClasses[variant]
        }
        ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
