import { Card } from "@/components/aire";
import { formatoColones } from "@/lib/format";
import { tr } from "@/lib/i18n";
import type { ResumenPago } from "@/lib/types";

/** Desglose del pago: monto del trabajo, comisión de CIRA, tarifa de urgencia, propina y cómo se paga. */
export function PagoResumen({ resumen }: { resumen: ResumenPago }) {
  return (
    <Card inset padding="sm" className="grid gap-1.5">
      <Linea label={tr("Monto del trabajo")} valor={resumen.monto} />
      {resumen.comision > 0 && <Linea label={tr("Comisión de CIRA")} valor={resumen.comision} />}
      {resumen.tarifaUrgencia > 0 && <Linea label={tr("Tarifa de urgencia")} valor={resumen.tarifaUrgencia} />}
      {resumen.propina > 0 && <Linea label={tr("Propina")} valor={resumen.propina} />}
      <div className="aire-text-headline mt-1 flex justify-between border-t border-aire-hairline pt-2.5 text-aire-ink">
        <span>{tr("Total")}</span>
        <span className="text-aire-accent-text">{formatoColones.format(resumen.total)}</span>
      </div>
      {resumen.enEfectivo > 0 && resumen.enTarjeta > 0 && (
        <div className="mt-1 grid gap-1 border-t border-aire-hairline pt-2.5">
          <Linea label={tr("En efectivo al trabajador")} valor={resumen.enEfectivo} />
          <Linea label={tr("Con tu tarjeta")} valor={resumen.enTarjeta} />
        </div>
      )}
    </Card>
  );
}

function Linea({ label, valor }: { label: string; valor: number }) {
  return (
    <div className="aire-text-subhead flex justify-between text-aire-ink-2">
      <span>{label}</span>
      <span className="text-aire-ink">{formatoColones.format(valor)}</span>
    </div>
  );
}
