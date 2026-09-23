import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { Loader } from "@/components/ui/Loader";
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
      <PageHeader
        title="Mis publicaciones"
        subtitle="Trabajos que has publicado."
        icon="add"
        onIconClick={() => navigate("/crear-trabajo")}
      />

      <div className="px-5">
        {publicaciones === null ? (
          <Loader label="Cargando publicaciones..." />
        ) : publicaciones.length === 0 ? (
          <EmptyState
            icon="post_add"
            title="Aún no has publicado nada"
            message="Publicá un trabajo y empezá a recibir postulaciones."
          />
        ) : (
          publicaciones.map((trabajo) => <JobCard key={trabajo.id} trabajo={trabajo} />)
        )}
      </div>
    </div>
  );
}
