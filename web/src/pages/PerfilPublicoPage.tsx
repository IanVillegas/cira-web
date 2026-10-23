import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Icon } from "@/components/ui/Icon";
import { Loader } from "@/components/ui/Loader";
import { Calificacion } from "@/components/Estrellas";
import { InsigniaChips } from "@/components/InsigniaChips";
import { ReportSheet } from "@/components/ReportSheet";
import { api } from "@/lib/api";
import type { PerfilPublico } from "@/lib/types";

/** Perfil visible para otros usuarios: reputación, insignias, comentarios y botón de reporte. */
export function PerfilPublicoPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [perfil, setPerfil] = useState<PerfilPublico | null>(null);
  const [noEncontrado, setNoEncontrado] = useState(false);
  const [reportando, setReportando] = useState(false);

  useEffect(() => {
    if (!id) return;
    api.usuarios
      .perfil(id)
      .then(setPerfil)
      .catch(() => setNoEncontrado(true));
  }, [id]);

  if (noEncontrado) return <EmptyState title="Perfil no encontrado" message="Es posible que la cuenta ya no exista." />;
  if (!perfil) return <Loader label="Cargando perfil..." />;

  const contactar = async () => {
    const conversacion = await api.conversaciones.con(perfil.id);
    navigate(`/chats/${conversacion.id}`);
  };

  return (
    <div className="pb-6">
      <PageHeader title="Perfil" icon="flag" onIconClick={() => setReportando(true)} showBack />

      <div className="flex flex-col gap-4 px-5">
        <div className="flex flex-col items-center gap-2">
          <div className="flex h-[96px] w-[96px] items-center justify-center rounded-full border-[3px] border-cira-card bg-cira-header-icon-bg">
            <Icon name="account_circle" size={58} className="text-cira-accent" />
          </div>
          <p className="text-center text-[24px] font-semibold text-cira-text-primary">{perfil.nombre}</p>
          <p className="text-cira-body text-cira-text-secondary">{perfil.zona || "Sin ubicación"}</p>
          <Calificacion valor={perfil.calificacion} total={perfil.numCalificaciones} />
          <InsigniaChips insignias={perfil.insignias} />
        </div>

        {perfil.descripcion && <p className="text-center text-sm text-cira-text-secondary">{perfil.descripcion}</p>}

        <div className="grid grid-cols-2 gap-3 text-center">
          <Card>
            <p className="text-xl font-semibold text-cira-text-primary">{perfil.trabajosCompletados}</p>
            <p className="text-[11px] text-cira-text-secondary">Trabajos completados</p>
          </Card>
          <Card>
            <p className="text-xl font-semibold text-cira-text-primary">{perfil.disponible ? "Sí" : "No"}</p>
            <p className="text-[11px] text-cira-text-secondary">Disponible</p>
          </Card>
        </div>

        <section className="flex flex-col gap-2.5">
          <h2 className="text-lg font-semibold text-cira-text-primary">Servicios</h2>
          <div className="flex flex-wrap gap-2">
            {perfil.servicios.map((s) => (
              <span key={s} className="rounded-[18px] bg-cira-card px-3.5 py-[9px] text-[13px] text-cira-text-primary">
                {s}
              </span>
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-2.5">
          <h2 className="text-lg font-semibold text-cira-text-primary">Comentarios</h2>
          {perfil.comentarios.length === 0 ? (
            <p className="text-[13px] text-cira-text-secondary">Todavía no tiene comentarios.</p>
          ) : (
            perfil.comentarios.map((c, i) => (
              <Card key={i} className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-cira-text-primary">{c.autor}</span>
                  <Calificacion valor={c.estrellas} />
                </div>
                <p className="text-[13px] text-cira-text-secondary">{c.comentario}</p>
              </Card>
            ))
          )}
        </section>

        <Button onClick={contactar}>CONTACTAR</Button>
        <Button variant="destructive" onClick={() => setReportando(true)}>
          REPORTAR USUARIO
        </Button>
      </div>

      <ReportSheet
        usuario={reportando ? { id: perfil.id, nombre: perfil.nombre } : null}
        onClose={() => setReportando(false)}
      />
    </div>
  );
}
