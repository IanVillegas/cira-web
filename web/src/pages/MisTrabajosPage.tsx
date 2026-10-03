import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/ui/PageHeader";
import { ExploreTabs } from "@/components/ui/ExploreTabs";
import { EmptyState } from "@/components/ui/EmptyState";
import { Icon } from "@/components/ui/Icon";
import { Loader } from "@/components/ui/Loader";
import { CardAction, JobStatusCard, type StatusBadge } from "@/components/JobStatusCard";
import { api } from "@/lib/api";
import type { Trabajo } from "@/lib/types";

// Colores del StatusBackground/StatusTextColor de MisTrabajosPage.xaml.cs
function badgeDe(estado: Trabajo["estado"]): StatusBadge {
  if (estado === "Asignado") return { text: "Asignado", bg: "#FFF8E1", color: "#F57C00" };
  if (estado === "En progreso") return { text: "En proceso", bg: "#E8F5E9", color: "#2E7D32" };
  return { text: estado, bg: "#EEF3FF", color: "#3E7BE1" };
}

export function MisTrabajosPage() {
  const navigate = useNavigate();
  const [trabajos, setTrabajos] = useState<Trabajo[] | null>(null);

  useEffect(() => {
    api.trabajos
      .listar({ postulado: true })
      .then((lista) => setTrabajos(lista.filter((t) => t.estado !== "Cancelado" && t.estado !== "Finalizado")))
      .catch(() => setTrabajos([]));
  }, []);

  const cambiar = async (id: string, estado: Trabajo["estado"]) => {
    await api.trabajos.cambiarEstado(id, estado);
    setTrabajos((prev) =>
      (prev ?? [])
        .map((t) => (t.id === id ? { ...t, estado } : t))
        .filter((t) => t.estado !== "Cancelado" && t.estado !== "Finalizado"),
    );
  };

  return (
    <div className="flex min-h-full flex-col pb-4">
      <PageHeader title="Mis trabajos" subtitle="Consulta y gestiona tus trabajos activos." icon="work" />
      <ExploreTabs />

      <div className="flex-1 px-5 pt-4">
        {trabajos === null ? (
          <Loader label="Cargando tus trabajos..." />
        ) : trabajos.length === 0 ? (
          <EmptyState
            title="No tienes trabajos activos"
            message="Aquí aparecerán los trabajos que estés realizando."
          />
        ) : (
          trabajos.map((t) => (
            <JobStatusCard
              key={t.id}
              titulo={t.titulo}
              publicador={t.publicador}
              fecha={t.fecha}
              badge={badgeDe(t.estado)}
              actions={
                <>
                  {t.estado === "Asignado" && (
                    <CardAction icon="play_arrow" label="Iniciar" onClick={() => cambiar(t.id, "En progreso")} />
                  )}
                  <CardAction
                    icon="cancel"
                    label="Cancelar"
                    destructive
                    onClick={() => cambiar(t.id, "Cancelado")}
                  />
                </>
              }
            />
          ))
        )}
      </div>

      <div className="sticky bottom-[18px] flex justify-end px-5">
        <button
          onClick={() => navigate("/historial")}
          aria-label="Ver historial"
          className="flex h-[58px] w-[58px] items-center justify-center rounded-[20px] bg-cira-header-icon-bg shadow-[0_8px_18px_rgba(0,0,0,0.26)]"
        >
          <Icon name="history" size={30} className="text-cira-accent" />
        </button>
      </div>
    </div>
  );
}
