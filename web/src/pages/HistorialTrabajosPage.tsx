import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader, PageHeader, Stagger } from "@/components/aire";
import { JobStatusCard, type EstadoTono } from "@/components/JobStatusCard";
import { Vacio } from "@/components/Vacio";
import { api } from "@/lib/api";
import { tr } from "@/lib/i18n";
import type { HistorialItem } from "@/lib/types";

function estadoDe(estado: HistorialItem["estado"]): { text: string; tone: EstadoTono } {
  if (estado === "Finalizado") return { text: tr("Completado"), tone: "success" };
  if (estado === "Cancelado") return { text: tr("Cancelado"), tone: "danger" };
  return { text: tr(estado), tone: "neutral" };
}

export function HistorialTrabajosPage() {
  const navigate = useNavigate();
  const [historial, setHistorial] = useState<HistorialItem[] | null>(null);

  useEffect(() => {
    api.historial.listar().then(setHistorial).catch(() => setHistorial([]));
  }, []);

  return (
    <div className="pb-6">
      <PageHeader
        title={tr("Historial de trabajos")}
        subtitle={tr("Consulta tus trabajos finalizados y cancelados.")}
        onBack={() => navigate(-1)}
        backLabel={tr("Atrás")}
        large={false}
      />

      <div className="grid gap-3 px-5 pt-2">
        {historial === null ? (
          <Loader label={tr("Cargando historial...")} />
        ) : historial.length === 0 ? (
          <Vacio title={tr("Sin historial de trabajos")} message={tr("Aquí aparecerán los trabajos que hayas completado o cancelado.")} />
        ) : (
          <Stagger className="grid gap-3">
            {historial.map((h) => (
              <JobStatusCard key={h.id} titulo={h.titulo} publicador={tr(h.contraparte)} fecha={h.fecha} estado={estadoDe(h.estado)} apagado />
            ))}
          </Stagger>
        )}
      </div>
    </div>
  );
}
