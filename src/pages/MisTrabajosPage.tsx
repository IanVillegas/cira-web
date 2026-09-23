import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Icon } from "@/components/ui/Icon";
import { EmptyState } from "@/components/ui/EmptyState";
import { trabajosMock } from "@/lib/mockData";
import type { EstadoTrabajo } from "@/lib/types";

const tonoPorEstado: Record<EstadoTrabajo, "accent" | "success" | "warning" | "danger" | "neutral"> = {
  Pendiente: "warning",
  Asignado: "accent",
  "En progreso": "accent",
  Finalizado: "success",
  Cancelado: "danger",
};

export function MisTrabajosPage() {
  const misTrabajos = trabajosMock.filter((t) => t.yaPostulado);

  return (
    <div className="pb-4">
      <PageHeader title="Mis trabajos" subtitle="Postulaciones y trabajos en curso." icon="work_history" />

      <div className="px-5">
        {misTrabajos.length === 0 ? (
          <EmptyState
            icon="assignment"
            title="Sin trabajos activos"
            message="Postulate a un trabajo para verlo aquí."
          />
        ) : (
          misTrabajos.map((t) => (
            <Card key={t.id} className="mb-3.5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-cira-text-primary">{t.titulo}</p>
                  <p className="text-sm text-cira-text-secondary">{t.publicador}</p>
                </div>
                <Badge tone={tonoPorEstado[t.estado]}>{t.estado}</Badge>
              </div>
              <div className="mt-3 flex items-center gap-2 text-sm text-cira-text-secondary">
                <Icon name="calendar_month" size={16} className="text-cira-accent" />
                {t.fecha}
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
