import type { ReactNode } from "react";
import { cx } from "./cx";
import { Icon } from "./Icon";

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  /** Muestra el botón «atrás» y llama a esta función (p. ej. () => navigate(-1)). */
  onBack?: () => void;
  backLabel?: string;
  /** Botón circular a la derecha. */
  action?: { icon: string; label: string; onClick: () => void };
  /** Título grande estilo iOS (34px) en vez de 22px. */
  large?: boolean;
  children?: ReactNode;
}

/** Encabezado de pantalla; el título entra con un leve desplazamiento al montar. */
export function PageHeader({ title, subtitle, onBack, backLabel = "Atrás", action, large = true, children }: PageHeaderProps) {
  return (
    <header className={cx("ca-header", large && "ca-header--large")}>
      {(onBack || action) && (
        <div className="ca-header__bar">
          {onBack ? (
            <button type="button" className="ca-header__back" onClick={onBack}>
              <Icon name="chevron_backward" size={26} />
              <span>{backLabel}</span>
            </button>
          ) : (
            <span />
          )}
          {action && (
            <button type="button" className="ca-iconbtn" aria-label={action.label} onClick={action.onClick}>
              <Icon name={action.icon} size={22} />
            </button>
          )}
        </div>
      )}
      <div className="ca-header__titles">
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {children}
    </header>
  );
}
