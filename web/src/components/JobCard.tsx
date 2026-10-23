import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "./ui/Card";
import { Icon } from "./ui/Icon";
import { Button } from "./ui/Button";
import { Calificacion } from "./Estrellas";
import { api } from "@/lib/api";
import { formatoColones as formatoPago } from "@/lib/format";
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
  const mensaje = `Mira este trabajo en CIRA: ${trabajo.titulo} (${formatoPago.format(trabajo.pago)}). ${link}`;
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
    <Card className="mb-3.5 shadow-[0_10px_28px_-14px_rgba(25,28,30,0.22)]">
      <button
        className="flex w-full items-start gap-3 text-left"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-2xl bg-cira-header-icon-bg">
          <Icon name="work" size={28} className="text-cira-accent" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1.5 text-[11px] font-semibold tracking-wider text-cira-accent uppercase">
            {trabajo.categoria}
            {trabajo.urgente && (
              <span className="inline-flex items-center gap-0.5 rounded-full bg-cira-btn-destructive-bg px-1.5 py-0.5 text-[10px] text-cira-btn-destructive-text">
                <Icon name="bolt" filled size={12} />
                URGENTE
              </span>
            )}
          </p>
          <p className="truncate font-semibold text-cira-text-primary">{trabajo.titulo}</p>
        </div>
        <Icon name={expanded ? "expand_less" : "expand_more"} size={20} className="mt-1 shrink-0 text-cira-accent" />
      </button>

      <div className="mt-3.5 space-y-2.5 rounded-2xl bg-cira-input-bg p-3.5">
        <Row icon="location_on" text={`${trabajo.ubicacion} · ${trabajo.distanciaKm} km`} />
        <div className="flex items-center gap-2.5">
          <Icon name="person" size={18} className="text-cira-accent" />
          <span className="truncate text-sm text-cira-text-secondary">{trabajo.publicador}</span>
          <Calificacion valor={trabajo.publicadorCalificacion} />
        </div>
        <Row icon="calendar_month" text={trabajo.fecha} />
        <div className="pt-1">
          <p className="text-[10px] font-semibold tracking-widest text-cira-text-helper">
            PAGO ESTIMADO
          </p>
          <p className="text-xl font-semibold text-cira-accent">
            {formatoPago.format(trabajo.pago)}
          </p>
        </div>
      </div>

      <div className="mt-3 flex flex-col gap-2.5">
        <div className="grid grid-cols-2 gap-3">
          <Button variant="outlined" onClick={comunicarse} disabled={abriendoChat}>
            COMUNÍCATE
          </Button>
          <a
            href={enlaceWhatsApp(trabajo)}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-cira-button border border-cira-btn-outlined-border px-5 py-2.5 text-cira-control font-semibold text-cira-text-primary shadow-[0_6px_14px_rgba(0,0,0,0.10)]"
          >
            <Icon name="share" size={18} />
            COMPARTIR
          </a>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Button variant="outlined" onClick={() => navigate("/mapa")}>
            VER EN MAPA
          </Button>
          {trabajo.urgente ? (
            <Button onClick={() => onAcceptUrgent?.(trabajo.id)}>ACEPTAR URGENCIA</Button>
          ) : (
            <Button
              variant={trabajo.yaPostulado ? "destructive" : "primary"}
              onClick={() => onApply?.(trabajo.id)}
            >
              {trabajo.yaPostulado ? "RETIRAR" : "POSTULARME"}
            </Button>
          )}
        </div>
      </div>

      {expanded && (
        <div className="mt-3.5 space-y-3 border-t border-cira-border pt-3.5">
          <Detail icon="description" label="Descripción" text={trabajo.descripcion} />
          <Detail icon="payments" label="Método de pago" text={trabajo.metodoPago} />
          <Detail icon="groups" label="Postulantes" text={`${trabajo.postulantes} persona(s)`} />
        </div>
      )}
    </Card>
  );
}

function Row({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <Icon name={icon} size={18} className="text-cira-accent" />
      <span className="truncate text-sm text-cira-text-secondary">{text}</span>
    </div>
  );
}

function Detail({ icon, label, text }: { icon: string; label: string; text: string }) {
  return (
    <div className="flex items-start gap-2.5">
      <Icon name={icon} size={19} className="mt-0.5 text-cira-accent" />
      <div>
        <p className="text-sm font-semibold text-cira-text-primary">{label}</p>
        <p className="text-sm text-cira-text-secondary">{text}</p>
      </div>
    </div>
  );
}
