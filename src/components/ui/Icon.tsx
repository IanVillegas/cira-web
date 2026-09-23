interface IconProps {
  name: string;
  filled?: boolean;
  size?: number;
  className?: string;
}

/** Ícono de Material Symbols Rounded, igual al usado en el proyecto MAUI original. */
export function Icon({ name, filled = false, size = 24, className = "" }: IconProps) {
  return (
    <span
      className={`material-symbols-rounded ${filled ? "filled" : ""} ${className}`}
      style={{ fontSize: size }}
      aria-hidden="true"
    >
      {name}
    </span>
  );
}
