import { useEffect, useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Icon } from "@/components/ui/Icon";
import { Loader } from "@/components/ui/Loader";
import { api } from "@/lib/api";
import { formatoColones } from "@/lib/format";
import { localeActual, tr } from "@/lib/i18n";
import type { Actividad, MovimientoActividad } from "@/lib/types";

type Pestana = "pagos" | "ganancias";

function fechaCorta(fechaSql: string) {
  const d = new Date(`${fechaSql.replace(" ", "T")}Z`);
  return Number.isNaN(d.getTime()) ? fechaSql : d.toLocaleDateString(localeActual(), { day: "numeric", month: "short", year: "numeric" });
}

/** Historial de dinero: lo que pagué en mis publicaciones y lo que gané en mis trabajos. */
export function ActividadPage() {
  const [actividad, setActividad] = useState<Actividad | null>(null);
  const [pestana, setPestana] = useState<Pestana>("pagos");

  useEffect(() => {
    api.actividad().then(setActividad).catch(() => {});
  }, []);

  if (!actividad) return <Loader label={tr("Cargando actividad...")} />;

  const lista = pestana === "pagos" ? actividad.pagos : actividad.ganancias;
  const total = pestana === "pagos" ? actividad.totalPagado : actividad.totalGanado;

  return (
    <div className="pb-6">
      <PageHeader title={tr("Mi actividad")} subtitle={tr("Lo que pagaste y lo que ganaste")} icon="receipt_long" showBack />

      <div className="flex flex-col gap-3 px-5 pt-2">
        <div className="inline-flex gap-0.5 self-start rounded-[21px] border border-cira-border bg-cira-card p-0.5">
          {(["pagos", "ganancias"] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPestana(p)}
              className={`rounded-[18px] px-4 py-2 text-[13px] font-semibold ${
                pestana === p ? "bg-cira-accent text-white" : "text-cira-text-primary"
              }`}
            >
              {p === "pagos" ? tr("Pagos realizados") : tr("Ganancias")}
            </button>
          ))}
        </div>

        <Card className="text-center">
          <p className="text-[11px] font-semibold tracking-wider text-cira-text-secondary">
            {pestana === "pagos" ? tr("TOTAL PAGADO") : tr("TOTAL GANADO")}
          </p>
          <p className="text-[30px] font-semibold text-cira-accent">{formatoColones.format(total)}</p>
        </Card>

        {lista.length === 0 ? (
          <EmptyState
            title={pestana === "pagos" ? tr("Aún no has pagado trabajos") : tr("Aún no has ganado dinero")}
            message={
              pestana === "pagos"
                ? tr("Aquí aparecerán los pagos de tus publicaciones.")
                : tr("Aquí aparecerán los pagos de los trabajos que realices.")
            }
          />
        ) : (
          lista.map((m) => <Movimiento key={m.id} m={m} tipo={pestana} />)
        )}
      </div>
    </div>
  );
}

function Movimiento({ m, tipo }: { m: MovimientoActividad; tipo: Pestana }) {
  return (
    <Card className="flex flex-col gap-2">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cira-header-icon-bg">
          <Icon name={tipo === "pagos" ? "north_east" : "south_west"} size={20} className="text-cira-accent" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-cira-text-primary">{m.titulo}</p>
          <p className="text-xs text-cira-text-secondary">
            {tipo === "pagos" ? tr("Pagaste a {nombre}", { nombre: m.contraparte }) : tr("Te pagó {nombre}", { nombre: m.contraparte })}
            {" · "}
            {fechaCorta(m.fecha)}
          </p>
        </div>
        <p className={`font-semibold ${tipo === "pagos" ? "text-cira-text-primary" : "text-emerald-700"}`}>
          {tipo === "pagos" ? "-" : "+"}
          {formatoColones.format(m.total)}
        </p>
      </div>
      <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-cira-text-secondary">
        <span>{tr("Trabajo")}: {formatoColones.format(m.monto)}</span>
        {tipo === "pagos" && m.comision > 0 && <span>{tr("Comisión")}: {formatoColones.format(m.comision)}</span>}
        {tipo === "pagos" && m.tarifaUrgencia > 0 && <span>{tr("Urgencia")}: {formatoColones.format(m.tarifaUrgencia)}</span>}
        {m.propina > 0 && <span>{tr("Propina")}: {formatoColones.format(m.propina)}</span>}
        <span>{m.metodo === "Efectivo" ? tr("Efectivo") : tr("Tarjeta")}</span>
      </div>
    </Card>
  );
}
