import { useEffect, useState, type CSSProperties } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Badge, Button, Icon, cx } from "@/components/aire";
import { api } from "@/lib/api";
import { formatoColones } from "@/lib/format";
import { limiteTexto } from "@/lib/fechas";
import { tr } from "@/lib/i18n";
import { mostrarToast } from "@/lib/toast";
import { useAlertas } from "@/lib/useAlertas";

/** Cuánto dura el aviso en pantalla antes de irse solo (como una oferta de viaje en Uber). */
const DURACION_AVISO_MS = 30_000;
const KEY_VENCIDAS = "cira.avisosVencidos";

// Cuándo empezó a mostrarse cada aviso: si se oculta (un chat) y vuelve, la cuenta sigue donde iba.
const inicioAviso = new Map<string, number>();

function leerVencidas(): Set<string> {
  try {
    return new Set(JSON.parse(sessionStorage.getItem(KEY_VENCIDAS) ?? "[]") as string[]);
  } catch {
    return new Set();
  }
}

/**
 * Aviso de vidrio sobre la app: urgencias y trabajos nuevos de mi oficio cerca de mí.
 * Los trabajadores Plus lo reciben primero; el plan gratis, unos minutos después.
 * El botón principal se vacía en 30 s (azul → naranja → rojo); al terminar, el aviso se
 * va solo pero la alerta sigue en la pantalla de Alertas (y la prioridad Plus no cambia).
 */
export function AlertBanner() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { alertas, descartar, recargar } = useAlertas();
  const [error, setError] = useState<string | null>(null);
  const [vencidas, setVencidas] = useState<Set<string>>(leerVencidas);
  const [ahora, setAhora] = useState(() => Date.now());

  const alerta = alertas.find((a) => !vencidas.has(a.trabajo.id));
  const oculto = !alerta || pathname === "/alertas" || pathname.startsWith("/chats/");
  const id = alerta?.trabajo.id;
  const inicio = id ? inicioAviso.get(id) : undefined;

  // La primera vez que se muestra un aviso se anota cuándo empezó su cuenta.
  useEffect(() => {
    if (!id || oculto || inicioAviso.has(id)) return;
    const raf = requestAnimationFrame(() => {
      const t = Date.now();
      inicioAviso.set(id, t);
      setAhora(t);
    });
    return () => cancelAnimationFrame(raf);
  }, [id, oculto]);

  // Reloj de la cuenta regresiva (segundos en el botón) y vencimiento del aviso.
  useEffect(() => {
    if (!id || oculto || inicio === undefined) return;
    const vencer = () => {
      setVencidas((prev) => {
        const nuevas = new Set(prev).add(id);
        try {
          sessionStorage.setItem(KEY_VENCIDAS, JSON.stringify([...nuevas]));
        } catch {
          /* sin almacenamiento: vale solo mientras la app siga abierta */
        }
        return nuevas;
      });
    };
    const tick = window.setInterval(() => setAhora(Date.now()), 1000);
    const fin = window.setTimeout(vencer, Math.max(0, inicio + DURACION_AVISO_MS - Date.now()));
    return () => {
      window.clearInterval(tick);
      window.clearTimeout(fin);
    };
  }, [id, oculto, inicio]);

  // En las pantallas donde ya se ve la alerta completa no hace falta repetirla.
  if (!alerta || oculto || inicio === undefined) return null;
  const { trabajo, urgente, prioritaria } = alerta;
  const transcurrido = Math.min(DURACION_AVISO_MS, Math.max(0, ahora - inicio));
  const segundos = Math.ceil((DURACION_AVISO_MS - transcurrido) / 1000);

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
        {/* key: cada aviso nuevo arranca su barra llena. */}
        <BotonCuenta
          key={trabajo.id}
          inicio={inicio}
          segundos={segundos}
          urgente={urgente}
          onClick={urgente ? aceptar : () => navigate(`/explorar?trabajo=${trabajo.id}`)}
        />
        {alertas.length > 1 && (
          <Button size="sm" variant="tinted" fullWidth={false} onClick={() => navigate("/alertas")}>
            {tr("+{n} más", { n: alertas.length - 1 })}
          </Button>
        )}
      </div>
    </div>
  );
}

/**
 * Botón principal del aviso con la cuenta regresiva. La animación CSS corre sola; al montarse
 * arranca "adelantada" lo que ya pasó (si el aviso se ocultó y volvió) y ese valor no cambia
 * después, porque mover el delay de una animación en curso la adelanta de más.
 */
function BotonCuenta({ inicio, segundos, urgente, onClick }: { inicio: number; segundos: number; urgente: boolean; onClick: () => void }) {
  const [adelanto] = useState(() => Math.min(DURACION_AVISO_MS, Math.max(0, Date.now() - inicio)));
  const estilo = { "--ca-cuenta-dur": `${DURACION_AVISO_MS}ms`, "--ca-cuenta-delay": `-${adelanto}ms` } as CSSProperties;
  return (
    <button type="button" className={cx("ca-cuenta", segundos <= 5 && "is-final")} style={estilo} onClick={onClick}>
      <span className="ca-cuenta__relleno" aria-hidden="true" />
      <span className="ca-cuenta__relleno ca-cuenta__relleno--medio" aria-hidden="true" />
      <span className="ca-cuenta__relleno ca-cuenta__relleno--final" aria-hidden="true" />
      {urgente && <Icon name="bolt" filled size={18} />}
      <span>{urgente ? tr("Aceptar") : tr("Ver trabajo")}</span>
      <span className="ca-cuenta__seg" aria-label={tr("{n} segundos para aceptar", { n: segundos })}>
        {segundos} s
      </span>
    </button>
  );
}
