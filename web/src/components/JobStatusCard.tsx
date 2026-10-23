import type { ReactNode } from "react";
import { Badge, Card, Icon } from "@/components/aire";
import type { BadgeTone } from "@/components/aire/Badge";

export type EstadoTono = BadgeTone;

interface JobStatusCardProps {
  titulo: string;
  publicador?: string;
  fecha: string;
  /** Texto y tono del estado. */
  estado: { text: string; tone: EstadoTono };
  /** Ícono gris en el historial, acento en "Mis trabajos". */
  apagado?: boolean;
  actions?: ReactNode;
  /** Contenido a todo el ancho debajo de la tarjeta (seguimiento, botones largos). */
  footer?: ReactNode;
}

/** Tarjeta de "Mis trabajos" y del historial. */
export function JobStatusCard({ titulo, publicador, fecha, estado, apagado = false, actions, footer }: JobStatusCardProps) {
  return (
    <Card className="grid gap-3">
      <div className="flex items-start gap-3">
        <span
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-aire-md ${
            apagado ? "bg-aire-surface-3 text-aire-ink-2" : "bg-aire-accent-soft text-aire-accent-text"
          }`}
        >
          <Icon name="work" size={26} />
        </span>
        <div className="grid min-w-0 flex-1 gap-1">
          <p className="aire-text-headline truncate text-aire-ink">{titulo}</p>
          {publicador && <p className="aire-text-subhead truncate text-aire-ink-2">{publicador}</p>}
          <p className="aire-text-footnote text-aire-ink-2">{fecha}</p>
          <span className="mt-0.5 self-start">
            <Badge tone={estado.tone}>{estado.text}</Badge>
          </span>
        </div>
        {actions && <div className="flex shrink-0 gap-2">{actions}</div>}
      </div>
      {footer && <div className="grid gap-3">{footer}</div>}
    </Card>
  );
}

/** Botón circular con ícono (escribir, cancelar…). */
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
      type="button"
      onClick={onClick}
      aria-label={label}
      className="ca-iconbtn"
      style={{ color: destructive ? "var(--aire-danger-text)" : "var(--aire-accent-text)" }}
    >
      <Icon name={icon} size={22} />
    </button>
  );
}
