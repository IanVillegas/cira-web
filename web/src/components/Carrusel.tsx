import type { ReactNode } from "react";
import { Icon } from "@/components/aire";
import { tr } from "@/lib/i18n";

interface CarruselProps {
  titulo: string;
  /** Línea corta debajo del título (opcional). */
  subtitulo?: string;
  /** Muestra "Ver todos" junto al título y una tarjeta final con el mismo destino. */
  onVerTodos?: () => void;
  /** Cuántos hay en total (para la tarjeta final "Ver los N"). */
  total?: number;
  children: ReactNode;
}

/**
 * Fila con título y tarjetas que se deslizan a lo ancho (con imán en cada tarjeta).
 * Todas las tarjetas miden lo mismo; se asoma la siguiente para invitar a deslizar.
 */
export function Carrusel({ titulo, subtitulo, onVerTodos, total, children }: CarruselProps) {
  return (
    <section className="ca-carrusel" aria-label={titulo}>
      <div className="ca-carrusel__head">
        <div className="min-w-0">
          <h2 className="aire-text-title-3 text-aire-ink">{titulo}</h2>
          {subtitulo && <p className="aire-text-footnote text-aire-ink-2">{subtitulo}</p>}
        </div>
        {onVerTodos && (
          <button type="button" className="ca-carrusel__more" onClick={onVerTodos}>
            {tr("Ver todos")}
            <Icon name="chevron_forward" size={18} />
          </button>
        )}
      </div>
      <div className="ca-carrusel__rail no-scrollbar">
        {children}
        {onVerTodos && (
          <button type="button" className="ca-carrusel__fin" onClick={onVerTodos}>
            <span className="ca-carrusel__fin-icon">
              <Icon name="arrow_forward" size={24} />
            </span>
            <span className="aire-text-subhead font-semibold">
              {total ? tr("Ver los {n}", { n: total }) : tr("Ver todos")}
            </span>
          </button>
        )}
      </div>
    </section>
  );
}
