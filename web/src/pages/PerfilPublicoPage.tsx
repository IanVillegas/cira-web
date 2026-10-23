import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button, Card, Icon, Loader, PageHeader, Reveal, Stagger } from "@/components/aire";
import { Calificacion } from "@/components/Estrellas";
import { InsigniaChips } from "@/components/InsigniaChips";
import { ReportSheet } from "@/components/ReportSheet";
import { Vacio } from "@/components/Vacio";
import { api } from "@/lib/api";
import { tr } from "@/lib/i18n";
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

  if (noEncontrado) return <Vacio image="empty_not_found_variant" title={tr("Perfil no encontrado")} message={tr("Es posible que la cuenta ya no exista.")} />;
  if (!perfil) return <Loader label={tr("Cargando perfil...")} />;

  const contactar = async () => {
    const conversacion = await api.conversaciones.con(perfil.id);
    navigate(`/chats/${conversacion.id}`);
  };

  return (
    <div className="pb-6">
      <PageHeader
        title={tr("Perfil")}
        onBack={() => navigate(-1)}
        backLabel={tr("Atrás")}
        large={false}
        action={{ icon: "flag", label: tr("Reportar usuario"), onClick: () => setReportando(true) }}
      />

      <div className="grid gap-5 px-5">
        <Reveal effect="scale">
          <div className="grid justify-items-center gap-2 text-center">
            <span className="flex h-24 w-24 items-center justify-center rounded-aire-full bg-aire-accent-soft">
              <Icon name="account_circle" filled size={58} className="text-aire-accent-text" />
            </span>
            <p className="aire-text-title-1 text-aire-ink">{perfil.nombre}</p>
            <p className="aire-text-subhead text-aire-ink-2">{perfil.zona || tr("Sin ubicación")}</p>
            <Calificacion valor={perfil.calificacion} total={perfil.numCalificaciones} />
            <InsigniaChips insignias={perfil.insignias} />
          </div>
        </Reveal>

        {perfil.descripcion && <p className="aire-text-subhead text-center text-aire-ink-2">{perfil.descripcion}</p>}

        <div className="grid grid-cols-2 gap-3 text-center">
          <Card>
            <p className="aire-text-title-2 text-aire-ink">{perfil.trabajosCompletados}</p>
            <p className="aire-text-footnote text-aire-ink-2">{tr("Trabajos completados")}</p>
          </Card>
          <Card>
            <p className="aire-text-title-2 text-aire-ink">{perfil.disponible ? tr("Sí") : tr("No")}</p>
            <p className="aire-text-footnote text-aire-ink-2">{tr("Disponible")}</p>
          </Card>
        </div>

        <section className="grid gap-3">
          <h2 className="aire-text-title-2 text-aire-ink">{tr("Servicios")}</h2>
          <div className="flex flex-wrap gap-2">
            {perfil.servicios.map((s) => (
              <span key={s} className="aire-text-subhead rounded-aire-full bg-aire-surface px-3.5 py-2.5 text-aire-ink shadow-aire-card">
                {tr(s)}
              </span>
            ))}
          </div>
        </section>

        <section className="grid gap-3">
          <h2 className="aire-text-title-2 text-aire-ink">{tr("Comentarios")}</h2>
          {perfil.comentarios.length === 0 ? (
            <p className="aire-text-subhead text-aire-ink-2">{tr("Todavía no tiene comentarios.")}</p>
          ) : (
            <Stagger className="grid gap-3">
              {perfil.comentarios.map((c, i) => (
                <Card key={i} className="grid gap-1">
                  <div className="flex items-center justify-between">
                    <span className="aire-text-headline text-aire-ink">{c.autor}</span>
                    <Calificacion valor={c.estrellas} />
                  </div>
                  <p className="aire-text-subhead text-aire-ink-2">{c.comentario}</p>
                </Card>
              ))}
            </Stagger>
          )}
        </section>

        <Button icon="chat_bubble" onClick={contactar}>
          {tr("Contactar")}
        </Button>
        <Button variant="destructive" icon="flag" onClick={() => setReportando(true)}>
          {tr("Reportar usuario")}
        </Button>
      </div>

      <ReportSheet usuario={reportando ? { id: perfil.id, nombre: perfil.nombre } : null} onClose={() => setReportando(false)} />
    </div>
  );
}
