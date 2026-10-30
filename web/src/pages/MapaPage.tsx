import { useEffect, useMemo, useRef, useState } from "react";
import { Map, MapMarker, MarkerContent, MarkerPopup } from "@/components/mapa/mapcn";
import { useMap } from "@/components/mapa/mapContext";
import { ANCLA_CENTRO, ANCLA_GOTA, PinTrabajador, PinTrabajo, PinUsuario, PinesAgrupados } from "@/components/mapa/Pines";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button, Icon, Loader, cx } from "@/components/aire";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { buscarDireccion, obtenerUbicacionActual, type ResultadoBusquedaDireccion } from "@/lib/geo";
import { CATEGORIAS } from "@/lib/mockData";
import type { Trabajador, Trabajo } from "@/lib/types";
import { localeActual, tr } from "@/lib/i18n";

// Centro por defecto: Alajuela Centro, Costa Rica.
const CENTRO_DEFECTO: [number, number] = [10.0163, -84.2113];
const TODOS = tr("Todos los servicios");

/** Vuela a `center` ([lat, lng]) cada vez que cambia (búsqueda o "mi ubicación"). */
function RecenterMap({ center, zoom }: { center: [number, number]; zoom: number }) {
  const { map } = useMap();
  useEffect(() => {
    map?.flyTo({ center: [center[1], center[0]], zoom, duration: 800 });
  }, [center, zoom, map]);
  return null;
}

/** Un pin suelto del mapa: trabajo o trabajador, con lo necesario para su popup. */
type PuntoDelMapa =
  | { tipo: "trabajo"; id: string; lng: number; lat: number; urgente: boolean; trabajo: Trabajo }
  | { tipo: "trabajador"; id: string; lng: number; lat: number; urgente: false; trabajador: Trabajador };

/** Botones al pie de cada popup: ver el detalle y, si no es tuyo, contactar (acción principal). */
function AccionesPopup({
  verLabel,
  onVer,
  onContactar,
  contactando,
}: {
  verLabel: string;
  onVer: () => void;
  onContactar?: () => void;
  contactando: boolean;
}) {
  return (
    <div className={cx("mt-3 grid gap-2", onContactar && "grid-cols-2")}>
      <Button variant={onContactar ? "secondary" : "primary"} onClick={onVer}>
        {verLabel}
      </Button>
      {onContactar && (
        <Button icon="chat_bubble" loading={contactando} onClick={onContactar}>
          {tr("Contactar")}
        </Button>
      )}
    </div>
  );
}

/**
 * Réplica de MapaPage.xaml: el mapa ocupa toda la superficie y encima flotan
 * el buscador (con sugerencias), el filtro de servicios y el botón de ubicación.
 */
export function MapaPage() {
  const [trabajos, setTrabajos] = useState<Trabajo[]>([]);
  const [trabajadores, setTrabajadores] = useState<Trabajador[]>([]);
  const [cargando, setCargando] = useState(true);
  const [miUbicacion, setMiUbicacion] = useState<[number, number] | null>(null);
  const [vista, setVista] = useState<{ center: [number, number]; zoom: number }>({
    center: CENTRO_DEFECTO,
    zoom: 13,
  });
  const [aviso, setAviso] = useState<string | null>(null);

  const [busqueda, setBusqueda] = useState("");
  const [sugerencias, setSugerencias] = useState<ResultadoBusquedaDireccion[]>([]);
  const debounce = useRef<number | undefined>(undefined);

  // "Ver en mapa" de un trabajo (/mapa?trabajo=ID): el mapa abre en ese trabajo con su globo abierto.
  const [searchParams] = useSearchParams();
  const enfocado = searchParams.get("trabajo");

  const [filtro, setFiltro] = useState(TODOS);
  const [filtroAbierto, setFiltroAbierto] = useState(false);

  const navigate = useNavigate();
  const { usuario } = useAuth();
  // Id de la persona con quien se está abriendo el chat (muestra el spinner en su botón).
  const [abriendoChat, setAbriendoChat] = useState<string | null>(null);

  const contactar = async (personaId: string) => {
    setAbriendoChat(personaId);
    try {
      const conversacion = await api.conversaciones.con(personaId);
      navigate(`/chats/${conversacion.id}`);
    } catch {
      setAviso(tr("No se pudo abrir el chat. Intenta de nuevo."));
    } finally {
      setAbriendoChat(null);
    }
  };

  useEffect(() => {
    Promise.all([api.trabajos.listar(), api.trabajadores.listar()])
      .then(([t, w]) => {
        setTrabajos(t);
        setTrabajadores(w);
        const foco = t.find((x) => x.id === enfocado);
        if (foco?.lat != null && foco.lng != null) setVista({ center: [foco.lat, foco.lng], zoom: 16 });
      })
      .catch(() => {
        setTrabajos([]);
        setTrabajadores([]);
      })
      .finally(() => setCargando(false));
    // Con otro ?trabajo= (otro "Ver en mapa") se vuelve a cargar y se enfoca ese.
  }, [enfocado]);

  const trabajosVisibles = useMemo(
    () => trabajos.filter((t) => t.lat != null && t.lng != null && (filtro === TODOS || t.categoria === filtro)),
    [trabajos, filtro],
  );
  const trabajadoresVisibles = useMemo(
    () =>
      trabajadores.filter(
        (w) =>
          w.id !== usuario?.id && w.lat != null && w.lng != null && (filtro === TODOS || w.servicios.includes(filtro)),
      ),
    [trabajadores, filtro, usuario?.id],
  );

  const onBusqueda = (texto: string) => {
    setBusqueda(texto);
    window.clearTimeout(debounce.current);
    if (texto.trim().length < 3) {
      setSugerencias([]);
      return;
    }
    // Nominatim pide uso moderado: se espera a que el usuario deje de escribir.
    debounce.current = window.setTimeout(async () => setSugerencias(await buscarDireccion(texto)), 450);
  };

  const irA = (r: ResultadoBusquedaDireccion) => {
    setVista({ center: [r.lat, r.lng], zoom: 15 });
    setBusqueda(r.nombre.split(",").slice(0, 2).join(","));
    setSugerencias([]);
  };

  const buscarAhora = async () => {
    const resultados = await buscarDireccion(busqueda);
    if (resultados[0]) irA(resultados[0]);
    else setAviso(tr("No encontramos esa ubicación."));
  };

  const centrar = async () => {
    setAviso(null);
    try {
      const { lat, lng } = await obtenerUbicacionActual();
      setMiUbicacion([lat, lng]);
      setVista({ center: [lat, lng], zoom: 14 });
    } catch {
      setAviso(tr("No se pudo obtener tu ubicación. Revisa los permisos del navegador."));
    }
  };

  const puntos = useMemo<PuntoDelMapa[]>(
    () => [
      // El trabajo enfocado va aparte (siempre como pin suelto, nunca dentro de un grupo).
      ...trabajosVisibles
        .filter((t) => t.id !== enfocado)
        .map((t) => ({ tipo: "trabajo" as const, id: `t-${t.id}`, lng: t.lng!, lat: t.lat!, urgente: t.urgente, trabajo: t })),
      ...trabajadoresVisibles.map((w) => ({ tipo: "trabajador" as const, id: `w-${w.id}`, lng: w.lng!, lat: w.lat!, urgente: false as const, trabajador: w })),
    ],
    [trabajosVisibles, trabajadoresVisibles, enfocado],
  );
  const trabajoEnfocado = trabajosVisibles.find((t) => t.id === enfocado) ?? null;

  const pinDeTrabajo = (t: Trabajo, abrirAlInicio = false) => (
    <MapMarker
      key={`t-${t.id}`}
      longitude={t.lng!}
      latitude={t.lat!}
      anchor={ANCLA_GOTA}
      className={abrirAlInicio ? "ca-map__marker--foco" : undefined}
    >
      <MarkerContent>
        <PinTrabajo categoria={t.categoria} urgente={t.urgente} />
      </MarkerContent>
      <MarkerPopup offset={52} abrirAlInicio={abrirAlInicio}>
        <p className="aire-text-eyebrow" style={{ color: t.urgente ? "var(--aire-danger-text)" : "var(--aire-accent-text)" }}>
          {t.urgente ? `${tr("Urgente")} · ${tr(t.categoria)}` : tr(t.categoria)}
        </p>
        <p className="aire-text-headline">{t.titulo}</p>
        <p className="aire-text-subhead text-aire-ink-2">{t.ubicacion}</p>
        <p className="aire-text-headline mt-1 text-aire-accent-text">₡{t.pago.toLocaleString(localeActual())}</p>
        <AccionesPopup
          verLabel={tr("Ver trabajo")}
          onVer={() => navigate(`/explorar?trabajo=${t.id}`)}
          onContactar={t.publicadorId !== usuario?.id ? () => contactar(t.publicadorId) : undefined}
          contactando={abriendoChat === t.publicadorId}
        />
      </MarkerPopup>
    </MapMarker>
  );

  const pinDeTrabajador = (w: Trabajador) => (
    <MapMarker key={`w-${w.id}`} longitude={w.lng!} latitude={w.lat!} anchor={ANCLA_CENTRO}>
      <MarkerContent>
        <PinTrabajador nombre={w.nombre} avatar={w.avatar} disponible={w.disponible} calificacion={w.calificacion} />
      </MarkerContent>
      <MarkerPopup offset={28}>
        <p className="aire-text-headline">{w.nombre}</p>
        <p className="aire-text-subhead text-aire-ink-2">{w.servicios.map((s) => tr(s)).join(" · ")}</p>
        <p className="aire-text-subhead text-aire-ink-2">{w.disponible ? tr("Disponible") : tr("Ocupado")}</p>
        <AccionesPopup
          verLabel={tr("Ver perfil")}
          onVer={() => navigate(`/usuarios/${w.id}`)}
          onContactar={() => contactar(w.id)}
          contactando={abriendoChat === w.id}
        />
      </MarkerPopup>
    </MapMarker>
  );

  return (
    <div className="ca-mapa-full relative h-full min-h-[480px] bg-aire-surface-3">
      {cargando ? (
        <div className="flex h-full items-center justify-center">
          <Loader label={tr("Cargando mapa...")} />
        </div>
      ) : (
        <Map center={[vista.center[1], vista.center[0]]} zoom={vista.zoom}>
          <RecenterMap center={vista.center} zoom={vista.zoom} />

          {miUbicacion && (
            <MapMarker longitude={miUbicacion[1]} latitude={miUbicacion[0]} anchor={ANCLA_CENTRO}>
              <MarkerContent>
                <PinUsuario />
              </MarkerContent>
              <MarkerPopup>
                <p className="aire-text-headline">{tr("Tu ubicación")}</p>
              </MarkerPopup>
            </MapMarker>
          )}

          {trabajoEnfocado && pinDeTrabajo(trabajoEnfocado, true)}
          <PinesAgrupados puntos={puntos} renderPunto={(p) => (p.tipo === "trabajo" ? pinDeTrabajo(p.trabajo) : pinDeTrabajador(p.trabajador))} />
        </Map>
      )}

      {/* Controles flotantes de vidrio sobre el mapa */}
      <div className="pointer-events-none absolute inset-x-4 top-4 z-[1000] grid gap-2.5">
        <div className="pointer-events-auto flex items-center gap-2.5 rounded-aire-full border border-aire-glass-border bg-aire-glass px-4 shadow-aire-float backdrop-blur-xl">
          <Icon name="search" size={22} className="text-aire-ink-2" />
          <input
            value={busqueda}
            onChange={(e) => onBusqueda(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && buscarAhora()}
            placeholder={tr("Buscar ubicación")}
            className="aire-text-body min-h-12 min-w-0 flex-1 bg-transparent text-aire-ink placeholder:text-aire-ink-3 focus:outline-none"
          />
          <button type="button" onClick={buscarAhora} aria-label={tr("Buscar")} className="flex h-11 w-11 items-center justify-center text-aire-accent-text">
            <Icon name="arrow_forward" size={22} />
          </button>
        </div>

        {sugerencias.length > 0 && (
          <div className="pointer-events-auto max-h-[230px] overflow-y-auto rounded-aire-lg border border-aire-glass-border bg-aire-glass p-2 shadow-aire-float backdrop-blur-xl">
            {sugerencias.map((s) => (
              <button
                key={`${s.lat},${s.lng}`}
                type="button"
                onClick={() => irA(s)}
                className="flex min-h-11 w-full items-center gap-2.5 rounded-aire-sm px-3 py-2 text-left active:bg-aire-surface-3"
              >
                <Icon name="place" size={20} className="shrink-0 text-aire-accent-text" />
                <span className="aire-text-subhead truncate text-aire-ink">{s.nombre}</span>
              </button>
            ))}
          </div>
        )}

        <div className="pointer-events-auto relative self-start">
          <button
            type="button"
            onClick={() => setFiltroAbierto((v) => !v)}
            className="flex min-h-11 items-center gap-2 rounded-aire-full border border-aire-glass-border bg-aire-glass px-4 shadow-aire-float backdrop-blur-xl transition-transform duration-[100ms] ease-aire-pop active:scale-95"
          >
            <Icon name="tune" size={20} className="text-aire-accent-text" />
            <span className="aire-text-subhead font-semibold text-aire-ink">{filtro === TODOS ? filtro : tr(filtro)}</span>
          </button>
          {filtroAbierto && (
            <div className="absolute top-full left-0 mt-2 max-h-60 w-56 overflow-y-auto rounded-aire-lg border border-aire-glass-border bg-aire-glass p-2 shadow-aire-float backdrop-blur-xl">
              {[TODOS, ...CATEGORIAS].map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => {
                    setFiltro(c);
                    setFiltroAbierto(false);
                  }}
                  className={cx(
                    "aire-text-subhead block min-h-11 w-full rounded-aire-sm px-3 py-2 text-left",
                    c === filtro ? "bg-aire-accent-soft font-semibold text-aire-accent-text" : "text-aire-ink",
                  )}
                >
                  {c === TODOS ? c : tr(c)}
                </button>
              ))}
            </div>
          )}
        </div>

        {aviso && (
          <div className="pointer-events-auto flex items-center gap-2.5 rounded-aire-lg border border-aire-glass-border bg-aire-glass px-4 py-3 shadow-aire-float backdrop-blur-xl">
            <Icon name="location_off" size={22} className="shrink-0 text-aire-accent-text" />
            <span className="aire-text-footnote flex-1 text-aire-ink">{aviso}</span>
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={centrar}
        aria-label={tr("Centrar en mi ubicación")}
        style={{ bottom: "calc(var(--aire-tabbar-space) + 8px)" }}
        className="absolute right-4 z-[1000] flex h-14 w-14 items-center justify-center rounded-aire-full border border-aire-glass-border bg-aire-glass shadow-aire-float backdrop-blur-xl transition-transform duration-[100ms] ease-aire-pop active:scale-90"
      >
        <Icon name="my_location" size={28} className="text-aire-accent-text" />
      </button>
    </div>
  );
}
