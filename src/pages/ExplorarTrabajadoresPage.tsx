import { useState } from "react";
import { Link } from "react-router-dom";
import { PageHeader } from "@/components/ui/PageHeader";
import { FilterChip } from "@/components/ui/FilterChip";
import { EmptyState } from "@/components/ui/EmptyState";
import { WorkerCard } from "@/components/WorkerCard";
import { trabajadoresMock } from "@/lib/mockData";

export function ExplorarTrabajadoresPage() {
  const [soloDisponibles, setSoloDisponibles] = useState(false);

  const lista = soloDisponibles
    ? trabajadoresMock.filter((t) => t.disponible)
    : trabajadoresMock;

  return (
    <div className="pb-4">
      <PageHeader title="Explorar" subtitle="Trabajadores disponibles cerca de ti." icon="groups" />

      <div className="flex gap-2 px-5">
        <Link
          to="/explorar"
          className="flex-1 rounded-full py-2 text-center text-sm font-semibold text-cira-text-secondary"
        >
          Trabajos
        </Link>
        <Link
          to="/trabajadores"
          className="flex-1 rounded-full bg-cira-secondary py-2 text-center text-sm font-semibold text-cira-accent"
        >
          Trabajadores
        </Link>
      </div>

      <div className="mt-4 flex items-center gap-2 overflow-x-auto px-5 pb-1">
        <FilterChip label="Categoría" />
        <FilterChip
          label="Disponibles"
          active={soloDisponibles}
          onClick={() => setSoloDisponibles((v) => !v)}
        />
        <FilterChip label="Distancia" />
      </div>

      <div className="px-5 pt-4">
        {lista.length === 0 ? (
          <EmptyState
            icon="person_off"
            title="Sin trabajadores"
            message="No encontramos trabajadores con estos filtros."
          />
        ) : (
          lista.map((trabajador) => (
            <WorkerCard key={trabajador.id} trabajador={trabajador} />
          ))
        )}
      </div>
    </div>
  );
}
