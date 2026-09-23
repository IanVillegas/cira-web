import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { PageHeader } from "@/components/ui/PageHeader";
import { FilterChip } from "@/components/ui/FilterChip";
import { EmptyState } from "@/components/ui/EmptyState";
import { JobCard } from "@/components/JobCard";
import { Icon } from "@/components/ui/Icon";
import { trabajosMock } from "@/lib/mockData";
import type { Trabajo } from "@/lib/types";

export function ExplorarTrabajosPage() {
  const [trabajos, setTrabajos] = useState<Trabajo[]>(trabajosMock);
  const [ordenPorCercania, setOrdenPorCercania] = useState(false);

  const lista = useMemo(() => {
    if (!ordenPorCercania) return trabajos;
    return [...trabajos].sort((a, b) => a.distanciaKm - b.distanciaKm);
  }, [trabajos, ordenPorCercania]);

  const toggleApply = (id: string) => {
    setTrabajos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, yaPostulado: !t.yaPostulado } : t)),
    );
  };

  return (
    <div className="pb-4">
      <PageHeader title="Explorar" subtitle="Encuentra tu próximo servicio hoy." icon="work" />

      <div className="flex gap-2 px-5">
        <Link
          to="/explorar"
          className="flex-1 rounded-full bg-cira-secondary py-2 text-center text-sm font-semibold text-cira-accent"
        >
          Trabajos
        </Link>
        <Link
          to="/trabajadores"
          className="flex-1 rounded-full py-2 text-center text-sm font-semibold text-cira-text-secondary"
        >
          Trabajadores
        </Link>
      </div>

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
        {lista.length === 0 ? (
          <EmptyState
            icon="work_off"
            title="Sin trabajos disponibles"
            message="Cuando existan publicaciones activas aparecerán aquí."
          />
        ) : (
          lista.map((trabajo) => (
            <JobCard key={trabajo.id} trabajo={trabajo} onApply={toggleApply} />
          ))
        )}
      </div>
    </div>
  );
}
