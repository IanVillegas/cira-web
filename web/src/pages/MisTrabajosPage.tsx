import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Loader, PageHeader, Stagger } from "@/components/aire";
import { ExploreTabs } from "@/components/ExploreTabs";
import { CardAction, JobStatusCard, type EstadoTono } from "@/components/JobStatusCard";
import { RatingSheet } from "@/components/RatingSheet";
import { SeguimientoTrabajo } from "@/components/SeguimientoTrabajo";
import { Vacio } from "@/components/Vacio";
import { api } from "@/lib/api";
import { ETAPAS } from "@/lib/etapas";
import { tr } from "@/lib/i18n";
import { mostrarToast } from "@/lib/toast";
import { usePolling } from "@/lib/usePolling";
import type { Trabajo } from "@/lib/types";

function estadoDe(t: Trabajo): { text: string; tone: EstadoTono } {
  if (t.estado === "Pendiente") return { text: tr("Postulado"), tone: "accent" };
  if (t.estado === "Asignado") return { text: tr("Asignado"), tone: "warning" };
  if (t.estado === "En progreso") return { text: tr("En proceso"), tone: "success" };
  if (t.estado === "Finalizado") return { text: tr("Por calificar"), tone: "success" };
  return { text: tr(t.estado), tone: "neutral" };
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

  const ejecutar = async (accion: () => Promise<Trabajo>, aviso?: string) => {
    setError(null);
    try {
      await accion();
      if (aviso) mostrarToast(aviso, "info");
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
    <div className="pb-6">
      <PageHeader
        title={tr("Mis trabajos")}
        subtitle={tr("Consulta y gestiona tus trabajos activos.")}
        action={{ icon: "history", label: tr("Ver historial"), onClick: () => navigate("/historial") }}
      />
      <ExploreTabs />

      <div className="grid gap-3 px-5 pt-4">
        {error && (
          <p role="alert" className="aire-text-subhead rounded-aire-md bg-aire-danger-soft p-3 font-semibold text-aire-danger-text">
            {error}
          </p>
        )}
        {trabajos === null ? (
          <Loader label={tr("Cargando tus trabajos...")} />
        ) : trabajos.length === 0 ? (
          <Vacio title={tr("No tienes trabajos activos")} message={tr("Aquí aparecerán los trabajos a los que te postules o que te asignen.")} />
        ) : (
          <Stagger className="grid gap-3">
            {trabajos.map((t) => {
              const siguiente = ETAPAS[ETAPAS.indexOf(t.etapa ?? "Aceptado") + 1];
              const asignado = t.asignadoAMi && (t.estado === "Asignado" || t.estado === "En progreso");
              return (
                <JobStatusCard
                  key={t.id}
                  titulo={t.titulo}
                  publicador={t.publicador}
                  fecha={tr(t.fecha)}
                  estado={estadoDe(t)}
                  actions={
                    <>
                      <CardAction icon="chat_bubble" label={tr("Escribir al publicador")} onClick={() => abrirChat(t.publicadorId)} />
                      {t.estado !== "Finalizado" && (
                        <CardAction
                          icon="close"
                          label={t.asignadoAMi ? tr("Cancelar trabajo") : tr("Retirar postulación")}
                          destructive
                          onClick={() =>
                            ejecutar(
                              () => api.trabajos.cancelar(t.id),
                              t.asignadoAMi ? tr("Cancelaste el trabajo") : tr("Retiraste tu postulación"),
                            )
                          }
                        />
                      )}
                    </>
                  }
                  footer={
                    <>
                      {t.urgente && <p className="aire-text-eyebrow text-aire-danger-text">{tr("Urgencia")}</p>}
                      {t.asignadoAMi && <SeguimientoTrabajo etapa={t.etapa} />}
                      {asignado && siguiente && (
                        <Button icon={ICONO_ETAPA[siguiente]} onClick={() => ejecutar(() => api.trabajos.avanzarEtapa(t.id), tr("Seguimiento actualizado"))}>
                          {siguiente === "Terminado"
                            ? tr("Marcar como terminado")
                            : tr(siguiente === "En camino" ? "Estoy en camino" : "Ya llegué")}
                        </Button>
                      )}
                      {t.estado === "Finalizado" && (
                        <Button icon="star" onClick={() => setACalificar(t)}>
                          {tr("Calificar a {nombre}", { nombre: t.publicador })}
                        </Button>
                      )}
                    </>
                  }
                />
              );
            })}
          </Stagger>
        )}
      </div>

      <RatingSheet
        trabajo={aCalificar}
        onClose={() => setACalificar(null)}
        onDone={() => {
          setACalificar(null);
          mostrarToast(tr("¡Gracias por tu calificación!"));
          cargar();
        }}
      />
    </div>
  );
}
