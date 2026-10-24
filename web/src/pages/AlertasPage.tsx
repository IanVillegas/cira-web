import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Badge, Button, Card, Icon, Loader, PageHeader, Stagger } from "@/components/aire";
import { Vacio } from "@/components/Vacio";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { formatoColones } from "@/lib/format";
import { limiteTexto } from "@/lib/fechas";
import { tr } from "@/lib/i18n";
import { mostrarToast } from "@/lib/toast";
import { useAlertas } from "@/lib/useAlertas";
import { useConfig } from "@/lib/useConfig";

/** Todas las alertas activas. Las urgencias van primero. */
export function AlertasPage() {
  const navigate = useNavigate();
  const { usuario } = useAuth();
  const config = useConfig();
  const { alertas, cargado, descartar, recargar } = useAlertas();
  const [error, setError] = useState<string | null>(null);

  const aceptar = async (id: string) => {
    setError(null);
    try {
      await api.trabajos.aceptarUrgencia(id);
      descartar(id);
      mostrarToast(tr("¡Urgencia aceptada! Avisa cuando vayas en camino."));
      navigate("/mis-trabajos");
    } catch (e) {
      setError(e instanceof Error ? e.message : tr("No se pudo aceptar la urgencia."));
      recargar();
    }
  };

  return (
    <div className="pb-6">
      <PageHeader
        title={tr("Alertas")}
        subtitle={tr("Trabajos de tu oficio cerca de ti")}
        onBack={() => navigate(-1)}
        backLabel={tr("Atrás")}
        large={false}
      />

      <div className="grid gap-3 px-5 pt-2">
        {usuario?.plan !== "plus" && (
          <Card interactive onClick={() => navigate("/cuenta/plan")} className="flex items-center gap-3 bg-aire-warning-soft">
            <Icon name="star" filled size={24} className="text-aire-warning-text" />
            <span className="aire-text-subhead flex-1 text-aire-warning-text">
              {tr("Con el plan gratis recibes las alertas {min} min después. Con Plus las recibes primero.", {
                min: Math.round(config.retrasoGratisSeg / 60),
              })}
            </span>
          </Card>
        )}

        {error && <p className="aire-text-footnote text-center font-semibold text-aire-danger-text">{error}</p>}

        {!cargado ? (
          <Loader label={tr("Buscando alertas...")} />
        ) : alertas.length === 0 ? (
          <Vacio
            title={tr("Sin alertas por ahora")}
            message={tr("Te avisaremos cuando alguien cerca publique un trabajo de tu oficio. Revisa que estés disponible y tengas servicios configurados.")}
          />
        ) : (
          <Stagger className="grid gap-3">
            {alertas.map(({ trabajo, urgente, prioritaria }) => (
              <Card key={trabajo.id} className="grid gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  {urgente ? (
                    <Badge tone="danger" dot pulse>
                      {tr("Urgencia")}
                    </Badge>
                  ) : (
                    <span className="aire-text-eyebrow text-aire-accent-text">{tr(trabajo.categoria)}</span>
                  )}
                  {prioritaria && <Badge tone="warning">{tr("Prioridad Plus")}</Badge>}
                </div>
                <div>
                  <p className="aire-text-headline text-aire-ink">{trabajo.titulo}</p>
                  <p className="aire-text-subhead text-aire-ink-2">
                    {trabajo.ubicacion} · {trabajo.distanciaKm} km · {formatoColones.format(trabajo.pago)}
            {trabajo.limite && ` · ${limiteTexto(trabajo.limite, trabajo.fecha)}`}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  <Button variant="secondary" onClick={() => descartar(trabajo.id)}>
                    {tr("Descartar")}
                  </Button>
                  {urgente ? (
                    <Button icon="bolt" onClick={() => aceptar(trabajo.id)}>
                      {tr("Aceptar")}
                    </Button>
                  ) : (
                    <Button onClick={() => navigate(`/explorar?trabajo=${trabajo.id}`)}>{tr("Ver trabajo")}</Button>
                  )}
                </div>
              </Card>
            ))}
          </Stagger>
        )}
      </div>
    </div>
  );
}
