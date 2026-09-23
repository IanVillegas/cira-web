import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { historialMock } from "@/lib/mockData";

const formatoPago = new Intl.NumberFormat("es-CR", {
  style: "currency",
  currency: "CRC",
  maximumFractionDigits: 0,
});

export function HistorialTrabajosPage() {
  return (
    <div className="pb-4">
      <PageHeader title="Historial" subtitle="Registro de trabajos realizados." icon="history" showBack />

      <div className="px-5">
        {historialMock.length === 0 ? (
          <EmptyState
            icon="history"
            title="Sin historial"
            message="Cuando completes trabajos aparecerán aquí."
          />
        ) : (
          historialMock.map((h) => (
            <Card key={h.id} className="mb-3.5 flex items-center justify-between">
              <div>
                <p className="font-semibold text-cira-text-primary">{h.titulo}</p>
                <p className="text-sm text-cira-text-secondary">
                  {h.contraparte} · {h.fecha}
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-cira-accent">{formatoPago.format(h.pago)}</p>
                <Badge tone={h.estado === "Finalizado" ? "success" : "danger"}>{h.estado}</Badge>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
