import { useEffect, useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Loader } from "@/components/ui/Loader";
import { api } from "@/lib/api";
import { formatoColones } from "@/lib/format";
import { useConfig } from "@/lib/useConfig";
import type { Ingresos } from "@/lib/types";
import { tr } from "@/lib/i18n";

/** Vista para la demo: de dónde gana dinero CIRA (todo simulado). */
export function IngresosPage() {
  const config = useConfig();
  const [ingresos, setIngresos] = useState<Ingresos | null>(null);

  useEffect(() => {
    api.ingresos().then(setIngresos).catch(() => {});
  }, []);

  if (!ingresos) return <Loader label={tr("Calculando ingresos...")} />;

  const fuentes = [
    { titulo: tr("Plan Plus"), detalle: tr("{n} suscripción(es)", { n: ingresos.planPlus.cantidad }), total: ingresos.planPlus.total },
    {
      titulo: tr("Tarifa de urgencia"),
      detalle: tr("{n} urgencia(s) · {pct}%", { n: ingresos.tarifaUrgencia.cantidad, pct: config.urgenciaPct }),
      total: ingresos.tarifaUrgencia.total,
    },
    {
      titulo: tr("Comisión por pagos con tarjeta"),
      detalle: tr("{n} pago(s) · {pct}%", { n: ingresos.comisiones.cantidad, pct: config.comisionPct }),
      total: ingresos.comisiones.total,
    },
  ];

  return (
    <div className="pb-6">
      <PageHeader title={tr("Ingresos de CIRA")} subtitle={tr("Modelo freemium (simulado)")} icon="payments" showBack />
      <div className="flex flex-col gap-3 px-5 pt-2">
        <Card className="text-center">
          <p className="text-[11px] font-semibold tracking-wider text-cira-text-secondary">{tr("TOTAL")}</p>
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
