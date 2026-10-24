import type { CSSProperties } from "react";
import { Icon } from "@/components/aire";
import { visualDeCategoria } from "@/lib/categorias";
import { tr } from "@/lib/i18n";

/** Miniatura cuadrada con la foto de la categoría (o su ícono sobre el tono si no tiene foto). */
export function CategoriaThumb({ categoria, apagado = false }: { categoria: string; apagado?: boolean }) {
  const visual = visualDeCategoria(categoria);
  return (
    <span
      className={`ca-catthumb ${apagado ? "is-off" : ""}`}
      style={{ "--ca-photo-tone": visual.tono } as CSSProperties}
      aria-hidden="true"
    >
      {visual.imagen ? <img src={visual.imagen} alt="" loading="lazy" decoding="async" /> : <Icon name={visual.icono} size={24} />}
    </span>
  );
}

/** Chip de servicio con la foto de su categoría en miniatura. */
export function CategoriaChip({ categoria }: { categoria: string }) {
  const visual = visualDeCategoria(categoria);
  return (
    <span className="ca-catchip aire-text-caption">
      <span className="ca-catthumb" style={{ "--ca-photo-tone": visual.tono } as CSSProperties} aria-hidden="true">
        {visual.imagen ? <img src={visual.imagen} alt="" loading="lazy" decoding="async" /> : <Icon name={visual.icono} size={14} />}
      </span>
      {tr(categoria)}
    </span>
  );
}
