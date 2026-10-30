import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Card, Icon, Loader, PageHeader, Reveal } from "@/components/aire";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { formatoColones } from "@/lib/format";
import { tr } from "@/lib/i18n";
import { mostrarToast } from "@/lib/toast";
import { useConfig } from "@/lib/useConfig";

/** Plan Gratis vs Plan Plus: la suscripción es simulada (no hay pasarela de pago real). */
export function PlanPage() {
  const navigate = useNavigate();
  const { usuario, refrescarUsuario } = useAuth();
  const config = useConfig();
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!usuario) return <Loader label={tr("Cargando plan...")} />;
  const esPlus = usuario.plan === "plus";
  const minutos = Math.round(config.retrasoGratisSeg / 60);

  const cambiar = async () => {
    setGuardando(true);
    setError(null);
    try {
      await api.usuario.cambiarPlan(esPlus ? "gratis" : "plus");
      await refrescarUsuario();
      mostrarToast(esPlus ? tr("Volviste al plan gratis") : tr("¡Ya eres Plus!"), esPlus ? "info" : "exito");
    } catch (e) {
      setError(e instanceof Error ? e.message : tr("No se pudo cambiar el plan."));
    } finally {
      setGuardando(false);
    }
  };

  const filas: { texto: string; gratis: string; plus: string }[] = [
    { texto: tr("Perfil, postularse y chat"), gratis: "✓", plus: "✓" },
    { texto: tr("Explorar trabajos"), gratis: "✓", plus: "✓" },
    { texto: tr("Alertas de tu oficio en tu zona"), gratis: tr("{n} min después", { n: minutos }), plus: tr("Primero") },
    { texto: tr("Alertas de urgencias"), gratis: tr("{n} min después", { n: minutos }), plus: tr("Primero") },
    { texto: tr("Insignia Plus en tu perfil"), gratis: "—", plus: "✓" },
  ];

  return (
    <div className="pb-6">
      <PageHeader
        title={tr("Planes")}
        subtitle={tr("Elige cómo recibir los trabajos")}
        onBack={() => navigate(-1)}
        backLabel={tr("Atrás")}
        large={false}
      />

      <div className="grid gap-4 px-5 pt-2">
        <Reveal effect="scale">
          <Card className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-aire-md bg-aire-warning-soft">
              <Icon name="star" filled size={26} className="text-aire-warning-text" />
            </span>
            <div>
              <p className="aire-text-eyebrow text-aire-ink-2">{tr("Tu plan")}</p>
              <p className="aire-text-title-3 text-aire-ink">{esPlus ? "Plus" : tr("Gratis")}</p>
            </div>
          </Card>
        </Reveal>

        <Card padding="none" className="overflow-hidden">
          <div className="aire-text-eyebrow grid grid-cols-[1.6fr_1fr_1fr] bg-aire-surface-2 px-4 py-3 text-aire-ink-2">
            <span />
            <span className="text-center">{tr("Gratis")}</span>
            <span className="text-center text-aire-warning-text">Plus</span>
          </div>
          {filas.map((f) => (
            <div key={f.texto} className="aire-text-subhead grid grid-cols-[1.6fr_1fr_1fr] items-center border-t border-aire-hairline px-4 py-3">
              <span className="pr-2 text-aire-ink">{f.texto}</span>
              <span className="text-center text-aire-ink-2">{f.gratis}</span>
              <span className="text-center font-semibold text-aire-accent-text">{f.plus}</span>
            </div>
          ))}
        </Card>

        <p className="aire-text-subhead text-aire-ink-2">
          {tr("Plus es una ventaja de minutos, no una exclusiva: los trabajadores del plan gratis también reciben las alertas. Entre los Plus, la alerta llega primero a los mejor calificados.")}
        </p>

        {error && <p className="aire-text-footnote text-center font-semibold text-aire-danger-text">{error}</p>}

        <Button variant={esPlus ? "secondary" : "primary"} loading={guardando} onClick={cambiar}>
          {esPlus ? tr("Volver al plan gratis") : tr("Suscribirme por {precio}/mes", { precio: formatoColones.format(config.plusPrecio) })}
        </Button>
        {!esPlus && <p className="aire-text-footnote text-center text-aire-ink-2">{tr("Pago simulado: no se realiza ningún cobro real.")}</p>}
      </div>
    </div>
  );
}
