import { useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { Loader } from "@/components/ui/Loader";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { formatoColones } from "@/lib/format";
import { useConfig } from "@/lib/useConfig";
import { tr } from "@/lib/i18n";
import { mostrarToast } from "@/lib/toast";

/** Plan Gratis vs Plan Plus: la suscripción es simulada (no hay pasarela de pago real). */
export function PlanPage() {
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
      <PageHeader title={tr("Planes")} subtitle={tr("Elige cómo recibir los trabajos")} icon="star" showBack />

      <div className="flex flex-col gap-4 px-5 pt-2">
        <Card className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100">
            <Icon name="star" filled size={26} className="text-amber-600" />
          </span>
          <div>
            <p className="text-[11px] font-semibold tracking-wider text-cira-text-secondary">{tr("TU PLAN")}</p>
            <p className="text-lg font-semibold text-cira-text-primary">{esPlus ? "Plus" : tr("Gratis")}</p>
          </div>
        </Card>

        <Card className="overflow-hidden p-0">
          <div className="grid grid-cols-[1.6fr_1fr_1fr] bg-cira-surface-muted px-3.5 py-2.5 text-[11px] font-bold tracking-wider text-cira-text-secondary">
            <span />
            <span className="text-center">{tr("GRATIS")}</span>
            <span className="text-center text-amber-700">{tr("PLUS")}</span>
          </div>
          {filas.map((f) => (
            <div key={f.texto} className="grid grid-cols-[1.6fr_1fr_1fr] items-center border-t border-cira-border px-3.5 py-3 text-[13px]">
              <span className="pr-2 text-cira-text-primary">{f.texto}</span>
              <span className="text-center text-cira-text-secondary">{f.gratis}</span>
              <span className="text-center font-semibold text-cira-accent">{f.plus}</span>
            </div>
          ))}
        </Card>

        <p className="text-[13px] text-cira-text-secondary">
          {tr("Plus es una ventaja de minutos, no una exclusiva: los trabajadores del plan gratis también reciben las alertas. Entre los Plus, la alerta llega primero a los mejor calificados.")}
        </p>

        {error && <p className="text-center text-[13px] text-cira-btn-destructive-text">{error}</p>}

        <Button variant={esPlus ? "outlined" : "primary"} disabled={guardando} onClick={cambiar}>
          {guardando
            ? tr("PROCESANDO...")
            : esPlus
              ? tr("VOLVER AL PLAN GRATIS")
              : tr("SUSCRIBIRME POR {precio}/MES", { precio: formatoColones.format(config.plusPrecio) })}
        </Button>
        {!esPlus && <p className="text-center text-xs text-cira-text-helper">{tr("Pago simulado: no se realiza ningún cobro real.")}</p>}
      </div>
    </div>
  );
}
