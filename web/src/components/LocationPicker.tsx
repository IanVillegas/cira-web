import { useState } from "react";
import { MapContainer, Marker, TileLayer, useMapEvents } from "react-leaflet";
import { Icon } from "./ui/Icon";
import { FieldCaption } from "./ui/FieldCaption";
import { iconoSeleccionado } from "@/lib/leafletIcons";
import { obtenerUbicacionActual, reverseGeocode } from "@/lib/geo";

const CENTRO_DEFECTO: [number, number] = [10.0163, -84.2113]; // Alajuela Centro

interface LocationPickerProps {
  value: { lat: number; lng: number } | null;
  /** Dirección legible de la ubicación elegida (se muestra arriba del mapa). */
  address: string;
  onChange: (coords: { lat: number; lng: number }, direccion: string) => void;
}

function ClickHandler({ onClick }: { onClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onClick(e.latlng.lat, e.latlng.lng);
    },
  });
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
      setError("No se pudo obtener tu ubicación. Revisa los permisos del navegador o marca el punto en el mapa.");
    } finally {
      setBuscando(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <FieldCaption>Ubicación del trabajo</FieldCaption>
        <button
          type="button"
          onClick={usarMiUbicacion}
          disabled={buscando}
          className="flex items-center gap-1 text-[13px] font-semibold text-cira-accent disabled:opacity-60"
        >
          <Icon name="my_location" size={16} />
          {buscando ? "Ubicando..." : "Usar mi ubicación"}
        </button>
      </div>

      <div className="flex min-h-14 items-center gap-2.5 rounded-cira-input bg-cira-input-bg px-3.5">
        <Icon name="location_on" size={20} className="shrink-0 text-cira-accent" />
        <span className="text-cira-body text-cira-text-secondary">
          {address || "Toca el mapa para marcar la ubicación"}
        </span>
      </div>

      <div className="h-52 w-full overflow-hidden rounded-cira-input bg-cira-input-bg">
        <MapContainer
          center={value ?? CENTRO_DEFECTO}
          zoom={value ? 16 : 13}
          scrollWheelZoom={false}
          className="h-full w-full"
          attributionControl={false}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <ClickHandler onClick={seleccionar} />
          {value && <Marker position={value} icon={iconoSeleccionado} />}
        </MapContainer>
      </div>

      {error && <p className="text-xs text-cira-btn-destructive-text">{error}</p>}
    </div>
  );
}
