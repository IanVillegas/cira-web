import { useState, type CSSProperties } from "react";
import { useNavigate } from "react-router-dom";
import { Badge, Button, Icon } from "@/components/aire";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { visualDeCategoria } from "@/lib/categorias";
import { fechaTrabajo, limiteTexto } from "@/lib/fechas";
import { formatoColones as formatoPago } from "@/lib/format";
import { tr } from "@/lib/i18n";
import type { Trabajo } from "@/lib/types";

interface JobCardProps {
  trabajo: Trabajo;
  onApply?: (id: string) => void | Promise<unknown>;
  /** Modo urgencia: el primero en aceptar se queda con el trabajo. */
  onAcceptUrgent?: (id: string) => void | Promise<unknown>;
  defaultExpanded?: boolean;
}

/** Link de WhatsApp con el mensaje listo para enviar (canal de captación de usuarios). */
function enlaceWhatsApp(trabajo: Trabajo) {
  const link = `${window.location.origin}/explorar?trabajo=${trabajo.id}`;
  const mensaje = tr("Mira este trabajo en CIRA: {titulo} ({pago}). {link}", {
    titulo: trabajo.titulo,
    pago: formatoPago.format(trabajo.pago),
    link,
  });
  return `https://wa.me/?text=${encodeURIComponent(mensaje)}`;
}

/**
 * Tarjeta de trabajo con la foto de su categoría: la imagen se funde con el tono
 * de la categoría (--aire-cat-*) para que el texto se lea encima. Una acción
 * principal (Postularme o Aceptar urgencia) y tres secundarias de ícono.
 */
export function JobCard({ trabajo, onApply, onAcceptUrgent, defaultExpanded = false }: JobCardProps) {
  const visual = visualDeCategoria(trabajo.categoria);
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [abriendoChat, setAbriendoChat] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const navigate = useNavigate();
  const { usuario } = useAuth();
  // Las urgencias solo las acepta quien tiene la cédula verificada.
  const puedeUrgencias = usuario?.verificacion.cedula.estado === "verificada";

  const comunicarse = async () => {
    setAbriendoChat(true);
    try {
      const conversacion = await api.conversaciones.con(trabajo.publicadorId);
      navigate(`/chats/${conversacion.id}`);
    } finally {
      setAbriendoChat(false);
    }
  };

  const accionPrincipal = async () => {
    const accion = trabajo.urgente ? onAcceptUrgent : onApply;
    if (!accion) return;
    setEnviando(true);
    try {
      await accion(trabajo.id);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <article
      className={`ca-photocard ${visual.imagen ? "" : "is-sinfoto"}`}
      style={{ "--ca-photo-tone": visual.tono } as CSSProperties}
    >
      {visual.imagen && (
        <div className="ca-photocard__media">
          <img src={visual.imagen} alt="" loading="lazy" decoding="async" />
        </div>
      )}
      {visual.imagen && <div className="ca-photocard__fade" aria-hidden="true" />}

      <div className="ca-photocard__top">
        <div className="ca-photocard__stack">
          <span className="ca-photocard__pill aire-text-eyebrow">
            <Icon name={visual.icono} size={16} />
            {tr(trabajo.categoria)}
          </span>
          {trabajo.urgente && (
            <Badge tone="danger" dot pulse>
              {tr("Urgente")}
            </Badge>
          )}
        </div>
        <span className="ca-photocard__pill aire-text-headline">
          {trabajo.trueque ? (
            <>
              <Icon name="handshake" size={18} />
              {tr("Trueque")}
              {trabajo.pago > 0 && ` + ${formatoPago.format(trabajo.pago)}`}
            </>
          ) : (
            formatoPago.format(trabajo.pago)
          )}
        </span>
      </div>

      <div className="ca-photocard__body">
        <div className="grid gap-1">
          <h3 className="aire-text-title-3">{trabajo.titulo}</h3>
          <p className="ca-photocard__meta aire-text-footnote">
            <Icon name="location_on" size={16} />
            {trabajo.ubicacion} · {trabajo.distanciaKm} km
          </p>
          <p className="ca-photocard__meta aire-text-footnote">
            <Icon name="person" size={16} />
            <span className="truncate">{trabajo.publicador}</span>
            {trabajo.publicadorCalificacion === null ? (
              <span>· {tr("Nuevo")}</span>
            ) : (
              <span className="inline-flex items-center gap-0.5">
                · <Icon name="star" filled size={14} className="text-aire-warning" />
                {trabajo.publicadorCalificacion.toFixed(1)}
              </span>
            )}
          </p>
        </div>

        {trabajo.descripcion && (
          <button
            type="button"
            className={`ca-photocard__desc aire-text-subhead ${expanded ? "is-open" : ""}`}
            aria-expanded={expanded}
            onClick={() => setExpanded((v) => !v)}
          >
            {trabajo.descripcion}
          </button>
        )}

        {trabajo.trueque && (
          <div className="ca-photocard__swap">
            <Icon name="handshake" size={18} />
            <span className="grid gap-0.5">
              <span className="aire-text-eyebrow">{tr("Ofrece a cambio")}</span>
              <span className="aire-text-subhead">{trabajo.trueque.ofrece}</span>
              {trabajo.trueque.miPropuesta && (
                <span className="aire-text-footnote" style={{ color: "var(--aire-on-photo-2)" }}>
                  {tr("Tu propuesta: {texto}", { texto: trabajo.trueque.miPropuesta })}
                </span>
              )}
            </span>
          </div>
        )}

        <div className="ca-photocard__tags aire-text-caption">
          <span className="ca-photocard__tag">
            <Icon name="calendar_month" size={14} />
            {fechaTrabajo(trabajo.fecha)}
          </span>
          {trabajo.limite && (
            <span className="ca-photocard__tag">
              <Icon name="timer" size={14} />
              {limiteTexto(trabajo.limite, trabajo.fecha)}
            </span>
          )}
          {(!trabajo.trueque || trabajo.pago > 0) && (
            <span className="ca-photocard__tag">
              <Icon name="payments" size={14} />
              {tr(trabajo.metodoPago)}
            </span>
          )}
          <span className="ca-photocard__tag">
            <Icon name="groups" size={14} />
            {tr("{n} persona(s)", { n: trabajo.postulantes })}
          </span>
        </div>

        <div className="ca-photocard__actions">
          {trabajo.urgente && !puedeUrgencias ? (
            <Button variant="photo-soft" icon="badge" onClick={() => navigate("/cuenta/verificacion")}>
              {tr("Verifica tu cédula")}
            </Button>
          ) : trabajo.urgente ? (
            <Button variant="photo" icon="bolt" loading={enviando} onClick={accionPrincipal}>
              {tr("Aceptar urgencia")}
            </Button>
          ) : (
            <Button variant={trabajo.yaPostulado ? "photo-soft" : "photo"} loading={enviando} onClick={accionPrincipal}>
              {trabajo.yaPostulado ? tr("Retirar") : tr("Postularme")}
            </Button>
          )}
          <button
            type="button"
            className="ca-photocard__iconbtn"
            aria-label={tr("Comunícate")}
            disabled={abriendoChat}
            onClick={comunicarse}
          >
            <Icon name="chat_bubble" size={20} />
          </button>
          <a
            href={enlaceWhatsApp(trabajo)}
            target="_blank"
            rel="noreferrer"
            className="ca-photocard__iconbtn"
            aria-label={tr("Compartir")}
          >
            <Icon name="share" size={20} />
          </a>
          <button type="button" className="ca-photocard__iconbtn" aria-label={tr("Ver en mapa")} onClick={() => navigate("/mapa")}>
            <Icon name="map" size={20} />
          </button>
        </div>
      </div>
    </article>
  );
}
