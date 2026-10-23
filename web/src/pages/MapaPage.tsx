import { useEffect, useMemo, useRef, useState } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import { Icon, Loader, cx } from "@/components/aire";
import { api } from "@/lib/api";
import { buscarDireccion, obtenerUbicacionActual, type ResultadoBusquedaDireccion } from "@/lib/geo";
import { iconoTrabajador, iconoTrabajo, iconoUsuario } from "@/lib/leafletIcons";
import { CATEGORIAS } from "@/lib/mockData";
import type { Trabajador, Trabajo } from "@/lib/types";
import { localeActual, tr } from "@/lib/i18n";

// Centro por defecto: Alajuela Centro, Costa Rica.
const CENTRO_DEFECTO: [number, number] = [10.0163, -84.2113];
const TODOS = tr("Todos los servicios");

function RecenterMap({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom, { duration: 0.8 });
  }, [center, zoom, map]);
  return null;
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
    zoom: 14,
  });
  const [aviso, setAviso] = useState<string | null>(null);

  const [busqueda, setBusqueda] = useState("");
  const [sugerencias, setSugerencias] = useState<ResultadoBusquedaDireccion[]>([]);
  const debounce = useRef<number | undefined>(undefined);

  const [filtro, setFiltro] = useState(TODOS);
  const [filtroAbierto, setFiltroAbierto] = useState(false);

  useEffect(() => {
    Promise.all([api.trabajos.listar(), api.trabajadores.listar()])
      .then(([t, w]) => {
        setTrabajos(t);
        setTrabajadores(w);
      })
      .catch(() => {
        setTrabajos([]);
        setTrabajadores([]);
      })
      .finally(() => setCargando(false));
  }, []);

  const trabajosVisibles = useMemo(
    () => trabajos.filter((t) => t.lat != null && t.lng != null && (filtro === TODOS || t.categoria === filtro)),
    [trabajos, filtro],
  );
  const trabajadoresVisibles = useMemo(
    () =>
      trabajadores.filter(
        (w) => w.lat != null && w.lng != null && (filtro === TODOS || w.servicios.includes(filtro)),
      ),
    [trabajadores, filtro],
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
    setVista({ center: [r.lat, r.lng], zoom: 16 });
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
      setVista({ center: [lat, lng], zoom: 15 });
    } catch {
      setAviso(tr("No se pudo obtener tu ubicación. Revisa los permisos del navegador."));
    }
  };

  return (
    <div className="relative h-full min-h-[480px] bg-aire-surface-3">
      {cargando ? (
        <div className="flex h-full items-center justify-center">
          <Loader label={tr("Cargando mapa...")} />
        </div>
      ) : (
        <MapContainer
          center={vista.center}
          zoom={vista.zoom}
          scrollWheelZoom
          zoomControl={false}
          className="h-full w-full"
          attributionControl={false}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />
          <RecenterMap center={vista.center} zoom={vista.zoom} />

          {miUbicacion && (
            <Marker position={miUbicacion} icon={iconoUsuario}>
              <Popup>{tr("Tu ubicación")}</Popup>
            </Marker>
          )}

          {trabajosVisibles.map((t) => (
            <Marker key={t.id} position={[t.lat!, t.lng!]} icon={iconoTrabajo}>
              <Popup>
                <p className="aire-text-eyebrow text-aire-accent-text">{tr(t.categoria)}</p>
                <p className="aire-text-headline">{t.titulo}</p>
                <p className="aire-text-subhead text-aire-ink-2">{t.ubicacion}</p>
                <p className="aire-text-headline mt-1 text-aire-accent-text">₡{t.pago.toLocaleString(localeActual())}</p>
              </Popup>
            </Marker>
          ))}

          {trabajadoresVisibles.map((w) => (
            <Marker key={w.id} position={[w.lat!, w.lng!]} icon={iconoTrabajador}>
              <Popup>
                <p className="aire-text-headline">{w.nombre}</p>
                <p className="aire-text-subhead text-aire-ink-2">{w.servicios.map((s) => tr(s)).join(" · ")}</p>
                <p className="aire-text-subhead text-aire-ink-2">{w.disponible ? tr("Disponible") : tr("Ocupado")}</p>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
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
        className="absolute right-4 bottom-5 z-[1000] flex h-14 w-14 items-center justify-center rounded-aire-full border border-aire-glass-border bg-aire-glass shadow-aire-float backdrop-blur-xl transition-transform duration-[100ms] ease-aire-pop active:scale-90"
      >
        <Icon name="my_location" size={28} className="text-aire-accent-text" />
      </button>
    </div>
  );
}
