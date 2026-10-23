import { cx } from "./cx";

export interface IconProps {
  /** Nombre del ícono de Material Symbols Rounded (p. ej. "work", "map"). */
  name: string;
  filled?: boolean;
  size?: number;
  className?: string;
}

/** Ícono de Material Symbols Rounded; el relleno se anima al activarse. */
export function Icon({ name, filled = false, size = 24, className }: IconProps) {
  return (
    <span className={cx("ca-icon", filled && "is-filled", className)} style={{ fontSize: size }} aria-hidden="true">
      {name}
    </span>
  );
}
