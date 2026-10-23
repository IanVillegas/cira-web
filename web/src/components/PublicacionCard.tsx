import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "./ui/Card";
import { Button } from "./ui/Button";
import { Icon } from "./ui/Icon";
import { Calificacion } from "./Estrellas";
import { InsigniaChips } from "./InsigniaChips";
import { PagoResumen } from "./PagoResumen";
import { SeguimientoTrabajo } from "./SeguimientoTrabajo";
import { api } from "@/lib/api";
import { formatoColones } from "@/lib/format";
import type { Trabajador, Trabajo } from "@/lib/types";
import { tr } from "@/lib/i18n";
import { mostrarToast } from "@/lib/toast";

interface PublicacionCardProps {
  trabajo: Trabajo;
  onChange: (trabajo: Trabajo) => void;
  onRate: (trabajo: Trabajo) => void;
  onPay: (trabajo: Trabajo) => void;
}

const ESTADO_TONO: Record<string, string> = {
  Pendiente: "bg-cira-nav-selected-bg text-cira-accent",
  Asignado: "bg-amber-100 text-amber-700",
  "En progreso": "bg-emerald-100 text-emerald-700",
  Finalizado: "bg-emerald-100 text-emerald-700",
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
  const enCurso = trabajo.estado === "Asignado" || trabajo.estado === "En progreso";

  return (
    <Card className="mb-3.5 flex flex-col gap-3 shadow-[0_10px_28px_-14px_rgba(25,28,30,0.22)]">
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1.5 text-[11px] font-semibold tracking-wider text-cira-accent uppercase">
            {tr(trabajo.categoria)}
            {trabajo.urgente && (
              <span className="inline-flex items-center gap-0.5 rounded-full bg-cira-btn-destructive-bg px-1.5 py-0.5 text-[10px] text-cira-btn-destructive-text">
                <Icon name="bolt" filled size={12} />
                {tr("URGENTE")}
              </span>
            )}
          </p>
          <p className="font-semibold text-cira-text-primary">{trabajo.titulo}</p>
          <p className="text-xs text-cira-text-helper">
            {tr(trabajo.fecha)} · {formatoColones.format(trabajo.pago)}
          </p>
        </div>
        <span className={`shrink-0 rounded-lg px-2 py-[3px] text-[11px] font-semibold ${ESTADO_TONO[trabajo.estado]}`}>
          {tr(trabajo.estado)}
        </span>
      </div>

      {pendiente && trabajo.urgente && (
        <p className="flex items-center gap-2 rounded-2xl bg-cira-btn-destructive-bg p-3 text-[13px] text-cira-btn-destructive-text">
          <Icon name="notifications_active" size={18} />
          {tr("Buscando al trabajador más cercano disponible…")}
        </p>
      )}

      {pendiente && (
        <>
          <button
            onClick={togglePostulantes}
            className="flex items-center justify-between rounded-2xl bg-cira-input-bg p-3 text-left text-sm font-semibold text-cira-text-primary"
          >
            <span className="flex items-center gap-2">
              <Icon name="groups" size={18} className="text-cira-accent" />
              {tr("{n} postulante(s)", { n: trabajo.postulantes })}
            </span>
            <Icon name={verPostulantes ? "expand_less" : "expand_more"} size={20} className="text-cira-accent" />
          </button>

          {verPostulantes &&
            (postulantes === null ? null : postulantes.length === 0 ? (
              <p className="text-center text-[13px] text-cira-text-secondary">{tr("Aún no hay postulantes.")}</p>
            ) : (
              postulantes.map((p) => (
                <div key={p.id} className="flex flex-col gap-2 rounded-2xl border border-cira-border p-3">
                  <div className="flex items-center gap-2">
                    <span className="min-w-0 flex-1 truncate text-sm font-semibold text-cira-text-primary">{p.nombre}</span>
                    <Calificacion valor={p.calificacion} total={p.numCalificaciones} />
                  </div>
                  <InsigniaChips insignias={p.insignias} compact />
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outlined" onClick={() => navigate(`/usuarios/${p.id}`)}>
                      {tr("VER PERFIL")}
                    </Button>
                    <Button disabled={ocupado} onClick={() => ejecutar(() => api.trabajos.asignar(trabajo.id, p.id), tr("Trabajador elegido"))}>
                      {tr("ELEGIR")}
                    </Button>
                  </div>
                </div>
              ))
            ))}

          <div className="grid grid-cols-2 gap-3">
            <Button variant="outlined" onClick={() => navigate(`/publicaciones/${trabajo.id}/editar`)}>
              {tr("EDITAR")}
            </Button>
            <Button variant="destructive" disabled={ocupado} onClick={cancelar}>
              {tr("CANCELAR")}
            </Button>
          </div>
        </>
      )}

      {(enCurso || trabajo.estado === "Finalizado") && (
        <>
          <button
            onClick={() => trabajo.trabajadorId && abrirChat(trabajo.trabajadorId)}
            className="flex items-center gap-2 rounded-2xl bg-cira-input-bg p-3 text-left text-sm text-cira-text-primary"
          >
            <Icon name="person" size={18} className="text-cira-accent" />
            <span className="flex-1 truncate font-semibold">{trabajo.trabajadorNombre}</span>
            <Icon name="chat" size={18} className="text-cira-accent" />
          </button>
          <SeguimientoTrabajo etapa={trabajo.etapa} />
        </>
      )}

      {enCurso && (
        <Button variant="destructive" disabled={ocupado} onClick={cancelar}>
          {tr("CANCELAR TRABAJO")}
        </Button>
      )}

      {trabajo.estado === "Finalizado" && !trabajo.pagado && (
        <>
          <PagoResumen resumen={trabajo.resumenPago} />
          <Button onClick={() => onPay(trabajo)}>
            {trabajo.metodoPago === "Tarjeta" ? tr("PAGAR CON TARJETA") : tr("PAGAR EL TRABAJO")}
          </Button>
        </>
      )}

      {trabajo.estado === "Finalizado" && trabajo.pagado && !trabajo.calificadoPorMi && (
        <Button onClick={() => onRate(trabajo)}>
          {tr("CALIFICAR A {nombre}", { nombre: (trabajo.trabajadorNombre ?? "").toUpperCase() })}</Button>
      )}

      {error && <p className="text-center text-[13px] text-cira-btn-destructive-text">{error}</p>}
    </Card>
  );
}
