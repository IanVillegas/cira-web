import { formatoColones } from "@/lib/format";
import { tr } from "@/lib/i18n";
import type { ResumenPago } from "@/lib/types";

/** Desglose del pago: monto del trabajo, comisión de CIRA, tarifa de urgencia, propina y cómo se paga. */
export function PagoResumen({ resumen }: { resumen: ResumenPago }) {
  return (
    <div className="flex flex-col gap-1.5 rounded-2xl bg-cira-input-bg p-3.5 text-sm">
      <Linea label={tr("Monto del trabajo")} valor={resumen.monto} />
      {resumen.comision > 0 && <Linea label={tr("Comisión de CIRA")} valor={resumen.comision} />}
      {resumen.tarifaUrgencia > 0 && <Linea label={tr("Tarifa de urgencia")} valor={resumen.tarifaUrgencia} />}
      {resumen.propina > 0 && <Linea label={tr("Propina")} valor={resumen.propina} />}
      <div className="mt-1 flex justify-between border-t border-cira-border pt-2 font-semibold text-cira-text-primary">
        <span>{tr("Total")}</span>
        <span className="text-cira-accent">{formatoColones.format(resumen.total)}</span>
      </div>
      {resumen.enEfectivo > 0 && resumen.enTarjeta > 0 && (
        <div className="flex flex-col gap-1 border-t border-cira-border pt-2 text-xs">
          <Linea label={tr("En efectivo al trabajador")} valor={resumen.enEfectivo} />
          <Linea label={tr("Con tu tarjeta")} valor={resumen.enTarjeta} />
        </div>
      )}
    </div>
  );
}

function Linea({ label, valor }: { label: string; valor: number }) {
  return (
    <div className="flex justify-between text-cira-text-secondary">
      <span>{label}</span>
      <span>{formatoColones.format(valor)}</span>
    </div>
  );
}
