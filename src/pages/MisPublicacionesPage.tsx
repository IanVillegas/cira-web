import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { JobCard } from "@/components/JobCard";
import { misPublicacionesMock } from "@/lib/mockData";

export function MisPublicacionesPage() {
  const navigate = useNavigate();

  return (
    <div className="pb-4">
      <PageHeader
        title="Mis publicaciones"
        subtitle="Trabajos que has publicado."
        icon="add"
        onIconClick={() => navigate("/crear-trabajo")}
      />

      <div className="px-5">
        {misPublicacionesMock.length === 0 ? (
          <EmptyState
            icon="post_add"
            title="Aún no has publicado nada"
            message="Publicá un trabajo y empezá a recibir postulaciones."
          />
        ) : (
          misPublicacionesMock.map((trabajo) => (
            <JobCard key={trabajo.id} trabajo={trabajo} />
          ))
        )}
      </div>
    </div>
  );
}
