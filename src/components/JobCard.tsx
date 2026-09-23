import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "./ui/Card";
import { Icon } from "./ui/Icon";
import { Button } from "./ui/Button";
import type { Trabajo } from "@/lib/types";

interface JobCardProps {
  trabajo: Trabajo;
  onApply?: (id: string) => void;
  onContact?: (id: string) => void;
}

const formatoPago = new Intl.NumberFormat("es-CR", {
  style: "currency",
  currency: "CRC",
  maximumFractionDigits: 0,
});

export function JobCard({ trabajo, onApply, onContact }: JobCardProps) {
  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate();

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
          <p className="text-[11px] font-semibold tracking-wider text-cira-accent uppercase">
            {trabajo.categoria}
          </p>
          <p className="truncate font-semibold text-cira-text-primary">{trabajo.titulo}</p>
        </div>
        <Icon name={expanded ? "expand_less" : "expand_more"} size={20} className="mt-1 shrink-0 text-cira-accent" />
      </button>

      <div className="mt-3.5 space-y-2.5 rounded-2xl bg-cira-input-bg p-3.5">
        <Row icon="location_on" text={`${trabajo.ubicacion} · ${trabajo.distanciaKm} km`} />
        <Row icon="person" text={trabajo.publicador} />
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
        <Button variant="outlined" onClick={() => onContact?.(trabajo.id)}>
          Comunícate
        </Button>
        <div className="grid grid-cols-2 gap-3">
          <Button variant="outlined" onClick={() => navigate("/mapa")}>
            Ver en mapa
          </Button>
          <Button
            variant={trabajo.yaPostulado ? "destructive" : "primary"}
            onClick={() => onApply?.(trabajo.id)}
          >
            {trabajo.yaPostulado ? "Retirar" : "Postularme"}
          </Button>
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
