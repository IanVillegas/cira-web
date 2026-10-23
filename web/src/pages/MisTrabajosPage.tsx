import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/ui/PageHeader";
import { ExploreTabs } from "@/components/ui/ExploreTabs";
import { EmptyState } from "@/components/ui/EmptyState";
import { Icon } from "@/components/ui/Icon";
import { Loader } from "@/components/ui/Loader";
import { Button } from "@/components/ui/Button";
import { CardAction, JobStatusCard, type StatusBadge } from "@/components/JobStatusCard";
import { SeguimientoTrabajo } from "@/components/SeguimientoTrabajo";
import { RatingSheet } from "@/components/RatingSheet";
import { api } from "@/lib/api";
import { ETAPAS } from "@/lib/etapas";
import { usePolling } from "@/lib/usePolling";
import type { Trabajo } from "@/lib/types";
import { tr } from "@/lib/i18n";

// Colores del StatusBackground/StatusTextColor de MisTrabajosPage.xaml.cs
function badgeDe(t: Trabajo): StatusBadge {
  if (t.estado === "Pendiente") return { text: tr("Postulado"), bg: "#EEF3FF", color: "#3E7BE1" };
  if (t.estado === "Asignado") return { text: tr("Asignado"), bg: "#FFF8E1", color: "#F57C00" };
  if (t.estado === "En progreso") return { text: tr("En proceso"), bg: "#E8F5E9", color: "#2E7D32" };
  if (t.estado === "Finalizado") return { text: tr("Por calificar"), bg: "#E8F5E9", color: "#2E7D32" };
  return { text: tr(t.estado), bg: "#EEF3FF", color: "#3E7BE1" };
}

const ICONO_ETAPA: Record<string, string> = { "En camino": "directions_car", Llegó: "pin_drop", Terminado: "task_alt" };

export function MisTrabajosPage() {
  const navigate = useNavigate();
  const [trabajos, setTrabajos] = useState<Trabajo[] | null>(null);
  const [aCalificar, setACalificar] = useState<Trabajo | null>(null);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(
    () => api.trabajos.listar({ mios: true }).then(setTrabajos).catch(() => setTrabajos((t) => t ?? [])),
    [],
  );

  useEffect(() => {
    cargar();
  }, [cargar]);
  // Si el publicador elige a otra persona, o cancela, se refleja sin recargar.
  usePolling(cargar, 5000);

  const ejecutar = async (accion: () => Promise<Trabajo>) => {
    setError(null);
    try {
      await accion();
      await cargar();
    } catch (e) {
      setError(e instanceof Error ? e.message : tr("No se pudo completar la acción."));
    }
  };

  const abrirChat = async (usuarioId: string) => {
    const conversacion = await api.conversaciones.con(usuarioId);
    navigate(`/chats/${conversacion.id}`);
  };

  return (
    <div className="flex min-h-full flex-col pb-4">
      <PageHeader title={tr("Mis trabajos")} subtitle={tr("Consulta y gestiona tus trabajos activos.")} icon="work" />
      <ExploreTabs />

      <div className="flex-1 px-5 pt-4">
        {error && (
          <p role="alert" className="mb-3 rounded-2xl bg-cira-btn-destructive-bg p-3 text-[13px] font-semibold text-cira-btn-destructive-text">
            {error}
          </p>
        )}
        {trabajos === null ? (
          <Loader label={tr("Cargando tus trabajos...")} />
        ) : trabajos.length === 0 ? (
          <EmptyState
            title={tr("No tienes trabajos activos")}
            message={tr("Aquí aparecerán los trabajos a los que te postules o que te asignen.")}
          />
        ) : (
          trabajos.map((t) => {
            const siguiente = ETAPAS[ETAPAS.indexOf(t.etapa ?? "Aceptado") + 1];
            const asignado = t.asignadoAMi && (t.estado === "Asignado" || t.estado === "En progreso");
            return (
              <JobStatusCard
                key={t.id}
                titulo={t.titulo}
                publicador={t.publicador}
                fecha={t.fecha}
                badge={badgeDe(t)}
                actions={
                  <>
                    <CardAction icon="chat" label={tr("Escribir al publicador")} onClick={() => abrirChat(t.publicadorId)} />
                    {t.estado !== "Finalizado" && (
                      <CardAction
                        icon="cancel"
                        label={t.asignadoAMi ? tr("Cancelar trabajo") : tr("Retirar postulación")}
                        destructive
                        onClick={() => ejecutar(() => api.trabajos.cancelar(t.id))}
                      />
                    )}
                  </>
                }
                footer={
                  <>
                    {t.urgente && (
                      <p className="flex items-center gap-1 text-xs font-semibold text-cira-btn-destructive-text">
                        <Icon name="bolt" filled size={14} /> {tr("Urgencia")}
                      </p>
                    )}
                    {t.asignadoAMi && <SeguimientoTrabajo etapa={t.etapa} />}
                    {asignado && siguiente && (
                      <Button onClick={() => ejecutar(() => api.trabajos.avanzarEtapa(t.id))}>
                        <Icon name={ICONO_ETAPA[siguiente]} size={20} />
                        {siguiente === "Terminado" ? tr("MARCAR COMO TERMINADO") : tr(siguiente === "En camino" ? "ESTOY EN CAMINO" : "YA LLEGUÉ")}
                      </Button>
                    )}
                    {t.estado === "Finalizado" && (
                      <Button onClick={() => setACalificar(t)}>{tr("CALIFICAR A {nombre}", { nombre: t.publicador.toUpperCase() })}</Button>
                    )}
                  </>
                }
              />
            );
          })
        )}
      </div>

      <div className="sticky bottom-[18px] flex justify-end px-5">
        <button
          onClick={() => navigate("/historial")}
          aria-label={tr("Ver historial")}
          className="flex h-[58px] w-[58px] items-center justify-center rounded-[20px] bg-cira-header-icon-bg shadow-[0_8px_18px_rgba(0,0,0,0.26)]"
        >
          <Icon name="history" size={30} className="text-cira-accent" />
        </button>
      </div>

      <RatingSheet
        trabajo={aCalificar}
        onClose={() => setACalificar(null)}
        onDone={() => {
          setACalificar(null);
          cargar();
        }}
      />
    </div>
  );
}
