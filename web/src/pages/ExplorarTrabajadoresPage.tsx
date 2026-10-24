import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FilterChip, Loader, PageHeader, Stagger } from "@/components/aire";
import { ExploreTabs } from "@/components/ExploreTabs";
import { Vacio } from "@/components/Vacio";
import { WorkerCard } from "@/components/WorkerCard";
import { api } from "@/lib/api";
import { tr } from "@/lib/i18n";
import type { Trabajador } from "@/lib/types";

export function ExplorarTrabajadoresPage() {
  const navigate = useNavigate();
  const [trabajadores, setTrabajadores] = useState<Trabajador[] | null>(null);
  const [soloDisponibles, setSoloDisponibles] = useState(false);
  const [soloConfianza, setSoloConfianza] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.trabajadores
      .listar()
      .then(setTrabajadores)
      .catch(() => setError(tr("No se pudo conectar con el servidor local (CIRA-Server).")));
  }, []);

  const lista = (trabajadores ?? []).filter((t) => (!soloDisponibles || t.disponible) && (!soloConfianza || t.deConfianza));
  const actualizar = (t: Trabajador) => setTrabajadores((prev) => prev?.map((x) => (x.id === t.id ? t : x)) ?? prev);

  return (
    <div className="pb-6">
      <PageHeader
        title={tr("Explorar")}
        subtitle={tr("Encuentra a quién contratar hoy.")}
        action={{ icon: "notifications", label: tr("Alertas"), onClick: () => navigate("/alertas") }}
      />
      <ExploreTabs />

      <div className="no-scrollbar mt-4 flex items-center gap-2 overflow-x-auto px-5 pb-1">
        <FilterChip label={tr("Disponibles")} active={soloDisponibles} onClick={() => setSoloDisponibles((v) => !v)} />
        <FilterChip label={tr("De confianza")} active={soloConfianza} onClick={() => setSoloConfianza((v) => !v)} />
      </div>

      <div className="grid gap-3 px-5 pt-4">
        {error ? (
          <Vacio image="empty_not_found_variant" title={tr("No fue posible cargar trabajadores")} message={tr("Verifica tu conexión o intenta nuevamente.")} />
        ) : trabajadores === null ? (
          <Loader label={tr("Cargando trabajadores...")} />
        ) : lista.length === 0 && soloConfianza ? (
          <Vacio
            title={tr("Todavía no tienes trabajadores de confianza")}
            message={tr("Toca el corazón en un trabajador para guardarlo y recontratarlo cuando lo necesites.")}
          />
        ) : lista.length === 0 ? (
          <Vacio title={tr("Sin trabajadores disponibles")} message={tr("Cuando existan trabajadores disponibles aparecerán aquí.")} />
        ) : (
          <Stagger className="grid gap-3">
            {lista.map((trabajador) => (
              <WorkerCard key={trabajador.id} trabajador={trabajador} onChange={actualizar} />
            ))}
          </Stagger>
        )}
      </div>
    </div>
  );
}
