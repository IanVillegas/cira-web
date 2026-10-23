import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { PageHeader } from "@/components/ui/PageHeader";
import { ExploreTabs } from "@/components/ui/ExploreTabs";
import { FilterChip } from "@/components/ui/FilterChip";
import { EmptyState } from "@/components/ui/EmptyState";
import { Loader } from "@/components/ui/Loader";
import { JobCard } from "@/components/JobCard";
import { Icon } from "@/components/ui/Icon";
import { api } from "@/lib/api";
import type { Trabajo } from "@/lib/types";

export function ExplorarTrabajosPage() {
  const navigate = useNavigate();
  // Link compartido por WhatsApp (/explorar?trabajo=ID): ese trabajo va primero y abierto.
  const [searchParams] = useSearchParams();
  const destacado = searchParams.get("trabajo");
  const [trabajos, setTrabajos] = useState<Trabajo[] | null>(null);
  const [ordenPorCercania, setOrdenPorCercania] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);

  useEffect(() => {
    api.trabajos
      .listar()
      .then(setTrabajos)
      .catch(() => setError("No se pudo conectar con el servidor local (CIRA-Server)."));
  }, []);

  const lista = useMemo(() => {
    if (!trabajos) return [];
    const base = ordenPorCercania ? [...trabajos].sort((a, b) => a.distanciaKm - b.distanciaKm) : trabajos;
    // Las urgencias siempre arriba; el trabajo compartido por link, antes que todo.
    return [...base].sort(
      (a, b) =>
        Number(b.id === destacado) - Number(a.id === destacado) || Number(b.urgente) - Number(a.urgente),
    );
  }, [trabajos, ordenPorCercania, destacado]);

  const toggleApply = async (id: string) => {
    try {
      const actualizado = await api.trabajos.postular(id);
      setTrabajos((prev) => prev?.map((t) => (t.id === id ? actualizado : t)) ?? prev);
    } catch (e) {
      setAviso(e instanceof Error ? e.message : "No se pudo completar la acción.");
    }
  };

  const aceptarUrgencia = async (id: string) => {
    try {
      await api.trabajos.aceptarUrgencia(id);
      navigate("/mis-trabajos");
    } catch (e) {
      setAviso(e instanceof Error ? e.message : "No se pudo aceptar la urgencia.");
      api.trabajos.listar().then(setTrabajos).catch(() => {});
    }
  };

  return (
    <div className="pb-4">
      <PageHeader title="Explorar" subtitle="Encuentra tu próximo servicio hoy." icon="work" />

      <ExploreTabs />

      <div className="mt-4 flex items-center gap-2 overflow-x-auto px-5 pb-1">
        <FilterChip label="Precio" />
        <FilterChip
          label="Cercanía"
          active={ordenPorCercania}
          onClick={() => setOrdenPorCercania((v) => !v)}
        />
        <FilterChip label="Fecha" />
        <FilterChip label="Categoría" />
        <button
          className="ml-auto flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-cira-card text-cira-accent shadow"
          aria-label="Limpiar filtros"
          onClick={() => setOrdenPorCercania(false)}
        >
          <Icon name="cleaning_services" size={20} />
        </button>
      </div>

      <div className="px-5 pt-4">
        {aviso && (
          <p role="alert" className="mb-3 rounded-2xl bg-cira-btn-destructive-bg p-3 text-[13px] font-semibold text-cira-btn-destructive-text">
            {aviso}
          </p>
        )}
        {error ? (
          <EmptyState image="empty_no_signal" title="Sin conexión" message={error} />
        ) : trabajos === null ? (
          <Loader label="Cargando trabajos..." />
        ) : lista.length === 0 ? (
          <EmptyState
            title="Sin trabajos disponibles"
            message="Cuando existan publicaciones activas aparecerán aquí."
          />
        ) : (
          lista.map((trabajo) => (
            <JobCard
              key={trabajo.id}
              trabajo={trabajo}
              onApply={toggleApply}
              onAcceptUrgent={aceptarUrgencia}
              defaultExpanded={trabajo.id === destacado}
            />
          ))
        )}
      </div>
    </div>
  );
}
