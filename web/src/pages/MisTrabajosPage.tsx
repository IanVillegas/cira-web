import { useEffect, useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { ExploreTabs } from "@/components/ui/ExploreTabs";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Icon } from "@/components/ui/Icon";
import { EmptyState } from "@/components/ui/EmptyState";
import { Loader } from "@/components/ui/Loader";
import { api } from "@/lib/api";
import type { EstadoTrabajo, Trabajo } from "@/lib/types";

const tonoPorEstado: Record<EstadoTrabajo, "accent" | "success" | "warning" | "danger" | "neutral"> = {
  Pendiente: "warning",
  Asignado: "accent",
  "En progreso": "accent",
  Finalizado: "success",
  Cancelado: "danger",
};

export function MisTrabajosPage() {
  const [misTrabajos, setMisTrabajos] = useState<Trabajo[] | null>(null);

  useEffect(() => {
    api.trabajos
      .listar({ postulado: true })
      .then(setMisTrabajos)
      .catch(() => setMisTrabajos([]));
  }, []);

  return (
    <div className="pb-4">
      <PageHeader title="Mis trabajos" subtitle="Consulta y gestiona tus trabajos activos." icon="work" />
      <ExploreTabs />

      <div className="px-5 pt-4">
        {misTrabajos === null ? (
          <Loader label="Cargando tus trabajos..." />
        ) : misTrabajos.length === 0 ? (
          <EmptyState
            title="No tienes trabajos activos"
            message="Aquí aparecerán los trabajos que estés realizando."
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
