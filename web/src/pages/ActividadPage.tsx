import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Icon, Loader, PageHeader, SegmentedControl, Stagger } from "@/components/aire";
import { Vacio } from "@/components/Vacio";
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
  const navigate = useNavigate();
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
      <PageHeader
        title={tr("Mi actividad")}
        subtitle={tr("Lo que pagaste y lo que ganaste")}
        onBack={() => navigate(-1)}
        backLabel={tr("Atrás")}
        large={false}
      />

      <div className="grid gap-3 px-5 pt-2">
        <SegmentedControl
          fullWidth
          items={[
            { value: "pagos", label: tr("Pagos realizados") },
            { value: "ganancias", label: tr("Ganancias") },
          ]}
          value={pestana}
          onChange={(v) => setPestana(v as Pestana)}
        />

        <Card className="text-center">
          <p className="aire-text-eyebrow text-aire-ink-2">{pestana === "pagos" ? tr("Total pagado") : tr("Total ganado")}</p>
          <p className="aire-text-figure text-aire-accent-text">{formatoColones.format(total)}</p>
        </Card>

        {lista.length === 0 ? (
          <Vacio
            title={pestana === "pagos" ? tr("Aún no has pagado trabajos") : tr("Aún no has ganado dinero")}
            message={
              pestana === "pagos"
                ? tr("Aquí aparecerán los pagos de tus publicaciones.")
                : tr("Aquí aparecerán los pagos de los trabajos que realices.")
            }
          />
        ) : (
          <Stagger key={pestana} className="grid gap-3">
            {lista.map((m) => (
              <Movimiento key={m.id} m={m} tipo={pestana} />
            ))}
          </Stagger>
        )}
      </div>
    </div>
  );
}

function Movimiento({ m, tipo }: { m: MovimientoActividad; tipo: Pestana }) {
  return (
    <Card className="grid gap-2">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-aire-md bg-aire-accent-soft">
          <Icon name={tipo === "pagos" ? "north_east" : "south_west"} size={20} className="text-aire-accent-text" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="aire-text-headline truncate text-aire-ink">{m.titulo}</p>
          <p className="aire-text-footnote text-aire-ink-2">
            {tipo === "pagos" ? tr("Pagaste a {nombre}", { nombre: m.contraparte }) : tr("Te pagó {nombre}", { nombre: m.contraparte })}
            {" · "}
            {fechaCorta(m.fecha)}
          </p>
        </div>
        <p className={`aire-text-headline ${tipo === "pagos" ? "text-aire-ink" : "text-aire-success-text"}`}>
          {tipo === "pagos" ? "-" : "+"}
          {formatoColones.format(m.total)}
        </p>
      </div>
      <div className="aire-text-footnote flex flex-wrap gap-x-3 gap-y-0.5 text-aire-ink-2">
        <span>{tr("Trabajo")}: {formatoColones.format(m.monto)}</span>
        {tipo === "pagos" && m.comision > 0 && <span>{tr("Comisión")}: {formatoColones.format(m.comision)}</span>}
        {tipo === "pagos" && m.tarifaUrgencia > 0 && <span>{tr("Urgencia")}: {formatoColones.format(m.tarifaUrgencia)}</span>}
        {tipo !== "pagos" && (m.bonoUrgencia ?? 0) > 0 && <span>{tr("Bono de urgencia")}: {formatoColones.format(m.bonoUrgencia ?? 0)}</span>}
        {m.propina > 0 && <span>{tr("Propina")}: {formatoColones.format(m.propina)}</span>}
        <span>{m.metodo === "Efectivo" ? tr("Efectivo") : tr("Tarjeta")}</span>
      </div>
    </Card>
  );
}
