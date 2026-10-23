import { cx } from "./cx";

/** Indicador de actividad de 8 rayos, como el de iOS. */
export function Spinner({ size = 20, className }: { size?: number; className?: string }) {
  return (
    <span className={cx("ca-spinner", className)} style={{ width: size, height: size }} role="status" aria-label="Cargando">
      {Array.from({ length: 8 }).map((_, i) => (
        <i key={i} style={{ transform: `rotate(${i * 45}deg)`, animationDelay: `${(i - 8) * 0.1}s` }} />
      ))}
    </span>
  );
}

/** Pantalla de carga centrada (reemplaza a Loader). */
export function Loader({ label = "Cargando…" }: { label?: string }) {
  return (
    <div className="ca-loader">
      <Spinner size={28} />
      <p>{label}</p>
    </div>
  );
}

export interface SkeletonProps {
  width?: number | string;
  height?: number | string;
  radius?: number | string;
  /** Si se indica, dibuja N líneas de texto (la última más corta). */
  lines?: number;
  className?: string;
}

/** Bloque de carga con brillo que recorre la superficie. */
export function Skeleton({ width = "100%", height = 16, radius = 8, lines, className }: SkeletonProps) {
  if (lines && lines > 1) {
    return (
      <div className={cx("ca-skeleton-lines", className)}>
        {Array.from({ length: lines }).map((_, i) => (
          <span key={i} className="ca-skeleton" style={{ width: i === lines - 1 ? "62%" : "100%", height, borderRadius: radius }} />
        ))}
      </div>
    );
  }
  return <span className={cx("ca-skeleton", className)} style={{ width, height, borderRadius: radius }} />;
}
