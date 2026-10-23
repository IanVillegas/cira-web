import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Badge, Button, Card, Icon } from "@/components/aire";
import { Calificacion } from "./Estrellas";
import { InsigniaChips } from "./InsigniaChips";
import { api } from "@/lib/api";
import { tr } from "@/lib/i18n";
import type { Trabajador } from "@/lib/types";

interface WorkerCardProps {
  trabajador: Trabajador;
}

/** Tarjeta de trabajador: reputación, insignias y acciones para ver el perfil o contactar. */
export function WorkerCard({ trabajador }: WorkerCardProps) {
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
      <button type="button" aria-expanded={expanded} className="flex w-full items-start gap-3 text-left" onClick={() => setExpanded((v) => !v)}>
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-aire-md bg-aire-accent-soft">
          <Icon name="person" size={26} className="text-aire-accent-text" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="aire-text-eyebrow block truncate text-aire-accent-text">{tr(trabajador.servicios[0] ?? "Servicio")}</span>
          <span className="flex items-center gap-2">
            <span className="aire-text-headline truncate text-aire-ink">{trabajador.nombre}</span>
            <Calificacion valor={trabajador.calificacion} total={trabajador.numCalificaciones} />
          </span>
        </span>
        <Icon
          name="expand_more"
          size={22}
          className={`mt-1 shrink-0 text-aire-ink-2 transition-transform duration-[320ms] ease-aire-spring ${expanded ? "rotate-180" : ""}`}
        />
      </button>

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

      {trabajador.insignias.length > 0 && <InsigniaChips insignias={trabajador.insignias} compact />}

      <div className="grid grid-cols-2 gap-2.5">
        <Button variant="secondary" onClick={() => navigate(`/usuarios/${trabajador.id}`)}>
          {tr("Ver perfil")}
        </Button>
        <Button icon="chat_bubble" loading={abriendoChat} onClick={contactar}>
          {tr("Contactar")}
        </Button>
      </div>

      <div className="grid transition-[grid-template-rows] duration-[320ms] ease-aire-spring" style={{ gridTemplateRows: expanded ? "1fr" : "0fr" }}>
        <div className="overflow-hidden">
          <div className="grid gap-3 border-t border-aire-hairline pt-4">
            <Detalle icon="location_on" label={tr("Ubicación")} text={trabajador.zona} />
            <Detalle icon="design_services" label={tr("Servicios")} text={trabajador.servicios.map((s) => tr(s)).join(", ")} />
          </div>
        </div>
      </div>
    </Card>
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
