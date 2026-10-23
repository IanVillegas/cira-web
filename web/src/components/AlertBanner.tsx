import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Icon } from "./ui/Icon";
import { api } from "@/lib/api";
import { formatoColones } from "@/lib/format";
import { useAlertas } from "@/lib/useAlertas";

/**
 * Banner de alertas sobre la app: urgencias y trabajos nuevos de mi oficio cerca de mí.
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
      descartar(trabajo.id); // ya es mío: que el banner no siga mostrándola
      navigate("/mis-trabajos");
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo aceptar la urgencia.");
      recargar();
    }
  };

  return (
    <div
      role="alert"
      className={`absolute inset-x-3 top-3 z-[2500] rounded-2xl p-3 text-white shadow-[0_10px_28px_rgba(0,0,0,0.35)] ${
        urgente ? "bg-cira-btn-destructive-text" : "bg-cira-tertiary"
      }`}
    >
      <div className="flex items-start gap-2.5">
        <Icon name={urgente ? "bolt" : "notifications_active"} filled size={24} />
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold tracking-wider uppercase">
            {urgente ? "Urgencia cerca de ti" : "Nuevo trabajo de tu oficio"}
            {prioritaria && " · Prioridad Plus"}
          </p>
          <p className="truncate text-[15px] font-semibold">{trabajo.titulo}</p>
          <p className="truncate text-xs opacity-90">
            {trabajo.ubicacion} · {trabajo.distanciaKm} km · {formatoColones.format(trabajo.pago)}
          </p>
        </div>
        <button onClick={() => descartar(trabajo.id)} aria-label="Descartar alerta">
          <Icon name="close" size={22} />
        </button>
      </div>

      {error && <p className="mt-2 text-xs font-semibold">{error}</p>}

      <div className="mt-2.5 flex items-center gap-2">
        {urgente ? (
          <button onClick={aceptar} className="flex-1 rounded-xl bg-white py-2 text-[13px] font-bold text-cira-btn-destructive-text">
            ACEPTAR
          </button>
        ) : (
          <button
            onClick={() => navigate(`/explorar?trabajo=${trabajo.id}`)}
            className="flex-1 rounded-xl bg-white py-2 text-[13px] font-bold text-cira-tertiary"
          >
            VER TRABAJO
          </button>
        )}
        {alertas.length > 1 && (
          <button onClick={() => navigate("/alertas")} className="rounded-xl border border-white/60 px-3 py-2 text-[13px] font-semibold">
            +{alertas.length - 1} más
          </button>
        )}
      </div>
    </div>
  );
}
