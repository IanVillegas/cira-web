import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  EmptyState,
  FilterChip,
  Icon,
  Loader,
  PageHeader,
  PhotoJobCard,
  SegmentedControl,
  Stagger,
} from "@/components/aire";
import { api } from "@/lib/api";
import type { Trabajo } from "@/lib/types";

const SECCIONES = [
  { value: "/explorar", label: "Trabajos" },
  { value: "/trabajadores", label: "Trabajadores" },
  { value: "/publicaciones", label: "Mis publicaciones" },
  { value: "/mis-trabajos", label: "Mis trabajos" },
];

export function ExplorarTrabajosPage() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [trabajos, setTrabajos] = useState<Trabajo[] | null>(null);
  const [ordenPorCercania, setOrdenPorCercania] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.trabajos
      .listar()
      .then(setTrabajos)
      .catch(() => setError("No se pudo conectar con el servidor local (CIRA-Server)."));
  }, []);

  const lista = useMemo(() => {
    if (!trabajos) return [];
    if (!ordenPorCercania) return trabajos;
    return [...trabajos].sort((a, b) => a.distanciaKm - b.distanciaKm);
  }, [trabajos, ordenPorCercania]);

  const toggleApply = async (id: string) => {
    const actualizado = await api.trabajos.postular(id);
    setTrabajos((prev) => prev?.map((t) => (t.id === id ? actualizado : t)) ?? prev);
  };

  return (
    <div className="ca-root min-h-full pb-4">
      <PageHeader title="Explorar" subtitle="Encuentra tu próximo servicio hoy." />

      <div className="px-5">
        <SegmentedControl items={SECCIONES} value={pathname} onChange={navigate} label="Explorar" />
      </div>

      <div className="no-scrollbar mt-4 flex items-center gap-2 overflow-x-auto px-5 pb-1">
        <FilterChip label="Precio" />
        <FilterChip label="Cercanía" active={ordenPorCercania} onClick={() => setOrdenPorCercania((v) => !v)} />
        <FilterChip label="Fecha" />
        <FilterChip label="Categoría" />
        <button
          type="button"
          className="ca-iconbtn ml-auto shrink-0"
          aria-label="Limpiar filtros"
          onClick={() => setOrdenPorCercania(false)}
        >
          <Icon name="filter_alt_off" size={20} />
        </button>
      </div>

      <div className="px-5 pt-4">
        {error ? (
          <EmptyState image="/images/empty_no_signal.svg" title="Sin conexión" message={error} />
        ) : trabajos === null ? (
          <Loader label="Cargando trabajos…" />
        ) : lista.length === 0 ? (
          <EmptyState
            image="/images/empty_no_data_variant.svg"
            title="Sin trabajos disponibles"
            message="Cuando existan publicaciones activas aparecerán aquí."
          />
        ) : (
          <Stagger key={ordenPorCercania ? "cerca" : "todos"} className="grid gap-3">
            {lista.map((trabajo) => (
              <PhotoJobCard
                key={trabajo.id}
                trabajo={trabajo}
                onApply={toggleApply}
                onContact={() => navigate("/chats")}
                onMap={() => navigate("/mapa")}
              />
            ))}
          </Stagger>
        )}
      </div>
    </div>
  );
}
