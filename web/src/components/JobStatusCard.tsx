import type { ReactNode } from "react";
import { Icon } from "./ui/Icon";

export interface StatusBadge {
  text: string;
  /** Color de fondo y de texto del badge (hex). */
  bg: string;
  color: string;
}

interface JobStatusCardProps {
  titulo: string;
  publicador?: string;
  fecha: string;
  badge: StatusBadge;
  /** Color del ícono de trabajo (acento en "Mis trabajos", gris en el historial). */
  iconClassName?: string;
  actions?: ReactNode;
}

/** Tarjeta de "Mis trabajos" / "Historial" (Border radio 14, padding 14, ícono 46 a la derecha). */
export function JobStatusCard({
  titulo,
  publicador,
  fecha,
  badge,
  iconClassName = "text-cira-accent",
  actions,
}: JobStatusCardProps) {
  return (
    <div className="mb-3 flex items-stretch gap-3 rounded-[14px] bg-cira-card p-3.5">
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <p className="text-base font-semibold text-cira-text-primary">{titulo}</p>
        {publicador && <p className="text-[13px] text-cira-text-secondary">{publicador}</p>}
        <p className="text-xs text-cira-text-helper">{fecha}</p>
        <span
          className="self-start rounded-lg px-2 py-[3px] text-[11px] font-semibold"
          style={{ backgroundColor: badge.bg, color: badge.color }}
        >
          {badge.text}
        </span>
      </div>

      <div className="flex shrink-0 flex-col items-end justify-center gap-2">
        <span className="flex h-[46px] w-[46px] items-center justify-center rounded-[14px] bg-cira-header-icon-bg">
          <Icon name="work" size={27} className={iconClassName} />
        </span>
        {actions && <div className="flex gap-2">{actions}</div>}
      </div>
    </div>
  );
}

/** Botón cuadrado de 34 px con ícono (iniciar / completar / cancelar). */
export function CardAction({
  icon,
  onClick,
  label,
  destructive = false,
}: {
  icon: string;
  onClick: () => void;
  label: string;
  destructive?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className={`flex h-[34px] w-[34px] items-center justify-center rounded-[10px] ${
        destructive
          ? "bg-cira-btn-destructive-bg text-cira-btn-destructive-text"
          : "bg-cira-nav-selected-bg text-cira-accent"
      }`}
    >
      <Icon name={icon} size={20} />
    </button>
  );
}
