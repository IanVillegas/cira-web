import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Badge, Button, Card, Icon } from "@/components/aire";
import { Calificacion } from "./Estrellas";
import { api } from "@/lib/api";
import { formatoColones as formatoPago } from "@/lib/format";
import { tr } from "@/lib/i18n";
import type { Trabajo } from "@/lib/types";

interface JobCardProps {
  trabajo: Trabajo;
  onApply?: (id: string) => void;
  /** Modo urgencia: el primero en aceptar se queda con el trabajo. */
  onAcceptUrgent?: (id: string) => void;
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

export function JobCard({ trabajo, onApply, onAcceptUrgent, defaultExpanded = false }: JobCardProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [abriendoChat, setAbriendoChat] = useState(false);
  const navigate = useNavigate();

  const comunicarse = async () => {
    setAbriendoChat(true);
    try {
      const conversacion = await api.conversaciones.con(trabajo.publicadorId);
      navigate(`/chats/${conversacion.id}`);
    } finally {
      setAbriendoChat(false);
    }
  };

  return (
    <Card className="grid gap-4">
      <button
        type="button"
        aria-expanded={expanded}
        className="flex w-full items-start gap-3 text-left"
        onClick={() => setExpanded((v) => !v)}
      >
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-aire-md bg-aire-accent-soft">
          <Icon name="work" size={26} className="text-aire-accent-text" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-1.5">
            <span className="aire-text-eyebrow text-aire-accent-text">{tr(trabajo.categoria)}</span>
            {trabajo.urgente && (
              <Badge tone="danger" dot pulse>
                {tr("Urgente")}
              </Badge>
            )}
          </span>
          <span className="aire-text-headline block text-aire-ink">{trabajo.titulo}</span>
        </span>
        <Icon
          name="expand_more"
          size={22}
          className={`mt-1 shrink-0 text-aire-ink-2 transition-transform duration-[320ms] ease-aire-spring ${expanded ? "rotate-180" : ""}`}
        />
      </button>

      <div className="grid gap-2">
        <Fila icon="location_on">
          {trabajo.ubicacion} · {trabajo.distanciaKm} km
        </Fila>
        <Fila icon="person">
          <span className="truncate">{trabajo.publicador}</span>
          <Calificacion valor={trabajo.publicadorCalificacion} />
        </Fila>
        <Fila icon="calendar_month">{tr(trabajo.fecha)}</Fila>
      </div>

      <div>
        <p className="aire-text-eyebrow text-aire-ink-2">{tr("Pago estimado")}</p>
        <p className="aire-text-figure text-aire-ink">{formatoPago.format(trabajo.pago)}</p>
      </div>

      <div className="grid gap-2.5">
        {trabajo.urgente ? (
          <Button icon="bolt" onClick={() => onAcceptUrgent?.(trabajo.id)}>
            {tr("Aceptar urgencia")}
          </Button>
        ) : (
          <Button variant={trabajo.yaPostulado ? "destructive" : "primary"} onClick={() => onApply?.(trabajo.id)}>
            {trabajo.yaPostulado ? tr("Retirar") : tr("Postularme")}
          </Button>
        )}
        <div className="grid grid-cols-2 gap-2.5">
          <Button variant="secondary" icon="chat_bubble" loading={abriendoChat} onClick={comunicarse}>
            {tr("Comunícate")}
          </Button>
          <a href={enlaceWhatsApp(trabajo)} target="_blank" rel="noreferrer" className="ca-btn ca-btn--secondary ca-btn--md ca-btn--full">
            <span className="ca-btn__label">
              <Icon name="share" size={20} />
              {tr("Compartir")}
            </span>
          </a>
        </div>
        <Button variant="plain" icon="map" onClick={() => navigate("/mapa")}>
          {tr("Ver en mapa")}
        </Button>
      </div>

      <div
        className="grid transition-[grid-template-rows] duration-[320ms] ease-aire-spring"
        style={{ gridTemplateRows: expanded ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">
          <div className="grid gap-3 border-t border-aire-hairline pt-4">
            <Detalle icon="description" label={tr("Descripción")} text={trabajo.descripcion || "—"} />
            <Detalle icon="payments" label={tr("Método de pago")} text={tr(trabajo.metodoPago)} />
            <Detalle icon="groups" label={tr("Postulantes")} text={tr("{n} persona(s)", { n: trabajo.postulantes })} />
          </div>
        </div>
      </div>
    </Card>
  );
}

function Fila({ icon, children }: { icon: string; children: React.ReactNode }) {
  return (
    <div className="aire-text-subhead flex min-w-0 items-center gap-2.5 text-aire-ink-2">
      <Icon name={icon} size={20} className="shrink-0 text-aire-accent-text" />
      {children}
    </div>
  );
}

function Detalle({ icon, label, text }: { icon: string; label: string; text: string }) {
  return (
    <div className="flex items-start gap-2.5">
      <Icon name={icon} size={20} className="mt-0.5 text-aire-accent-text" />
      <div>
        <p className="aire-text-subhead font-semibold text-aire-ink">{label}</p>
        <p className="aire-text-subhead text-aire-ink-2">{text}</p>
      </div>
    </div>
  );
}
