import { useEffect, useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Loader } from "@/components/ui/Loader";
import { api } from "@/lib/api";
import { formatoColones } from "@/lib/format";
import { useConfig } from "@/lib/useConfig";
import type { Ingresos } from "@/lib/types";

/** Vista para la demo: de dónde gana dinero CIRA (todo simulado). */
export function IngresosPage() {
  const config = useConfig();
  const [ingresos, setIngresos] = useState<Ingresos | null>(null);

  useEffect(() => {
    api.ingresos().then(setIngresos).catch(() => {});
  }, []);

  if (!ingresos) return <Loader label="Calculando ingresos..." />;

  const fuentes = [
    { titulo: "Plan Plus", detalle: `${ingresos.planPlus.cantidad} suscripción(es)`, total: ingresos.planPlus.total },
    {
      titulo: "Tarifa de urgencia",
      detalle: `${ingresos.tarifaUrgencia.cantidad} urgencia(s) · ${config.urgenciaPct}%`,
      total: ingresos.tarifaUrgencia.total,
    },
    {
      titulo: "Comisión por pagos en la app",
      detalle: `${ingresos.comisiones.cantidad} pago(s) · ${config.comisionPct}%`,
      total: ingresos.comisiones.total,
    },
  ];

  return (
    <div className="pb-6">
      <PageHeader title="Ingresos de CIRA" subtitle="Modelo freemium (simulado)" icon="payments" showBack />
      <div className="flex flex-col gap-3 px-5 pt-2">
        <Card className="text-center">
          <p className="text-[11px] font-semibold tracking-wider text-cira-text-secondary">TOTAL</p>
          <p className="text-[32px] font-semibold text-cira-accent">{formatoColones.format(ingresos.total)}</p>
        </Card>
        {fuentes.map((f) => (
          <Card key={f.titulo} className="flex items-center justify-between gap-3">
            <div>
              <p className="font-semibold text-cira-text-primary">{f.titulo}</p>
              <p className="text-xs text-cira-text-secondary">{f.detalle}</p>
            </div>
            <p className="text-lg font-semibold text-cira-text-primary">{formatoColones.format(f.total)}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
