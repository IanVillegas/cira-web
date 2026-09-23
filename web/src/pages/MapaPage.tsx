import { useEffect, useState } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import { PageHeader } from "@/components/ui/PageHeader";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";
import { Loader } from "@/components/ui/Loader";
import { api } from "@/lib/api";
import { obtenerUbicacionActual } from "@/lib/geo";
import { iconoTrabajador, iconoTrabajo, iconoUsuario } from "@/lib/leafletIcons";
import type { Trabajador, Trabajo } from "@/lib/types";

// Centro por defecto: Alajuela Centro, Costa Rica.
const CENTRO_DEFECTO: [number, number] = [10.0163, -84.2113];

function RecenterMap({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, 15, { duration: 0.8 });
  }, [center, map]);
  return null;
}

export function MapaPage() {
  const [trabajos, setTrabajos] = useState<Trabajo[]>([]);
  const [trabajadores, setTrabajadores] = useState<Trabajador[]>([]);
  const [cargando, setCargando] = useState(true);
  const [miUbicacion, setMiUbicacion] = useState<[number, number] | null>(null);
  const [centro, setCentro] = useState<[number, number]>(CENTRO_DEFECTO);
  const [errorUbicacion, setErrorUbicacion] = useState<string | null>(null);

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

  const usarMiUbicacion = async () => {
    setErrorUbicacion(null);
    try {
      const { lat, lng } = await obtenerUbicacionActual();
      setMiUbicacion([lat, lng]);
      setCentro([lat, lng]);
    } catch {
      setErrorUbicacion("No se pudo obtener tu ubicación. Revisá los permisos del navegador.");
    }
  };

  return (
    <div className="flex h-full flex-col pb-2">
      <PageHeader title="Mapa" subtitle="Trabajos y trabajadores cerca de ti." />

      <div className="relative mx-5 flex-1 overflow-hidden rounded-cira-card">
        {cargando ? (
          <div className="flex h-full items-center justify-center bg-cira-surface-muted">
            <Loader label="Cargando mapa..." />
          </div>
        ) : (
          <MapContainer
            center={centro}
            zoom={14}
            scrollWheelZoom
            className="h-full w-full"
            attributionControl={false}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            />
            <RecenterMap center={centro} />

            {miUbicacion && (
              <Marker position={miUbicacion} icon={iconoUsuario}>
                <Popup>Tu ubicación</Popup>
              </Marker>
            )}

            {trabajos
              .filter((t) => t.lat != null && t.lng != null)
              .map((t) => (
                <Marker key={t.id} position={[t.lat!, t.lng!]} icon={iconoTrabajo}>
                  <Popup>
                    <p className="text-[11px] font-semibold uppercase text-cira-accent">{t.categoria}</p>
                    <p className="font-semibold">{t.titulo}</p>
                    <p className="text-sm text-gray-600">{t.ubicacion}</p>
                    <p className="mt-1 text-sm font-semibold text-cira-accent">
                      ₡{t.pago.toLocaleString("es-CR")}
                    </p>
                  </Popup>
                </Marker>
              ))}

            {trabajadores
              .filter((w) => w.lat != null && w.lng != null)
              .map((w) => (
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

        <button
          onClick={usarMiUbicacion}
          className="absolute bottom-4 right-4 z-[1000] flex h-11 w-11 items-center justify-center rounded-full bg-cira-card shadow-lg"
          aria-label="Usar mi ubicación"
        >
          <Icon name="my_location" size={22} className="text-cira-accent" />
        </button>
      </div>

      {errorUbicacion && (
        <div className="mx-5 mt-3 flex items-center gap-2 rounded-cira-input bg-cira-btn-destructive-bg px-4 py-2.5 text-sm text-cira-btn-destructive-text">
          <Icon name="error" size={18} />
          {errorUbicacion}
        </div>
      )}

      {!cargando && trabajos.length === 0 && trabajadores.length === 0 && (
        <div className="mx-5 mt-3">
          <Button variant="outlined" fullWidth disabled>
            Sin datos para mostrar en el mapa
          </Button>
        </div>
      )}
    </div>
  );
}
