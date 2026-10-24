import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Badge, Button, Card, Icon } from "@/components/aire";
import { CategoriaChip } from "./CategoriaThumb";
import { ConfianzaButton } from "./ConfianzaButton";
import { Calificacion } from "./Estrellas";
import { InsigniaChips } from "./InsigniaChips";
import { api } from "@/lib/api";
import { compartirPerfil } from "@/lib/compartir";
import { tr } from "@/lib/i18n";
import type { Trabajador } from "@/lib/types";

interface WorkerCardProps {
  trabajador: Trabajador;
  /** Se llama al agregarlo o quitarlo de "De confianza". */
  onChange?: (trabajador: Trabajador) => void;
  /** "confianza": la acción principal es Recontratar (lista De confianza). */
  modo?: "explorar" | "confianza";
}

/** Tarjeta de trabajador: reputación, insignias y acciones para ver el perfil o contactar. */
export function WorkerCard({ trabajador, onChange, modo = "explorar" }: WorkerCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [abriendoChat, setAbriendoChat] = useState(false);
  const navigate = useNavigate();

  const contactar = async () => {
    setAbriendoChat(true);
    try {
      const conversacion = await api.conversaciones.con(trabajador.id);
      navigate(`/chats/${conversacion.id}`);
    } finally {
      setAbriendoChat(false);
    }
  };

  return (
    <Card className="grid gap-4">
      <div className="flex items-start gap-2">
        <button type="button" aria-expanded={expanded} className="flex min-w-0 flex-1 items-start gap-3 text-left" onClick={() => setExpanded((v) => !v)}>
          <span className="aire-text-headline flex h-12 w-12 shrink-0 items-center justify-center rounded-aire-full bg-aire-accent-soft text-aire-accent-text">
            {iniciales(trabajador.nombre)}
          </span>
          <span className="min-w-0 flex-1 self-center">
            <span className="flex items-center gap-2">
              <span className="aire-text-headline truncate text-aire-ink">{trabajador.nombre}</span>
              <Calificacion valor={trabajador.calificacion} total={trabajador.numCalificaciones} />
            </span>
          </span>
          <Icon
            name="expand_more"
            size={22}
            className={`mt-3 shrink-0 text-aire-ink-2 transition-transform duration-[320ms] ease-aire-spring ${expanded ? "rotate-180" : ""}`}
          />
        </button>
        <ConfianzaButton trabajador={trabajador} onChange={onChange} />
      </div>

      <div className="aire-text-subhead flex items-center gap-2.5 text-aire-ink-2">
        <Icon name="location_on" size={20} className="shrink-0 text-aire-accent-text" />
        <span className="truncate">
          {trabajador.zona} · {trabajador.distanciaKm} km
        </span>
        <span className="ml-auto shrink-0">
          <Badge tone={trabajador.disponible ? "success" : "neutral"} dot>
            {trabajador.disponible ? tr("Disponible") : tr("Ocupado")}
          </Badge>
        </span>
      </div>

      {trabajador.servicios.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {trabajador.servicios.map((s) => (
            <CategoriaChip key={s} categoria={s} />
          ))}
        </div>
      )}

      {trabajador.insignias.length > 0 && <InsigniaChips insignias={trabajador.insignias} compact />}

      {modo === "confianza" ? (
        <div className="grid gap-2.5">
          <Button icon="replay" onClick={() => navigate(`/crear-trabajo?para=${trabajador.id}`)}>
            {tr("Recontratar")}
          </Button>
          <div className="grid grid-cols-2 gap-2.5">
            <Button variant="secondary" icon="chat_bubble" loading={abriendoChat} onClick={contactar}>
              {tr("Chatear")}
            </Button>
            <Button variant="secondary" icon="share" onClick={() => compartirPerfil(trabajador)}>
              {tr("Recomendar")}
            </Button>
          </div>
          <Button variant="plain" onClick={() => navigate(`/usuarios/${trabajador.id}`)}>
            {tr("Ver perfil")}
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2.5">
          <Button variant="secondary" onClick={() => navigate(`/usuarios/${trabajador.id}`)}>
            {tr("Ver perfil")}
          </Button>
          <Button icon="chat_bubble" loading={abriendoChat} onClick={contactar}>
            {tr("Contactar")}
          </Button>
        </div>
      )}

      <div className="grid transition-[grid-template-rows] duration-[320ms] ease-aire-spring" style={{ gridTemplateRows: expanded ? "1fr" : "0fr" }}>
        <div className="overflow-hidden">
          <div className="grid gap-3 border-t border-aire-hairline pt-4">
            <Detalle icon="location_on" label={tr("Ubicación")} text={trabajador.zona} />
          </div>
        </div>
      </div>
    </Card>
  );
}

/** "Douglas Solano" → "DS". */
function iniciales(nombre: string) {
  return nombre
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
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
