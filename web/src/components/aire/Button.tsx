import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cx } from "./cx";
import { Icon } from "./Icon";
import { Spinner } from "./Spinner";

export type ButtonVariant = "primary" | "secondary" | "tinted" | "outlined" | "destructive" | "plain" | "photo" | "photo-soft";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  /** Muestra un indicador y bloquea el botón; el ancho no salta. */
  loading?: boolean;
  /** Ícono de Material Symbols antes del texto. */
  icon?: string;
  children: ReactNode;
}

/**
 * Botón píldora. Se encoge a 0.97 al presionar con curva de resorte y vuelve
 * con un pequeño rebote; el principal lleva el único halo de color del sistema.
 */
export function Button({
  variant = "primary",
  size = "md",
  fullWidth = true,
  loading = false,
  icon,
  disabled,
  className,
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={cx("ca-btn", `ca-btn--${variant}`, `ca-btn--${size}`, fullWidth && "ca-btn--full", loading && "is-loading", className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      <span className="ca-btn__label">
        {icon && <Icon name={icon} size={size === "sm" ? 18 : 20} />}
        {children}
      </span>
      {loading && <Spinner className="ca-btn__spinner" size={18} />}
    </button>
  );
}
