import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Badge, Button, Card, Icon } from "@/components/aire";
import type { BadgeTone } from "@/components/aire/Badge";
import { CategoriaThumb } from "./CategoriaThumb";
import { Calificacion } from "./Estrellas";
import { InsigniaChips } from "./InsigniaChips";
import { PagoResumen } from "./PagoResumen";
import { SeguimientoTrabajo } from "./SeguimientoTrabajo";
import { api } from "@/lib/api";
import { formatoColones } from "@/lib/format";
import { tr } from "@/lib/i18n";
import { mostrarToast } from "@/lib/toast";
import type { Trabajador, Trabajo } from "@/lib/types";

interface PublicacionCardProps {
  trabajo: Trabajo;
  onChange: (trabajo: Trabajo) => void;
  onRate: (trabajo: Trabajo) => void;
  onPay: (trabajo: Trabajo) => void;
}

const ESTADO_TONO: Record<string, BadgeTone> = {
  Pendiente: "accent",
  Asignado: "warning",
  "En progreso": "success",
  Finalizado: "success",
};

/** Tarjeta de "Mis publicaciones": edita, elige postulante, sigue el trabajo, paga y califica. */
export function PublicacionCard({ trabajo, onChange, onRate, onPay }: PublicacionCardProps) {
  const navigate = useNavigate();
  const [postulantes, setPostulantes] = useState<Trabajador[] | null>(null);
  const [verPostulantes, setVerPostulantes] = useState(false);
  const [ocupado, setOcupado] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ejecutar = async (accion: () => Promise<Trabajo>, aviso?: string) => {
    setOcupado(true);
    setError(null);
    try {
      onChange(await accion());
      if (aviso) mostrarToast(aviso);
    } catch (e) {
      setError(e instanceof Error ? e.message : tr("No se pudo completar la acción."));
    } finally {
      setOcupado(false);
    }
  };

  const togglePostulantes = async () => {
    const abrir = !verPostulantes;
    setVerPostulantes(abrir);
    if (abrir) setPostulantes(await api.trabajos.postulantes(trabajo.id).catch(() => []));
  };

  const cancelar = () => {
    if (window.confirm(tr("¿Cancelar esta publicación?"))) ejecutar(() => api.trabajos.cancelar(trabajo.id), tr("Publicación cancelada"));
  };

  const abrirChat = async (usuarioId: string) => {
    const conversacion = await api.conversaciones.con(usuarioId);
    navigate(`/chats/${conversacion.id}`);
  };

  const pendiente = trabajo.estado === "Pendiente";
  // Oferta directa sin respuesta todavía: no recibe postulantes.
  const esperandoInvitado = pendiente && !!trabajo.invitadoId && !trabajo.invitacionRechazada;
  const enCurso = trabajo.estado === "Asignado" || trabajo.estado === "En progreso";

  return (
    <Card className="grid gap-4">
      <div className="flex items-start gap-3">
        <CategoriaThumb categoria={trabajo.categoria} />
        <div className="min-w-0 flex-1">
          <p className="flex flex-wrap items-center gap-1.5">
            <span className="aire-text-eyebrow text-aire-accent-text">{tr(trabajo.categoria)}</span>
            {trabajo.urgente && (
              <Badge tone="danger" dot pulse>
                {tr("Urgente")}
              </Badge>
            )}
          </p>
          <p className="aire-text-headline text-aire-ink">{trabajo.titulo}</p>
          <p className="aire-text-footnote text-aire-ink-2">
            {tr(trabajo.fecha)} · {formatoColones.format(trabajo.pago)}
          </p>
        </div>
        <Badge tone={ESTADO_TONO[trabajo.estado] ?? "neutral"}>{tr(trabajo.estado)}</Badge>
      </div>

      {pendiente && trabajo.urgente && (
        <p className="aire-text-subhead flex items-center gap-2 rounded-aire-md bg-aire-danger-soft p-3 text-aire-danger-text">
          <Icon name="notifications_active" size={20} />
          {tr("Buscando al trabajador más cercano disponible…")}
        </p>
      )}

      {esperandoInvitado && (
        <p className="aire-text-subhead flex items-center gap-2 rounded-aire-md bg-aire-accent-soft p-3 text-aire-accent-text">
          <Icon name="favorite" filled size={20} />
          {tr("Oferta directa para {nombre}. Esperando su respuesta…", { nombre: trabajo.invitadoNombre ?? "" })}
        </p>
      )}

      {pendiente && trabajo.invitacionRechazada && (
        <p className="aire-text-subhead flex items-center gap-2 rounded-aire-md bg-aire-surface-2 p-3 text-aire-ink-2">
          <Icon name="info" size={20} />
          {tr("{nombre} no pudo tomarlo. Tu publicación ahora está abierta para todos.", { nombre: trabajo.invitadoNombre ?? "" })}
        </p>
      )}

      {pendiente && (
        <>
          {!esperandoInvitado && (
            <button
              type="button"
              aria-expanded={verPostulantes}
              onClick={togglePostulantes}
              className="aire-text-headline flex min-h-12 items-center justify-between rounded-aire-md bg-aire-surface-2 px-4 text-left text-aire-ink transition-transform duration-[100ms] ease-aire-pop active:scale-[0.98]"
            >
              <span className="flex items-center gap-2">
                <Icon name="groups" size={20} className="text-aire-accent-text" />
                {tr("{n} postulante(s)", { n: trabajo.postulantes })}
              </span>
              <Icon
                name="expand_more"
                size={22}
                className={`text-aire-ink-2 transition-transform duration-[320ms] ease-aire-spring ${verPostulantes ? "rotate-180" : ""}`}
              />
            </button>
          )}

          {!esperandoInvitado && verPostulantes &&
            (postulantes === null ? null : postulantes.length === 0 ? (
              <p className="aire-text-subhead text-center text-aire-ink-2">{tr("Aún no hay postulantes.")}</p>
            ) : (
              postulantes.map((p) => (
                <Card key={p.id} inset padding="sm" className="grid gap-2.5">
                  <div className="flex items-center gap-2">
                    <span className="aire-text-headline min-w-0 flex-1 truncate text-aire-ink">{p.nombre}</span>
                    <Calificacion valor={p.calificacion} total={p.numCalificaciones} />
                  </div>
                  <InsigniaChips insignias={p.insignias} compact />
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="secondary" size="sm" onClick={() => navigate(`/usuarios/${p.id}`)}>
                      {tr("Ver perfil")}
                    </Button>
                    <Button size="sm" disabled={ocupado} onClick={() => ejecutar(() => api.trabajos.asignar(trabajo.id, p.id), tr("Trabajador elegido"))}>
                      {tr("Elegir")}
                    </Button>
                  </div>
                </Card>
              ))
            ))}

          <div className="grid grid-cols-2 gap-2.5">
            <Button variant="secondary" icon="edit" onClick={() => navigate(`/publicaciones/${trabajo.id}/editar`)}>
              {tr("Editar")}
            </Button>
            <Button variant="destructive" disabled={ocupado} onClick={cancelar}>
              {tr("Cancelar")}
            </Button>
          </div>
        </>
      )}

      {(enCurso || trabajo.estado === "Finalizado") && (
        <>
          <button
            type="button"
            onClick={() => trabajo.trabajadorId && abrirChat(trabajo.trabajadorId)}
            className="aire-text-headline flex min-h-12 items-center gap-2 rounded-aire-md bg-aire-surface-2 px-4 text-left text-aire-ink transition-transform duration-[100ms] ease-aire-pop active:scale-[0.98]"
          >
            <Icon name="person" size={20} className="text-aire-accent-text" />
            <span className="flex-1 truncate">{trabajo.trabajadorNombre}</span>
            <Icon name="chat_bubble" size={20} className="text-aire-accent-text" />
          </button>
          <SeguimientoTrabajo etapa={trabajo.etapa} />
        </>
      )}

      {enCurso && (
        <Button variant="destructive" disabled={ocupado} onClick={cancelar}>
          {tr("Cancelar trabajo")}
        </Button>
      )}

      {trabajo.estado === "Finalizado" && !trabajo.pagado && (
        <>
          <PagoResumen resumen={trabajo.resumenPago} />
          <Button icon="credit_card" onClick={() => onPay(trabajo)}>
            {trabajo.metodoPago === "Tarjeta" ? tr("Pagar con tarjeta") : tr("Pagar el trabajo")}
          </Button>
        </>
      )}

      {trabajo.estado === "Finalizado" && trabajo.pagado && !trabajo.calificadoPorMi && (
        <Button icon="star" onClick={() => onRate(trabajo)}>
          {tr("Calificar a {nombre}", { nombre: trabajo.trabajadorNombre ?? "" })}
        </Button>
      )}

      {error && <p className="aire-text-footnote text-center font-semibold text-aire-danger-text">{error}</p>}
    </Card>
  );
}
