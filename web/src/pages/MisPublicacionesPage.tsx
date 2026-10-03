import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/ui/PageHeader";
import { ExploreTabs } from "@/components/ui/ExploreTabs";
import { EmptyState } from "@/components/ui/EmptyState";
import { Loader } from "@/components/ui/Loader";
import { Button } from "@/components/ui/Button";
import { JobCard } from "@/components/JobCard";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import type { Trabajo } from "@/lib/types";

export function MisPublicacionesPage() {
  const navigate = useNavigate();
  const { usuario } = useAuth();
  const [publicaciones, setPublicaciones] = useState<Trabajo[] | null>(null);

  useEffect(() => {
    if (!usuario) return;
    api.trabajos
      .listar({ publicador: usuario.nombre })
      .then(setPublicaciones)
      .catch(() => setPublicaciones([]));
  }, [usuario]);

  return (
    <div className="pb-4">
      <PageHeader title="Explorar" subtitle="Consulta y administra tus publicaciones." icon="article" />
      <ExploreTabs />

      <div className="px-5 pt-4">
        <Button className="mb-4" onClick={() => navigate("/crear-trabajo")}>
          Crear publicación
        </Button>

        {publicaciones === null ? (
          <Loader label="Cargando publicaciones..." />
        ) : publicaciones.length === 0 ? (
          <EmptyState
            title="No tienes publicaciones todavía"
            message="Crea tu primera publicación para recibir postulantes."
          />
        ) : (
          publicaciones.map((trabajo) => <JobCard key={trabajo.id} trabajo={trabajo} />)
        )}
      </div>
    </div>
  );
}
