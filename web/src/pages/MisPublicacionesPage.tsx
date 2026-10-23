import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/ui/PageHeader";
import { ExploreTabs } from "@/components/ui/ExploreTabs";
import { EmptyState } from "@/components/ui/EmptyState";
import { Loader } from "@/components/ui/Loader";
import { Button } from "@/components/ui/Button";
import { PublicacionCard } from "@/components/PublicacionCard";
import { RatingSheet } from "@/components/RatingSheet";
import { api } from "@/lib/api";
import { usePolling } from "@/lib/usePolling";
import type { Trabajo } from "@/lib/types";
import { tr } from "@/lib/i18n";

export function MisPublicacionesPage() {
  const navigate = useNavigate();
  const [publicaciones, setPublicaciones] = useState<Trabajo[] | null>(null);
  const [aCalificar, setACalificar] = useState<Trabajo | null>(null);

  const cargar = useCallback(
    () => api.trabajos.listar({ publicadas: true }).then(setPublicaciones).catch(() => setPublicaciones((p) => p ?? [])),
    [],
  );

  useEffect(() => {
    cargar();
  }, [cargar]);
  // Para ver el seguimiento (En camino, Llegó…) sin recargar.
  usePolling(cargar, 5000);

  // Una calificación enviada saca el trabajo de la lista si ya estaba pagado.
  const actualizar = (t: Trabajo) =>
    setPublicaciones((prev) =>
      (prev ?? [])
        .map((p) => (p.id === t.id ? t : p))
        .filter((p) => p.estado !== "Cancelado" && (p.estado !== "Finalizado" || !p.pagado || !p.calificadoPorMi)),
    );

  return (
    <div className="pb-4">
      <PageHeader title={tr("Explorar")} subtitle={tr("Consulta y administra tus publicaciones.")} icon="article" />
      <ExploreTabs />

      <div className="px-5 pt-4">
        <Button className="mb-4" onClick={() => navigate("/crear-trabajo")}>
          {tr("Crear publicación")}
        </Button>

        {publicaciones === null ? (
          <Loader label={tr("Cargando publicaciones...")} />
        ) : publicaciones.length === 0 ? (
          <EmptyState
            title={tr("No tienes publicaciones todavía")}
            message={tr("Crea tu primera publicación para recibir postulantes.")}
          />
        ) : (
          publicaciones.map((trabajo) => (
            <PublicacionCard key={trabajo.id} trabajo={trabajo} onChange={actualizar} onRate={setACalificar} />
          ))
        )}
      </div>

      <RatingSheet
        trabajo={aCalificar}
        onClose={() => setACalificar(null)}
        onDone={(t) => {
          setACalificar(null);
          actualizar(t);
        }}
      />
    </div>
  );
}
