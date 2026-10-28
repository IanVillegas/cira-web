import type { CSSProperties } from "react";
import { Badge, Icon } from "@/components/aire";
import { Calificacion } from "./Estrellas";
import { visualDeCategoria } from "@/lib/categorias";
import { formatoColones } from "@/lib/format";
import { tr } from "@/lib/i18n";
import type { Trabajador, Trabajo } from "@/lib/types";

// Tarjetas compactas para los carruseles de Explorar: todas del mismo tamaño y
// con lo justo para decidir. Al tocarlas se abre la hoja con la información completa.

/**
 * Trabajo: como la tarjeta grande, la foto de la categoría se funde en el tono de su
 * categoría y el texto va encima en blanco. Título (2 líneas), pago, zona y distancia.
 */
export function TrabajoMini({ trabajo, onOpen }: { trabajo: Trabajo; onOpen: () => void }) {
  const visual = visualDeCategoria(trabajo.categoria);
  return (
    <button
      type="button"
      className={`ca-mini ca-mini--trabajo ${visual.imagen ? "" : "is-sinfoto"}`}
      style={{ "--ca-photo-tone": visual.tono } as CSSProperties}
      onClick={onOpen}
      aria-label={`${trabajo.titulo}, ${formatoColones.format(trabajo.pago)}`}
    >
      {visual.imagen && (
        <span className="ca-mini__media" aria-hidden="true">
          <img src={visual.imagen} alt="" loading="lazy" decoding="async" />
        </span>
      )}
      {visual.imagen && <span className="ca-mini__fade" aria-hidden="true" />}
      <span className="ca-mini__chips">
        <span className="ca-mini__pill aire-text-eyebrow">
          <Icon name={visual.icono} size={14} />
          {tr(trabajo.categoria)}
        </span>
        {trabajo.urgente && (
          <Badge tone="danger" dot pulse>
            {tr("Urgente")}
          </Badge>
        )}
      </span>
      <span className="ca-mini__body">
        <span className="ca-mini__title aire-text-headline">{trabajo.titulo}</span>
        <span className="ca-mini__price aire-text-headline">
          {trabajo.trueque ? (
            <>
              <Icon name="handshake" size={18} />
              {tr("Trueque")}
              {trabajo.pago > 0 && ` + ${formatoColones.format(trabajo.pago)}`}
            </>
          ) : (
            formatoColones.format(trabajo.pago)
          )}
        </span>
        <span className="ca-mini__meta aire-text-footnote">
          <Icon name="location_on" size={16} />
          <span className="truncate">{trabajo.ubicacion}</span>
          <span className="shrink-0">· {trabajo.distanciaKm} km</span>
        </span>
      </span>
    </button>
  );
}

function iniciales(nombre: string) {
  return nombre
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

/** Trabajador: avatar, nombre, calificación, servicio principal, zona y disponibilidad. */
export function TrabajadorMini({ trabajador, onOpen }: { trabajador: Trabajador; onOpen: () => void }) {
  const [principal, ...otros] = trabajador.servicios;
  const visual = principal ? visualDeCategoria(principal) : null;
  return (
    <button type="button" className="ca-mini ca-mini--trabajador" onClick={onOpen} aria-label={trabajador.nombre}>
      <span className="ca-mini__top">
        <span className="ca-mini__avatar aire-text-headline">{iniciales(trabajador.nombre)}</span>
        {trabajador.deConfianza && (
          <span className="ca-mini__fav" aria-label={tr("De confianza")}>
            <Icon name="favorite" filled size={18} />
          </span>
        )}
      </span>
      <span className="ca-mini__body">
        <span className="ca-mini__name aire-text-headline">{trabajador.nombre}</span>
        <Calificacion valor={trabajador.calificacion} total={trabajador.numCalificaciones} />
        {visual && principal && (
          <span className="ca-mini__service aire-text-footnote">
            <Icon name={visual.icono} size={16} />
            <span className="truncate">{tr(principal)}</span>
            {otros.length > 0 && <span className="shrink-0 text-aire-ink-2">+{otros.length}</span>}
          </span>
        )}
        <span className="ca-mini__meta aire-text-footnote">
          <Icon name="location_on" size={16} />
          <span className="truncate">{trabajador.zona}</span>
          <span className="shrink-0">· {trabajador.distanciaKm} km</span>
        </span>
        <span className="mt-auto">
          <Badge tone={trabajador.disponible ? "success" : "neutral"} dot>
            {trabajador.disponible ? tr("Disponible") : tr("Ocupado")}
          </Badge>
        </span>
      </span>
    </button>
  );
}
