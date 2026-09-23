import { Card } from "./ui/Card";
import { Icon } from "./ui/Icon";
import { Button } from "./ui/Button";
import { Badge } from "./ui/Badge";
import type { Trabajador } from "@/lib/types";

interface WorkerCardProps {
  trabajador: Trabajador;
  onRequest?: (id: string) => void;
}

export function WorkerCard({ trabajador, onRequest }: WorkerCardProps) {
  return (
    <Card className="mb-3.5 flex items-center gap-3.5">
      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-cira-secondary text-lg font-semibold text-cira-accent">
        {trabajador.nombre
          .split(" ")
          .map((n) => n[0])
          .slice(0, 2)
          .join("")}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate font-semibold text-cira-text-primary">{trabajador.nombre}</p>
          {trabajador.disponible ? (
            <Badge tone="success">Disponible</Badge>
          ) : (
            <Badge tone="neutral">Ocupado</Badge>
          )}
        </div>
        <p className="truncate text-sm text-cira-text-secondary">
          {trabajador.servicios.join(" · ")}
        </p>
        <div className="mt-1 flex items-center gap-3 text-xs text-cira-text-helper">
          <span className="flex items-center gap-1">
            <Icon name="location_on" size={14} /> {trabajador.distanciaKm} km
          </span>
          <span className="flex items-center gap-1">
            <Icon name="star" size={14} className="text-amber-500" filled /> {trabajador.calificacion}
          </span>
        </div>
      </div>

      <Button
        variant="secondary"
        className="!px-4 !py-2 shrink-0"
        onClick={() => onRequest?.(trabajador.id)}
      >
        Contactar
      </Button>
    </Card>
  );
}
