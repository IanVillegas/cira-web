import { useState } from "react";
import { Card } from "./ui/Card";
import { Icon } from "./ui/Icon";
import { Button } from "./ui/Button";
import type { Trabajador } from "@/lib/types";

interface WorkerCardProps {
  trabajador: Trabajador;
  onRequest?: (id: string) => void;
}

/** Réplica de CiraWorkerCard: misma estructura que la tarjeta de trabajo, con botón CONTACTAR. */
export function WorkerCard({ trabajador, onRequest }: WorkerCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card className="mb-3.5 p-[18px] shadow-[0_8px_18px_rgba(0,0,0,0.12)]">
      <button className="flex w-full items-start gap-3 text-left" onClick={() => setExpanded((v) => !v)}>
        <span className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-[14px] bg-cira-header-icon-bg">
          <Icon name="person" size={28} className="text-cira-accent" />
        </span>
        <span className="flex min-w-0 flex-1 flex-col gap-[3px] self-center">
          <span className="truncate text-[11px] font-semibold tracking-[0.08em] text-cira-accent uppercase">
            {trabajador.servicios[0] ?? "Servicio"}
          </span>
          <span className="truncate text-[17px] font-semibold text-cira-text-primary">{trabajador.nombre}</span>
        </span>
        <Icon name={expanded ? "expand_less" : "expand_more"} size={20} className="shrink-0 text-cira-accent" />
      </button>

      <div className="mt-3.5 flex items-center gap-2.5 rounded-2xl bg-cira-input-bg p-3.5">
        <Icon name="location_on" size={18} className="text-cira-accent" />
        <span className="truncate text-[13px] text-cira-text-secondary">
          {trabajador.zona}
          <span className="px-1.5 text-cira-text-helper">·</span>
          {trabajador.distanciaKm} km
        </span>
      </div>

      <Button className="mt-3.5" onClick={() => onRequest?.(trabajador.id)}>
        CONTACTAR
      </Button>

      {expanded && (
        <div className="mt-3.5 flex flex-col gap-3 border-t border-cira-border pt-3.5">
          <Detail icon="person" label="Trabajador" text={trabajador.nombre} />
          <Detail icon="location_on" label="Ubicación" text={trabajador.zona} />
          <Detail icon="design_services" label="Servicios" text={trabajador.servicios.join(", ")} />
          <Detail
            icon="event_available"
            label="Disponibilidad"
            text={trabajador.disponible ? "Disponible" : "Ocupado"}
          />
        </div>
      )}
    </Card>
  );
}

function Detail({ icon, label, text }: { icon: string; label: string; text: string }) {
  return (
    <div className="flex items-start gap-2.5">
      <Icon name={icon} size={19} className="mt-0.5 text-cira-accent" />
      <div className="flex flex-col gap-0.5">
        <span className="text-[13px] font-semibold text-cira-text-primary">{label}</span>
        <span className="text-[13px] text-cira-text-secondary">{text}</span>
      </div>
    </div>
  );
}
