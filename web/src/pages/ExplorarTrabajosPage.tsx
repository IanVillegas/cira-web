import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Fab, FilterChip, Loader, PageHeader, Stagger } from "@/components/aire";
import { ExploreTabs } from "@/components/ExploreTabs";
import { JobCard } from "@/components/JobCard";
import { PostularTruequeSheet } from "@/components/PostularTruequeSheet";
import { Vacio } from "@/components/Vacio";
import { api } from "@/lib/api";
import { tr } from "@/lib/i18n";
import { mostrarToast } from "@/lib/toast";
import type { Trabajo } from "@/lib/types";

export function ExplorarTrabajosPage() {
  const navigate = useNavigate();
  // Link compartido por WhatsApp (/explorar?trabajo=ID): ese trabajo va primero y abierto.
  const [searchParams] = useSearchParams();
  const destacado = searchParams.get("trabajo");
  const [trabajos, setTrabajos] = useState<Trabajo[] | null>(null);
  const [ordenPorCercania, setOrdenPorCercania] = useState(false);
  const [soloTrueques, setSoloTrueques] = useState(false);
  // Trueque al que se está postulando (la hoja pregunta si acepta lo ofrecido o propone otra cosa).
  const [postulandoA, setPostulandoA] = useState<Trabajo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);

  useEffect(() => {
    api.trabajos
      .listar()
      .then(setTrabajos)
      .catch(() => setError(tr("No se pudo conectar con el servidor local (CIRA-Server).")));
  }, []);

  const lista = useMemo(() => {
    if (!trabajos) return [];
    const filtrados = soloTrueques ? trabajos.filter((t) => t.trueque) : trabajos;
    const base = ordenPorCercania ? [...filtrados].sort((a, b) => a.distanciaKm - b.distanciaKm) : filtrados;
    // Las urgencias siempre arriba; el trabajo compartido por link, antes que todo.
    return [...base].sort(
      (a, b) => Number(b.id === destacado) - Number(a.id === destacado) || Number(b.urgente) - Number(a.urgente),
    );
  }, [trabajos, ordenPorCercania, soloTrueques, destacado]);

  const postular = async (id: string, propuesta?: string) => {
    try {
      const actualizado = await api.trabajos.postular(id, propuesta);
      mostrarToast(actualizado.yaPostulado ? tr("Te postulaste al trabajo") : tr("Retiraste tu postulación"));
      setTrabajos((prev) => prev?.map((t) => (t.id === id ? actualizado : t)) ?? prev);
    } catch (e) {
      setAviso(e instanceof Error ? e.message : tr("No se pudo completar la acción."));
    }
  };

  const toggleApply = async (id: string) => {
    const trabajo = trabajos?.find((t) => t.id === id);
    // Postularse a un trueque abre la hoja de acuerdo/contrapropuesta; retirarse es directo.
    if (trabajo?.trueque && !trabajo.yaPostulado) setPostulandoA(trabajo);
    else await postular(id);
  };

  const aceptarUrgencia = async (id: string) => {
    try {
      await api.trabajos.aceptarUrgencia(id);
      mostrarToast(tr("¡Urgencia aceptada! Avisa cuando vayas en camino."));
      navigate("/mis-trabajos");
    } catch (e) {
      setAviso(e instanceof Error ? e.message : tr("No se pudo aceptar la urgencia."));
      api.trabajos.listar().then(setTrabajos).catch(() => {});
    }
  };

  return (
    <div className="pb-6">
      <PageHeader
        title={tr("Explorar")}
        subtitle={tr("Encuentra tu próximo servicio hoy.")}
        action={{ icon: "notifications", label: tr("Alertas"), onClick: () => navigate("/alertas") }}
      />
      <ExploreTabs />

      <div className="no-scrollbar mt-4 flex items-center gap-2 overflow-x-auto px-5 pb-1">
        <FilterChip label={tr("Cercanía")} active={ordenPorCercania} onClick={() => setOrdenPorCercania((v) => !v)} />
        <FilterChip label={tr("Trueques")} active={soloTrueques} onClick={() => setSoloTrueques((v) => !v)} />
      </div>

      <div className="grid gap-3 px-5 pt-4">
        {aviso && (
          <p role="alert" className="aire-text-subhead rounded-aire-md bg-aire-danger-soft p-3 font-semibold text-aire-danger-text">
            {aviso}
          </p>
        )}
        {error ? (
          <Vacio image="empty_no_signal" title={tr("Sin conexión")} message={error} />
        ) : trabajos === null ? (
          <Loader label={tr("Cargando trabajos...")} />
        ) : lista.length === 0 ? (
          <Vacio title={tr("Sin trabajos disponibles")} message={tr("Cuando existan publicaciones activas aparecerán aquí.")} />
        ) : (
          <Stagger key={soloTrueques ? "trueques" : "todos"} className="grid gap-3">
            {lista.map((trabajo) => (
              <JobCard
                key={trabajo.id}
                trabajo={trabajo}
                onApply={toggleApply}
                onAcceptUrgent={aceptarUrgencia}
                defaultExpanded={trabajo.id === destacado}
              />
            ))}
          </Stagger>
        )}
      </div>

      {/* El área con scroll ya reserva el alto de la barra: el botón solo se separa 12px de ella. */}
      <div className="pointer-events-none sticky bottom-3 mt-4 flex justify-end px-5">
        <span className="pointer-events-auto">
          <Fab icon="add" label={tr("Crear publicación")} onClick={() => navigate("/crear-trabajo")} />
        </span>
      </div>

      <PostularTruequeSheet trabajo={postulandoA} onClose={() => setPostulandoA(null)} onPostular={postular} />
    </div>
  );
}
