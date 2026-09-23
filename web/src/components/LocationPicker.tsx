import { useState } from "react";
import { MapContainer, Marker, TileLayer, useMapEvents } from "react-leaflet";
import { Icon } from "./ui/Icon";
import { iconoSeleccionado } from "@/lib/leafletIcons";
import { obtenerUbicacionActual, reverseGeocode } from "@/lib/geo";

const CENTRO_DEFECTO: [number, number] = [10.0163, -84.2113]; // Alajuela Centro

interface LocationPickerProps {
  value: { lat: number; lng: number } | null;
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

/** Mapa interactivo (Leaflet + OpenStreetMap, gratis) para marcar la ubicación de un trabajo. */
export function LocationPicker({ value, onChange }: LocationPickerProps) {
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
      setError("No se pudo obtener tu ubicación. Revisá los permisos del navegador o marcá el punto en el mapa.");
    } finally {
      setBuscando(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-cira-body font-semibold text-cira-text-primary">Ubicación en el mapa</span>
        <button
          type="button"
          onClick={usarMiUbicacion}
          disabled={buscando}
          className="flex items-center gap-1 text-sm font-semibold text-cira-accent disabled:opacity-60"
        >
          <Icon name="my_location" size={16} />
          {buscando ? "Ubicando..." : "Usar mi ubicación"}
        </button>
      </div>

      <div className="h-48 w-full overflow-hidden rounded-cira-input border border-cira-input-border">
        <MapContainer
          center={value ?? CENTRO_DEFECTO}
          zoom={value ? 16 : 13}
          scrollWheelZoom={false}
          className="h-full w-full"
          attributionControl={false}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; OpenStreetMap'
          />
          <ClickHandler onClick={seleccionar} />
          {value && <Marker position={value} icon={iconoSeleccionado} />}
        </MapContainer>
      </div>

      <p className="text-xs text-cira-text-helper">Tocá el mapa para marcar el punto exacto del trabajo.</p>
      {error && <p className="text-xs text-cira-btn-destructive-text">{error}</p>}
    </div>
  );
}
