import { useEffect, useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { Loader } from "@/components/ui/Loader";
import { JobStatusCard, type StatusBadge } from "@/components/JobStatusCard";
import { api } from "@/lib/api";
import type { HistorialItem } from "@/lib/types";

// Colores de HistorialTrabajosPage.xaml.cs
function badgeDe(estado: HistorialItem["estado"]): StatusBadge {
  if (estado === "Finalizado") return { text: "Completado", bg: "#E8F5E9", color: "#2E7D32" };
  if (estado === "Cancelado") return { text: "Cancelado", bg: "#FFE8EC", color: "#D94B5F" };
  return { text: estado, bg: "#F6F8FB", color: "#464555" };
}

export function HistorialTrabajosPage() {
  const [historial, setHistorial] = useState<HistorialItem[] | null>(null);

  useEffect(() => {
    api.historial.listar().then(setHistorial).catch(() => setHistorial([]));
  }, []);

  return (
    <div className="pb-4">
      <PageHeader
        title="Historial de trabajos"
        subtitle="Consulta tus trabajos finalizados y cancelados."
        icon="history"
        showBack
      />

      <div className="px-5 pt-2">
        {historial === null ? (
          <Loader label="Cargando historial..." />
        ) : historial.length === 0 ? (
          <EmptyState
            title="Sin historial de trabajos"
            message="Aquí aparecerán los trabajos que hayas completado o cancelado."
          />
        ) : (
          historial.map((h) => (
            <JobStatusCard
              key={h.id}
              titulo={h.titulo}
              publicador={h.contraparte}
              fecha={h.fecha}
              badge={badgeDe(h.estado)}
              iconClassName="text-cira-text-helper"
            />
          ))
        )}
      </div>
    </div>
  );
}
