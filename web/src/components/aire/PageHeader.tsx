import { useEffect, type ReactNode } from "react";
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
  /**
   * "banda" (por defecto): franja del color de CIRA con el título, el subtítulo y los botones
   * encima, y el contenido empieza en una lámina redondeada. "simple": sin franja (Perfil).
   */
  variante?: "banda" | "simple";
  children?: ReactNode;
}

/**
 * Encabezado de pantalla: [atrás] título [acción] en una sola fila y el subtítulo
 * debajo del título, sobre una franja del color de CIRA. El texto entra con un leve
 * desplazamiento al montar.
 */
export function PageHeader({ title, subtitle, onBack, backLabel = "Atrás", action, large = true, variante = "banda", children }: PageHeaderProps) {
  // Con la franja, la barra del navegador del teléfono toma el mismo color (y vuelve al salir).
  useEffect(() => {
    if (variante !== "banda") return;
    const meta = document.querySelector('meta[name="theme-color"]');
    if (!meta) return;
    const anterior = meta.getAttribute("content");
    const acento = getComputedStyle(document.documentElement).getPropertyValue("--aire-accent").trim();
    if (acento) meta.setAttribute("content", acento);
    return () => {
      if (anterior) meta.setAttribute("content", anterior);
    };
  }, [variante]);

  return (
    <header className={cx("ca-header", large && "ca-header--large", onBack && "ca-header--back", variante === "banda" && "ca-header--banda")}>
      <div className="ca-header__row">
        {onBack && (
          <button type="button" className="ca-iconbtn ca-header__back" aria-label={backLabel} onClick={onBack}>
            <Icon name="chevron_backward" size={24} />
          </button>
        )}
        {/* key: al cambiar el título (pestañas de Mis secciones) el texto vuelve a entrar suave. */}
        <h1 key={title} className="ca-header__title">
          {title}
        </h1>
        {action && (
          <button type="button" className="ca-iconbtn ca-header__action" aria-label={action.label} onClick={action.onClick}>
            <Icon name={action.icon} size={22} />
          </button>
        )}
      </div>
      {subtitle && (
        <p key={subtitle} className="ca-header__subtitle">
          {subtitle}
        </p>
      )}
      {children}
    </header>
  );
}
