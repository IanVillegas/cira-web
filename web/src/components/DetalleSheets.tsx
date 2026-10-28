import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sheet } from "@/components/aire";
import { JobCard } from "./JobCard";
import { PostularTruequeSheet } from "./PostularTruequeSheet";
import { WorkerCard } from "./WorkerCard";
import { api } from "@/lib/api";
import { tr } from "@/lib/i18n";
import { mostrarToast } from "@/lib/toast";
import type { Trabajador, Trabajo } from "@/lib/types";

/**
 * Guarda el último valor no nulo: mientras la hoja baja al cerrarse, sigue
 * mostrando lo que tenía en vez de quedar vacía.
 */
function useUltimo<T>(valor: T | null): T | null {
  const [ultimo, setUltimo] = useState<T | null>(valor);
  if (valor !== null && valor !== ultimo) setUltimo(valor);
  return valor ?? ultimo;
}

interface TrabajoSheetProps {
  trabajo: Trabajo | null;
  onClose: () => void;
  /** El trabajo cambió (por ejemplo, el usuario se postuló): actualiza la lista. */
  onCambio: (trabajo: Trabajo) => void;
  /** Hubo que recargar (una urgencia que ya tomó otra persona). */
  onRecargar: () => void;
}

/** Hoja con el trabajo completo (la tarjeta grande) y todas sus acciones. */
export function TrabajoSheet({ trabajo, onClose, onCambio, onRecargar }: TrabajoSheetProps) {
  const navigate = useNavigate();
  const visible = useUltimo(trabajo);
  // Trueque al que se está postulando: la hoja pregunta si acepta lo ofrecido o propone otra cosa.
  const [postulandoA, setPostulandoA] = useState<Trabajo | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);

  const cerrar = () => {
    setAviso(null);
    onClose();
  };

  const postular = async (id: string, propuesta?: string) => {
    try {
      const actualizado = await api.trabajos.postular(id, propuesta);
      mostrarToast(actualizado.yaPostulado ? tr("Te postulaste al trabajo") : tr("Retiraste tu postulación"));
      onCambio(actualizado);
    } catch (e) {
      setAviso(e instanceof Error ? e.message : tr("No se pudo completar la acción."));
    }
  };

  const toggleApply = async (id: string) => {
    if (!visible) return;
    // Postularse a un trueque abre su hoja (se cierra esta); retirarse es directo.
    if (visible.trueque && !visible.yaPostulado) {
      setPostulandoA(visible);
      cerrar();
    } else await postular(id);
  };

  const aceptarUrgencia = async (id: string) => {
    try {
      await api.trabajos.aceptarUrgencia(id);
      mostrarToast(tr("¡Urgencia aceptada! Avisa cuando vayas en camino."));
      navigate("/mis-trabajos");
    } catch (e) {
      setAviso(e instanceof Error ? e.message : tr("No se pudo aceptar la urgencia."));
      onRecargar();
    }
  };

  return (
    <>
      <Sheet open={trabajo !== null} onClose={cerrar} title={tr("Detalle del trabajo")} contained>
        {visible && (
          <div className="ca-detalle grid gap-3 pb-1">
            {aviso && (
              <p role="alert" className="aire-text-subhead rounded-aire-md bg-aire-danger-soft p-3 font-semibold text-aire-danger-text">
                {aviso}
              </p>
            )}
            {/* key: si cambia de trabajo, la tarjeta arranca de nuevo con la descripción abierta. */}
            <JobCard key={visible.id} trabajo={visible} onApply={toggleApply} onAcceptUrgent={aceptarUrgencia} defaultExpanded />
          </div>
        )}
      </Sheet>
      <PostularTruequeSheet trabajo={postulandoA} onClose={() => setPostulandoA(null)} onPostular={postular} />
    </>
  );
}

interface TrabajadorSheetProps {
  trabajador: Trabajador | null;
  onClose: () => void;
  onCambio: (trabajador: Trabajador) => void;
}

/** Hoja con el trabajador completo: servicios, insignias, ver perfil y contactar. */
export function TrabajadorSheet({ trabajador, onClose, onCambio }: TrabajadorSheetProps) {
  const visible = useUltimo(trabajador);
  return (
    <Sheet open={trabajador !== null} onClose={onClose} title={tr("Trabajador")} contained>
      {visible && (
        <div className="ca-detalle pb-1">
          <WorkerCard key={visible.id} trabajador={visible} onChange={onCambio} />
        </div>
      )}
    </Sheet>
  );
}
