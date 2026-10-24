import { useEffect, useState } from "react";
import { Badge, Button, Card, Icon, Spinner } from "@/components/aire";
import { Calificacion } from "./Estrellas";
import { api } from "@/lib/api";
import { diaLargo } from "@/lib/fechas";
import { tr } from "@/lib/i18n";
import { mostrarToast } from "@/lib/toast";
import type { Trabajador, Trabajo } from "@/lib/types";

/**
 * Visita de un servicio recurrente que el trabajador no puede hacer: CIRA sugiere reemplazos
 * (primero los "De confianza" del cliente, libres ese día) y el cliente elige o la publica para todos.
 */
export function ReemplazoVisita({ trabajo, onChange }: { trabajo: Trabajo; onChange: (t: Trabajo) => void }) {
  const [candidatos, setCandidatos] = useState<Trabajador[] | null>(null);
  const [eligiendo, setEligiendo] = useState<string | null>(null);

  useEffect(() => {
    let vivo = true;
    api.trabajos
      .reemplazos(trabajo.id)
      .then((c) => vivo && setCandidatos(c))
      .catch(() => vivo && setCandidatos([]));
    return () => {
      vivo = false;
    };
  }, [trabajo.id]);

  const elegir = async (t: Trabajador) => {
    setEligiendo(t.id);
    try {
      onChange(await api.trabajos.elegirReemplazo(trabajo.id, t.id));
      mostrarToast(tr("Le ofrecimos la visita a {nombre}", { nombre: t.nombre }));
    } catch (e) {
      mostrarToast(e instanceof Error ? e.message : tr("No se pudo completar la acción."), "error");
    } finally {
      setEligiendo(null);
    }
  };

  const publicar = async () => {
    setEligiendo("todos");
    try {
      onChange(await api.trabajos.publicarAbierto(trabajo.id));
      mostrarToast(tr("Visita publicada para todos"), "info");
    } finally {
      setEligiendo(null);
    }
  };

  return (
    <div className="grid gap-2.5">
      <p className="aire-text-subhead flex items-start gap-2 rounded-aire-md bg-aire-warning-soft p-3 text-aire-warning-text">
        <Icon name="event_busy" size={20} className="mt-px shrink-0" />
        {tr("{nombre} no puede ir el {fecha}. Elige quién lo reemplaza en esta visita; la serie sigue con {nombre}.", {
          nombre: trabajo.serie?.trabajadorNombre ?? "",
          fecha: trabajo.fecha ? diaLargo(trabajo.fecha.slice(0, 10)) : "",
        })}
      </p>
      <p className="aire-text-eyebrow text-aire-ink-2">{tr("Reemplazos sugeridos")}</p>
      {candidatos === null ? (
        <div className="flex justify-center py-3">
          <Spinner size={22} />
        </div>
      ) : candidatos.length === 0 ? (
        <p className="aire-text-footnote text-aire-ink-2">{tr("No encontramos a nadie libre de ese oficio ese día.")}</p>
      ) : (
        candidatos.map((c) => (
          <Card key={c.id} inset padding="sm" className="flex items-center gap-3">
            <div className="grid min-w-0 flex-1 gap-0.5">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="aire-text-headline truncate text-aire-ink">{c.nombre}</span>
                <Calificacion valor={c.calificacion} total={c.numCalificaciones} />
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                {c.deConfianza && (
                  <Badge tone="accent">
                    <Icon name="favorite" filled size={13} />
                    {tr("De confianza")}
                  </Badge>
                )}
                <span className="aire-text-caption text-aire-ink-2">{tr("Libre ese día · {km} km", { km: c.distanciaKm })}</span>
              </div>
            </div>
            <Button size="sm" fullWidth={false} loading={eligiendo === c.id} disabled={eligiendo !== null} onClick={() => elegir(c)}>
              {tr("Elegir")}
            </Button>
          </Card>
        ))
      )}
      <Button variant="plain" disabled={eligiendo !== null} onClick={publicar}>
        {tr("Publicar esta visita para todos")}
      </Button>
    </div>
  );
}
