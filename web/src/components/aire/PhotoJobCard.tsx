import { useState, type CSSProperties } from "react";
import { Button } from "./Button";
import { Icon } from "./Icon";
import { visualDeCategoria } from "@/lib/categorias";
import type { Trabajo } from "@/lib/types";

export interface PhotoJobCardProps {
  trabajo: Trabajo;
  /** Postularse o retirar la postulación. Sin esta función no se muestra el botón. */
  onApply?: (id: string) => Promise<unknown> | void;
  onContact?: (id: string) => void;
  onMap?: (id: string) => void;
}

const colones = new Intl.NumberFormat("es-CR", { maximumFractionDigits: 0 });
const formatoPago = (monto: number) => `₡${colones.format(monto).replace(/\s|\./g, " ")}`;

/**
 * Tarjeta de trabajo con la foto de su categoría: la imagen se funde con el
 * tono de la categoría para que el texto se lea encima. Una sola acción
 * principal (Postularme) y dos secundarias de ícono (chat y mapa).
 */
export function PhotoJobCard({ trabajo, onApply, onContact, onMap }: PhotoJobCardProps) {
  const visual = visualDeCategoria(trabajo.categoria);
  const [abierta, setAbierta] = useState(false);
  const [enviando, setEnviando] = useState(false);

  const postular = async () => {
    if (!onApply) return;
    setEnviando(true);
    try {
      await onApply(trabajo.id);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <article className="ca-photocard" style={{ "--ca-photo-tone": visual.tono } as CSSProperties}>
      {visual.imagen && (
        <div className="ca-photocard__media">
          <img src={visual.imagen} alt="" loading="lazy" decoding="async" />
        </div>
      )}
      <div className="ca-photocard__fade" aria-hidden="true" />

      <div className="ca-photocard__top">
        <span className="ca-photocard__pill aire-text-eyebrow">
          <Icon name={visual.icono} size={16} />
          {trabajo.categoria}
        </span>
        <span className="ca-photocard__pill aire-text-headline">{formatoPago(trabajo.pago)}</span>
      </div>

      <div className="ca-photocard__body">
        <div className="grid gap-1">
          <h3 className="aire-text-title-3">{trabajo.titulo}</h3>
          <p className="ca-photocard__meta aire-text-footnote">
            <Icon name="location_on" size={16} />
            {trabajo.ubicacion} · {trabajo.distanciaKm} km
          </p>
        </div>

        <button
          type="button"
          className={`ca-photocard__desc aire-text-subhead ${abierta ? "is-open" : ""}`}
          aria-expanded={abierta}
          onClick={() => setAbierta((v) => !v)}
        >
          {trabajo.descripcion}
        </button>

        <div className="ca-photocard__tags aire-text-caption">
          <span className="ca-photocard__tag">
            <Icon name="calendar_month" size={14} />
            {trabajo.fecha}
          </span>
          <span className="ca-photocard__tag">
            <Icon name="payments" size={14} />
            {trabajo.metodoPago}
          </span>
          <span className="ca-photocard__tag">
            <Icon name="group" size={14} />
            {trabajo.postulantes} {trabajo.postulantes === 1 ? "postulante" : "postulantes"}
          </span>
          {abierta && (
            <span className="ca-photocard__tag">
              <Icon name="person" size={14} />
              {trabajo.publicador}
            </span>
          )}
        </div>

        <div className="ca-photocard__actions">
          {onApply && (
            <Button variant={trabajo.yaPostulado ? "photo-soft" : "photo"} loading={enviando} onClick={postular}>
              {trabajo.yaPostulado ? "Retirar postulación" : "Postularme"}
            </Button>
          )}
          {onContact && (
            <button type="button" className="ca-photocard__iconbtn" aria-label="Contactar" onClick={() => onContact(trabajo.id)}>
              <Icon name="chat_bubble" size={20} />
            </button>
          )}
          {onMap && (
            <button type="button" className="ca-photocard__iconbtn" aria-label="Ver en el mapa" onClick={() => onMap(trabajo.id)}>
              <Icon name="map" size={20} />
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
