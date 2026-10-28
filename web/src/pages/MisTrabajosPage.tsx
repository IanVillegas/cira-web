import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Icon, Loader, PageHeader, Stagger } from "@/components/aire";
import { AcuerdoTrueque } from "@/components/AcuerdoTrueque";
import { VisitaInfo } from "@/components/VisitaInfo";
import { CardAction, JobStatusCard, type EstadoTono } from "@/components/JobStatusCard";
import { RatingSheet } from "@/components/RatingSheet";
import { SeguimientoTrabajo } from "@/components/SeguimientoTrabajo";
import { Vacio } from "@/components/Vacio";
import { api } from "@/lib/api";
import { ETAPAS } from "@/lib/etapas";
import { fechaTrabajo, frecuenciaTexto, limiteTexto } from "@/lib/fechas";
import { formatoColones } from "@/lib/format";
import { tr } from "@/lib/i18n";
import { mostrarToast } from "@/lib/toast";
import { usePolling } from "@/lib/usePolling";
import type { Trabajo } from "@/lib/types";

function estadoDe(t: Trabajo): { text: string; tone: EstadoTono } {
  if (t.invitacionParaMi && t.turno) return { text: tr("Por responder"), tone: "warning" };
  if (t.invitacionParaMi) return { text: tr("Te quieren recontratar"), tone: "accent" };
  if (t.trueque && t.asignadoAMi && t.estado !== "Finalizado") {
    if (!t.trueque.acuerdoAceptado) return { text: tr("Acepta el acuerdo"), tone: "accent" };
    if (t.trueque.etapa === "primera") return { text: tr("Esperando su parte"), tone: "warning" };
  }
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
        onBack={() => navigate("/explorar")}
        backLabel={tr("Explorar")}
        large={false}
        action={{ icon: "history", label: tr("Ver historial"), onClick: () => navigate("/historial") }}
      />

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
                  categoria={t.categoria}
                  publicador={t.publicador}
                  fecha={fechaTrabajo(t.fecha)}
                  estado={estadoDe(t)}
                  actions={
                    <>
                      <CardAction icon="chat_bubble" label={tr("Escribir al publicador")} onClick={() => abrirChat(t.publicadorId)} />
                      {t.estado !== "Finalizado" && !t.invitacionParaMi && t.trueque?.etapa !== "primera" && (
                        <CardAction
                          icon="close"
                          label={
                            t.asignadoAMi && t.serie && !t.reemplazo
                              ? tr("No puedo ir a esta visita")
                              : t.asignadoAMi
                                ? tr("Cancelar trabajo")
                                : tr("Retirar postulación")
                          }
                          destructive
                          onClick={() => {
                            const visita = t.asignadoAMi && t.serie && !t.reemplazo;
                            if (visita && !window.confirm(tr("¿No puedes ir a esta visita? Le avisamos a {nombre} para que elija un reemplazo.", { nombre: t.publicador })))
                              return;
                            ejecutar(
                              () => api.trabajos.cancelar(t.id),
                              visita
                                ? tr("Le avisamos a {nombre} para que elija un reemplazo", { nombre: t.publicador })
                                : t.asignadoAMi
                                  ? tr("Cancelaste el trabajo")
                                  : tr("Retiraste tu postulación"),
                            );
                          }}
                        />
                      )}
                    </>
                  }
                  footer={
                    <>
                      {t.urgente && <p className="aire-text-eyebrow text-aire-danger-text">{tr("Urgencia")}</p>}
                      <VisitaInfo trabajo={t} instrucciones={t.asignadoAMi || t.invitacionParaMi} />
                      {t.reemplazo === "cubierto" && t.asignadoAMi && (
                        <p className="aire-text-footnote text-aire-ink-2">
                          {tr("Reemplazas a {nombre} en esta visita.", { nombre: t.serie?.trabajadorNombre ?? "" })}
                        </p>
                      )}
                      {t.invitacionParaMi && (
                        <>
                          <p className="aire-text-subhead text-aire-ink-2">
                            {t.turno
                              ? tr("{nombre} necesita la limpieza entre huéspedes de {lugar} ({cuando}). Si no respondes pronto, se ofrece a otros trabajadores.", {
                                  nombre: t.publicador,
                                  lugar: t.propiedad?.nombre ?? t.ubicacion,
                                  cuando: `${fechaTrabajo(t.fecha)}${t.limite ? ` · ${limiteTexto(t.limite, t.fecha).toLowerCase()}` : ""}`,
                                })
                              : t.reemplazo === "invitado"
                              ? tr("{nombre} te pide reemplazar a {otro} en esta visita, por {pago}.", {
                                  nombre: t.publicador,
                                  otro: t.serie?.trabajadorNombre ?? "",
                                  pago: formatoColones.format(t.pago),
                                })
                              : t.serie && !t.serie.aceptada
                                ? tr("{nombre} quiere contratarte {cada} por {pago}. Lo aceptas una vez y CIRA agenda las siguientes visitas.", {
                                    nombre: t.publicador,
                                    cada: frecuenciaTexto(t.serie.frecuencia, t.fecha).toLowerCase(),
                                    pago: formatoColones.format(t.pago),
                                  })
                                : t.trueque
                              ? tr("{nombre} te propone un trueque: a cambio, {ofrece}. Solo tú puedes verlo.", {
                                  nombre: t.publicador,
                                  ofrece: t.trueque.ofrece,
                                })
                              : tr("{nombre} te envió una oferta directa por {pago}. Solo tú puedes verla.", {
                                  nombre: t.publicador,
                                  pago: formatoColones.format(t.pago),
                                })}
                          </p>
                          <div className="grid grid-cols-2 gap-2.5">
                            <Button
                              variant="secondary"
                              onClick={() => ejecutar(() => api.trabajos.rechazarInvitacion(t.id), tr("Rechazaste la oferta"))}
                            >
                              {tr("No puedo")}
                            </Button>
                            <Button
                              icon="check"
                              onClick={() => ejecutar(() => api.trabajos.aceptarInvitacion(t.id), tr("¡Aceptaste el trabajo!"))}
                            >
                              {tr("Aceptar")}
                            </Button>
                          </div>
                        </>
                      )}
                      {t.trueque && !t.asignadoAMi && t.estado === "Pendiente" && !t.invitacionParaMi && (
                        <p className="aire-text-footnote flex items-start gap-1.5 text-aire-ink-2">
                          <Icon name="handshake" size={16} className="mt-px shrink-0 text-aire-accent-text" />
                          {t.trueque.miPropuesta
                            ? tr("Trueque · propusiste a cambio: {texto}", { texto: t.trueque.miPropuesta })
                            : tr("Trueque · a cambio: {texto}", { texto: t.trueque.ofrece })}
                        </p>
                      )}
                      {t.trueque && t.asignadoAMi && <AcuerdoTrueque trabajo={t} rol="trabajador" />}
                      {t.trueque && asignado && !t.trueque.acuerdoAceptado && (
                        <>
                          <p className="aire-text-footnote text-aire-ink-2">
                            {tr("{nombre} te eligió y firmó el acuerdo. Acéptalo para empezar.", { nombre: t.publicador })}
                          </p>
                          <div className="grid grid-cols-2 gap-2.5">
                            <Button
                              variant="secondary"
                              onClick={() => ejecutar(() => api.trabajos.cancelar(t.id), tr("Rechazaste el acuerdo"))}
                            >
                              {tr("No acepto")}
                            </Button>
                            <Button
                              icon="handshake"
                              onClick={() => ejecutar(() => api.trabajos.aceptarTrueque(t.id), tr("Acuerdo aceptado: ¡a trabajar!"))}
                            >
                              {tr("Aceptar acuerdo")}
                            </Button>
                          </div>
                        </>
                      )}
                      {t.asignadoAMi && (!t.trueque || t.trueque.acuerdoAceptado) && <SeguimientoTrabajo etapa={t.etapa} />}
                      {asignado && siguiente && (!t.trueque || t.trueque.acuerdoAceptado) && (
                        <Button icon={ICONO_ETAPA[siguiente]} onClick={() => ejecutar(() => api.trabajos.avanzarEtapa(t.id), tr("Seguimiento actualizado"))}>
                          {siguiente === "Terminado"
                            ? t.trueque
                              ? tr("Entregué mi parte")
                              : tr("Marcar como terminado")
                            : tr(siguiente === "En camino" ? "Estoy en camino" : "Ya llegué")}
                        </Button>
                      )}
                      {t.trueque?.etapa === "primera" && t.asignadoAMi && (
                        <>
                          <p className="aire-text-footnote text-aire-ink-2">
                            {tr("Entregaste tu parte. Cuando {nombre} cumpla la suya, cierra el trueque.", { nombre: t.publicador })}
                          </p>
                          <Button
                            icon="task_alt"
                            onClick={() => ejecutar(() => api.trabajos.finalizarTrueque(t.id), tr("¡Trueque finalizado!"))}
                          >
                            {tr("Recibí su parte: finalizar trueque")}
                          </Button>
                        </>
                      )}
                      {t.serie?.activa && t.serie.aceptada && t.serie.trabajadorId === t.trabajadorId && t.asignadoAMi && t.estado !== "Finalizado" && (
                        <Button
                          variant="plain"
                          icon="event_repeat"
                          onClick={() => {
                            if (!t.serie || !window.confirm(tr("¿Dejar este servicio recurrente? Se cancelan las próximas visitas."))) return;
                            const serieId = t.serie.id;
                            ejecutar(async () => {
                              await api.agenda.terminarSerie(serieId);
                              return t;
                            }, tr("Dejaste el servicio recurrente"));
                          }}
                        >
                          {tr("Dejar el servicio recurrente")}
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
