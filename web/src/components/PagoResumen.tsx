import { formatoColones } from "@/lib/format";
import type { ResumenPago } from "@/lib/types";
import { tr } from "@/lib/i18n";

/** Desglose del pago: monto del trabajo, comisión de CIRA y, si aplica, tarifa de urgencia. */
export function PagoResumen({ resumen }: { resumen: ResumenPago }) {
  return (
    <div className="flex flex-col gap-1.5 rounded-2xl bg-cira-input-bg p-3.5 text-sm">
      <Linea label={tr("Monto del trabajo")} valor={resumen.monto} />
      {resumen.comision > 0 && <Linea label={tr("Comisión de CIRA")} valor={resumen.comision} />}
      {resumen.tarifaUrgencia > 0 && <Linea label={tr("Tarifa de urgencia")} valor={resumen.tarifaUrgencia} />}
      <div className="mt-1 flex justify-between border-t border-cira-border pt-2 font-semibold text-cira-text-primary">
        <span>{tr("Total")}</span>
        <span className="text-cira-accent">{formatoColones.format(resumen.total)}</span>
      </div>
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
