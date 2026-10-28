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
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <span className="aire-text-headline flex h-12 w-12 shrink-0 items-center justify-center rounded-aire-full bg-aire-accent-soft text-aire-accent-text">
            {iniciales(trabajador.nombre)}
          </span>
          <span className="min-w-0 flex-1 self-center">
            <span className="flex items-center gap-2">
              <span className="aire-text-headline truncate text-aire-ink">{trabajador.nombre}</span>
              <Calificacion valor={trabajador.calificacion} total={trabajador.numCalificaciones} />
            </span>
          </span>
        </div>
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
