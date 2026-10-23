import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { Loader } from "@/components/ui/Loader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { api } from "@/lib/api";
import { formatoColones } from "@/lib/format";
import { useAlertas } from "@/lib/useAlertas";
import { useConfig } from "@/lib/useConfig";
import { useAuth } from "@/lib/auth";
import { tr } from "@/lib/i18n";

/** Todas las alertas activas. Las urgencias van primero. */
export function AlertasPage() {
  const navigate = useNavigate();
  const { usuario } = useAuth();
  const config = useConfig();
  const { alertas, cargado, descartar, recargar } = useAlertas();
  const [error, setError] = useState<string | null>(null);

  const aceptar = async (id: string) => {
    setError(null);
    try {
      await api.trabajos.aceptarUrgencia(id);
      descartar(id);
      navigate("/mis-trabajos");
    } catch (e) {
      setError(e instanceof Error ? e.message : tr("No se pudo aceptar la urgencia."));
      recargar();
    }
  };

  return (
    <div className="pb-4">
      <PageHeader title={tr("Alertas")} subtitle={tr("Trabajos de tu oficio cerca de ti")} icon="notifications" showBack />

      <div className="flex flex-col gap-3 px-5 pt-2">
        {usuario?.plan !== "plus" && (
          <button
            onClick={() => navigate("/cuenta/plan")}
            className="flex items-center gap-3 rounded-2xl bg-amber-100 p-3.5 text-left text-[13px] text-amber-800"
          >
            <Icon name="star" filled size={22} />
            <span className="flex-1">
              {tr("Con el plan gratis recibes las alertas {min} min después. Con Plus las recibes primero.", { min: Math.round(config.retrasoGratisSeg / 60) })}
            </span>
          </button>
        )}

        {error && <p className="text-center text-[13px] text-cira-btn-destructive-text">{error}</p>}

        {!cargado ? (
          <Loader label={tr("Buscando alertas...")} />
        ) : alertas.length === 0 ? (
          <EmptyState
            title={tr("Sin alertas por ahora")}
            message={tr("Te avisaremos cuando alguien cerca publique un trabajo de tu oficio. Revisa que estés disponible y tengas servicios configurados.")}
          />
        ) : (
          alertas.map(({ trabajo, urgente, prioritaria }) => (
            <Card key={trabajo.id} className="flex flex-col gap-2.5">
              <div className="flex items-center gap-2 text-[11px] font-semibold tracking-wider uppercase">
                <span className={urgente ? "text-cira-btn-destructive-text" : "text-cira-accent"}>
                  {urgente ? tr("⚡ Urgencia") : tr(trabajo.categoria)}
                </span>
                {prioritaria && <span className="rounded-full bg-amber-100 px-2 py-0.5 text-amber-700">{tr("Prioridad Plus")}</span>}
              </div>
              <p className="font-semibold text-cira-text-primary">{trabajo.titulo}</p>
              <p className="text-[13px] text-cira-text-secondary">
                {trabajo.ubicacion} · {trabajo.distanciaKm} km · {formatoColones.format(trabajo.pago)}
              </p>
              <div className="grid grid-cols-2 gap-2.5">
                <Button variant="outlined" onClick={() => descartar(trabajo.id)}>
                  {tr("DESCARTAR")}
                </Button>
                {urgente ? (
                  <Button onClick={() => aceptar(trabajo.id)}>{tr("ACEPTAR")}</Button>
                ) : (
                  <Button onClick={() => navigate(`/explorar?trabajo=${trabajo.id}`)}>{tr("VER TRABAJO")}</Button>
                )}
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
