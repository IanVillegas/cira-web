import { useEffect, useMemo, useRef, useState } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import { Icon } from "@/components/ui/Icon";
import { Loader } from "@/components/ui/Loader";
import { api } from "@/lib/api";
import { buscarDireccion, obtenerUbicacionActual, type ResultadoBusquedaDireccion } from "@/lib/geo";
import { iconoTrabajador, iconoTrabajo, iconoUsuario } from "@/lib/leafletIcons";
import { CATEGORIAS } from "@/lib/mockData";
import type { Trabajador, Trabajo } from "@/lib/types";

// Centro por defecto: Alajuela Centro, Costa Rica.
const CENTRO_DEFECTO: [number, number] = [10.0163, -84.2113];
const TODOS = "Todos los servicios";

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
    else setAviso("No encontramos esa ubicación.");
  };

  const centrar = async () => {
    setAviso(null);
    try {
      const { lat, lng } = await obtenerUbicacionActual();
      setMiUbicacion([lat, lng]);
      setVista({ center: [lat, lng], zoom: 15 });
    } catch {
      setAviso("No se pudo obtener tu ubicación. Revisa los permisos del navegador.");
    }
  };

  return (
    <div className="relative h-full min-h-[480px] bg-cira-card">
      {cargando ? (
        <div className="flex h-full items-center justify-center">
          <Loader label="Cargando mapa..." />
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
              <Popup>Tu ubicación</Popup>
            </Marker>
          )}

          {trabajosVisibles.map((t) => (
            <Marker key={t.id} position={[t.lat!, t.lng!]} icon={iconoTrabajo}>
              <Popup>
                <p className="text-[11px] font-semibold uppercase text-cira-accent">{t.categoria}</p>
                <p className="font-semibold">{t.titulo}</p>
                <p className="text-sm text-gray-600">{t.ubicacion}</p>
                <p className="mt-1 text-sm font-semibold text-cira-accent">₡{t.pago.toLocaleString("es-CR")}</p>
              </Popup>
            </Marker>
          ))}

          {trabajadoresVisibles.map((w) => (
            <Marker key={w.id} position={[w.lat!, w.lng!]} icon={iconoTrabajador}>
              <Popup>
                <p className="font-semibold">{w.nombre}</p>
                <p className="text-sm text-gray-600">{w.servicios.join(" · ")}</p>
                <p className="text-sm text-gray-600">{w.disponible ? "Disponible" : "Ocupado"}</p>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      )}

      {/* Controles flotantes (Margin 16,48,16,0 y Spacing 10 en MAUI) */}
      <div className="pointer-events-none absolute inset-x-4 top-12 z-[1000] flex flex-col gap-2.5">
        <div className="pointer-events-auto flex items-center gap-2.5 rounded-[18px] border border-cira-border bg-cira-card px-3.5 py-2.5">
          <Icon name="search" size={22} className="text-cira-accent" />
          <input
            value={busqueda}
            onChange={(e) => onBusqueda(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && buscarAhora()}
            placeholder="Buscar ubicación"
            className="min-w-0 flex-1 bg-transparent text-cira-control text-cira-text-primary placeholder:text-cira-text-helper focus:outline-none"
          />
          <button onClick={buscarAhora} aria-label="Buscar" className="flex h-[34px] w-[34px] items-center justify-center text-cira-accent">
            <Icon name="arrow_forward" size={22} />
          </button>
        </div>

        {sugerencias.length > 0 && (
          <div className="pointer-events-auto max-h-[230px] overflow-y-auto rounded-[18px] border border-cira-border bg-cira-card p-2">
            {sugerencias.map((s) => (
              <button
                key={`${s.lat},${s.lng}`}
                onClick={() => irA(s)}
                className="flex w-full items-center gap-2.5 px-2.5 py-[9px] text-left"
              >
                <Icon name="place" size={20} className="shrink-0 text-cira-accent" />
                <span className="truncate text-[13px] text-cira-text-primary">{s.nombre}</span>
              </button>
            ))}
          </div>
        )}

        <div className="pointer-events-auto relative self-start">
          <button
            onClick={() => setFiltroAbierto((v) => !v)}
            className="flex items-center gap-2 rounded-2xl border border-cira-border bg-cira-card px-3 py-2"
          >
            <Icon name="tune" size={20} className="text-cira-accent" />
            <span className="text-[13px] font-semibold text-cira-text-primary">{filtro}</span>
          </button>
          {filtroAbierto && (
            <div className="absolute top-full left-0 mt-2 max-h-60 w-56 overflow-y-auto rounded-[18px] border border-cira-border bg-cira-card p-2">
              {[TODOS, ...CATEGORIAS].map((c) => (
                <button
                  key={c}
                  onClick={() => {
                    setFiltro(c);
                    setFiltroAbierto(false);
                  }}
                  className={`block w-full rounded-xl px-3 py-2 text-left text-[13px] ${
                    c === filtro
                      ? "bg-cira-nav-selected-bg font-semibold text-cira-accent"
                      : "text-cira-text-primary"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          )}
        </div>

        {aviso && (
          <div className="pointer-events-auto flex items-center gap-2.5 rounded-[18px] border border-cira-border bg-cira-card px-3.5 py-3">
            <Icon name="location_off" size={22} className="shrink-0 text-cira-accent" />
            <span className="flex-1 text-xs text-cira-text-primary">{aviso}</span>
          </div>
        )}
      </div>

      <button
        onClick={centrar}
        aria-label="Centrar en mi ubicación"
        className="absolute right-4 bottom-[22px] z-[1000] flex h-[52px] w-[52px] items-center justify-center rounded-[18px] border border-cira-border bg-cira-card shadow-[0_8px_18px_rgba(0,0,0,0.22)]"
      >
        <Icon name="my_location" size={28} className="text-cira-accent" />
      </button>
    </div>
  );
}
