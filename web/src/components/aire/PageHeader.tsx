import type { ReactNode } from "react";
import { cx } from "./cx";
import { Icon } from "./Icon";

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  /** Muestra el botón «atrás» (círculo con flecha, a la izquierda del título) y llama a esta función. */
  onBack?: () => void;
  /** Nombre accesible del botón «atrás». */
  backLabel?: string;
  /** Botón circular a la derecha, en la misma línea del título. */
  action?: { icon: string; label: string; onClick: () => void };
  /** Título grande estilo iOS (34px) en vez de 22px. */
  large?: boolean;
  /** Obsoleto: el título ya va en la misma fila que los botones, así que todas las secciones quedan a la misma altura. */
  reserveBar?: boolean;
  children?: ReactNode;
}

/**
 * Encabezado de pantalla: [atrás] título [acción] en una sola fila y el subtítulo
 * debajo del título. El texto entra con un leve desplazamiento al montar.
 */
export function PageHeader({ title, subtitle, onBack, backLabel = "Atrás", action, large = true, children }: PageHeaderProps) {
  return (
    <header className={cx("ca-header", large && "ca-header--large", onBack && "ca-header--back")}>
      <div className="ca-header__row">
        {onBack && (
          <button type="button" className="ca-iconbtn ca-header__back" aria-label={backLabel} onClick={onBack}>
            <Icon name="chevron_backward" size={24} />
          </button>
        )}
        <h1 className="ca-header__title">{title}</h1>
        {action && (
          <button type="button" className="ca-iconbtn ca-header__action" aria-label={action.label} onClick={action.onClick}>
            <Icon name={action.icon} size={22} />
          </button>
        )}
      </div>
      {subtitle && <p className="ca-header__subtitle">{subtitle}</p>}
      {children}
    </header>
  );
}
