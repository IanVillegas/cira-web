import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Loader, PageHeader, Stagger } from "@/components/aire";
import { api } from "@/lib/api";
import { formatoColones } from "@/lib/format";
import { tr } from "@/lib/i18n";
import { useConfig } from "@/lib/useConfig";
import type { Ingresos } from "@/lib/types";

/** Vista para la demo: de dónde gana dinero CIRA (todo simulado). */
export function IngresosPage() {
  const navigate = useNavigate();
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
      detalle: tr("{n} urgencia(s) · {pct}% de {total}% (el resto, {resto}, va al trabajador)", {
        n: ingresos.tarifaUrgencia.cantidad,
        pct: config.urgenciaPct - config.urgenciaTrabajadorPct,
        total: config.urgenciaPct,
        resto: formatoColones.format(ingresos.tarifaUrgencia.alTrabajador ?? 0),
      }),
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
      <PageHeader
        title={tr("Ingresos de CIRA")}
        subtitle={tr("Modelo freemium (simulado)")}
        onBack={() => navigate(-1)}
        backLabel={tr("Atrás")}
        large={false}
      />
      <div className="grid gap-3 px-5 pt-2">
        <Card className="text-center">
          <p className="aire-text-eyebrow text-aire-ink-2">{tr("TOTAL")}</p>
          <p className="aire-text-figure text-aire-accent-text">{formatoColones.format(ingresos.total)}</p>
        </Card>
        <Stagger className="grid gap-3">
          {fuentes.map((f) => (
            <Card key={f.titulo} className="flex items-center justify-between gap-3">
              <div>
                <p className="aire-text-headline text-aire-ink">{f.titulo}</p>
                <p className="aire-text-footnote text-aire-ink-2">{f.detalle}</p>
              </div>
              <p className="aire-text-headline text-aire-ink">{formatoColones.format(f.total)}</p>
            </Card>
          ))}
        </Stagger>
      </div>
    </div>
  );
}
