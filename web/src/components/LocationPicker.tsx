import { useEffect, useState } from "react";
import { FieldCaption, Icon } from "@/components/aire";
import { Map, MapMarker, MarkerContent } from "@/components/mapa/mapcn";
import { useMap } from "@/components/mapa/mapContext";
import { ANCLA_GOTA, PinSeleccionado } from "@/components/mapa/Pines";
import { obtenerUbicacionActual, reverseGeocode } from "@/lib/geo";
import { tr } from "@/lib/i18n";

const CENTRO_DEFECTO: [number, number] = [10.0163, -84.2113]; // Alajuela Centro

interface LocationPickerProps {
  value: { lat: number; lng: number } | null;
  /** Dirección legible de la ubicación elegida (se muestra arriba del mapa). */
  address: string;
  onChange: (coords: { lat: number; lng: number }, direccion: string) => void;
}

/** Lleva el mapa al punto elegido (también cuando llega de "Usar mi ubicación" o de una propiedad). */
function SeguirSeleccion({ value }: { value: { lat: number; lng: number } | null }) {
  const { map } = useMap();
  useEffect(() => {
    if (map && value) map.easeTo({ center: [value.lng, value.lat], zoom: Math.max(map.getZoom(), 14), duration: 500 });
  }, [map, value]);
  return null;
}

/**
 * "UBICACIÓN DEL TRABAJO": texto de la zona arriba y mapa interactivo
 * (Leaflet + OpenStreetMap, gratis) debajo para marcar el punto exacto.
 */
export function LocationPicker({ value, address, onChange }: LocationPickerProps) {
  const [buscando, setBuscando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const seleccionar = async (lat: number, lng: number) => {
    setError(null);
    const direccion = await reverseGeocode(lat, lng);
    onChange({ lat, lng }, direccion);
  };

  const usarMiUbicacion = async () => {
    setBuscando(true);
    setError(null);
    try {
      const { lat, lng } = await obtenerUbicacionActual();
      await seleccionar(lat, lng);
    } catch {
      setError(tr("No se pudo obtener tu ubicación. Revisa los permisos del navegador o marca el punto en el mapa."));
    } finally {
      setBuscando(false);
    }
  };

  return (
    <div className="grid gap-2">
      <div className="flex items-center justify-between">
        <FieldCaption>{tr("Ubicación del trabajo")}</FieldCaption>
        <button
          type="button"
          onClick={usarMiUbicacion}
          disabled={buscando}
          className="aire-text-footnote flex min-h-11 items-center gap-1 font-semibold text-aire-accent-text disabled:opacity-60"
        >
          <Icon name="my_location" size={16} />
          {buscando ? tr("Ubicando...") : tr("Usar mi ubicación")}
        </button>
      </div>

      <div className="flex min-h-14 items-center gap-2.5 rounded-aire-sm bg-aire-surface-2 px-4">
        <Icon name="location_on" size={20} className="shrink-0 text-aire-accent-text" />
        <span className="aire-text-subhead text-aire-ink-2">
          {address || tr("Toca el mapa para marcar la ubicación")}
        </span>
      </div>

      <div className="h-52 w-full overflow-hidden rounded-aire-md bg-aire-surface-3">
        <Map
          center={value ? [value.lng, value.lat] : [CENTRO_DEFECTO[1], CENTRO_DEFECTO[0]]}
          zoom={value ? 15 : 12}
          scrollZoom={false}
          onClick={({ lat, lng }) => seleccionar(lat, lng)}
        >
          <SeguirSeleccion value={value} />
          {value && (
            <MapMarker longitude={value.lng} latitude={value.lat} anchor={ANCLA_GOTA}>
              <MarkerContent>
                <PinSeleccionado />
              </MarkerContent>
            </MapMarker>
          )}
        </Map>
      </div>

      {error && <p className="aire-text-footnote font-semibold text-aire-danger-text">{error}</p>}
    </div>
  );
}
