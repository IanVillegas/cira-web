import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Badge, Button, Icon } from "@/components/aire";
import { api } from "@/lib/api";
import { formatoColones } from "@/lib/format";
import { limiteTexto } from "@/lib/fechas";
import { tr } from "@/lib/i18n";
import { mostrarToast } from "@/lib/toast";
import { useAlertas } from "@/lib/useAlertas";

/**
 * Aviso de vidrio sobre la app: urgencias y trabajos nuevos de mi oficio cerca de mí.
 * Los trabajadores Plus lo reciben primero; el plan gratis, unos minutos después.
 */
export function AlertBanner() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { alertas, descartar, recargar } = useAlertas();
  const [error, setError] = useState<string | null>(null);

  const alerta = alertas[0];
  // En las pantallas donde ya se ve la alerta completa no hace falta repetirla.
  if (!alerta || pathname === "/alertas" || pathname.startsWith("/chats/")) return null;
  const { trabajo, urgente, prioritaria } = alerta;

  const aceptar = async () => {
    setError(null);
    try {
      await api.trabajos.aceptarUrgencia(trabajo.id);
      descartar(trabajo.id); // ya es mío: que el aviso no siga mostrándola
      mostrarToast(tr("¡Urgencia aceptada! Avisa cuando vayas en camino."));
      navigate("/mis-trabajos");
    } catch (e) {
      setError(e instanceof Error ? e.message : tr("No se pudo aceptar la urgencia."));
      recargar();
    }
  };

  return (
    <div
      role="alert"
      className="absolute inset-x-3 top-3 z-[2050] grid gap-3 rounded-aire-lg border border-aire-glass-border bg-aire-glass p-4 shadow-aire-float backdrop-blur-xl animate-[ca-fade-up_480ms_var(--aire-ease-out)_both]"
    >
      <div className="flex items-start gap-3">
        <span
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-aire-md ${
            urgente ? "bg-aire-danger-soft text-aire-danger-text" : "bg-aire-accent-soft text-aire-accent-text"
          }`}
        >
          <Icon name={urgente ? "bolt" : "notifications_active"} filled size={22} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <p className={`aire-text-eyebrow ${urgente ? "text-aire-danger-text" : "text-aire-accent-text"}`}>
              {urgente ? tr("Urgencia cerca de ti") : tr("Nuevo trabajo de tu oficio")}
            </p>
            {prioritaria && <Badge tone="warning">{tr("Prioridad Plus")}</Badge>}
          </div>
          <p className="aire-text-headline truncate text-aire-ink">{trabajo.titulo}</p>
          <p className="aire-text-footnote truncate text-aire-ink-2">
            {trabajo.ubicacion} · {trabajo.distanciaKm} km · {formatoColones.format(trabajo.pago)}
            {trabajo.limite && ` · ${limiteTexto(trabajo.limite, trabajo.fecha)}`}
          </p>
        </div>
        <button type="button" className="ca-iconbtn ca-iconbtn--sm" aria-label={tr("Descartar alerta")} onClick={() => descartar(trabajo.id)}>
          <Icon name="close" size={20} />
        </button>
      </div>

      {error && <p className="aire-text-footnote font-semibold text-aire-danger-text">{error}</p>}

      <div className="flex items-center gap-2">
        {urgente ? (
          <Button size="sm" icon="bolt" onClick={aceptar}>
            {tr("Aceptar")}
          </Button>
        ) : (
          <Button size="sm" onClick={() => navigate(`/explorar?trabajo=${trabajo.id}`)}>
            {tr("Ver trabajo")}
          </Button>
        )}
        {alertas.length > 1 && (
          <Button size="sm" variant="tinted" fullWidth={false} onClick={() => navigate("/alertas")}>
            {tr("+{n} más", { n: alertas.length - 1 })}
          </Button>
        )}
      </div>
    </div>
  );
}
