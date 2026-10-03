import { useEffect, useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { ExploreTabs } from "@/components/ui/ExploreTabs";
import { FilterChip } from "@/components/ui/FilterChip";
import { EmptyState } from "@/components/ui/EmptyState";
import { Loader } from "@/components/ui/Loader";
import { WorkerCard } from "@/components/WorkerCard";
import { api } from "@/lib/api";
import type { Trabajador } from "@/lib/types";

export function ExplorarTrabajadoresPage() {
  const [trabajadores, setTrabajadores] = useState<Trabajador[] | null>(null);
  const [soloDisponibles, setSoloDisponibles] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.trabajadores
      .listar()
      .then(setTrabajadores)
      .catch(() => setError("No se pudo conectar con el servidor local (CIRA-Server)."));
  }, []);

  const lista = (trabajadores ?? []).filter((t) => !soloDisponibles || t.disponible);

  return (
    <div className="pb-4">
      <PageHeader title="Explorar" subtitle="Busca trabajadores disponibles y envía solicitud directa." icon="group" />

      <ExploreTabs />

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
        {error ? (
          <EmptyState image="empty_not_found_variant" title="No fue posible cargar trabajadores" message="Verifica tu conexión o intenta nuevamente." />
        ) : trabajadores === null ? (
          <Loader label="Cargando trabajadores..." />
        ) : lista.length === 0 ? (
          <EmptyState
            title="Sin trabajadores disponibles"
            message="Cuando existan trabajadores disponibles aparecerán aquí."
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
