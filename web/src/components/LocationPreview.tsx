import { useEffect } from "react";
import { MapContainer, Marker, TileLayer, useMap } from "react-leaflet";
import { Icon } from "@/components/aire";
import { iconoSeleccionado } from "@/lib/leafletIcons";

function Recenter({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 14);
  }, [center, map]);
  return null;
}

interface LocationPreviewProps {
  center: [number, number] | null;
  text: string;
}

/**
 * Réplica de CiraLocationPreview: arriba el texto de la zona (contenedor blanco
 * con ícono acento) y debajo la vista previa del mapa, no interactiva.
 */
export function LocationPreview({ center, text }: LocationPreviewProps) {
  return (
    <div className="grid gap-2">
      <div className="flex min-h-14 items-center gap-2.5 rounded-aire-sm bg-aire-surface-2 px-4">
        <Icon name="location_on" size={20} className="shrink-0 text-aire-accent-text" />
        <span className="aire-text-subhead text-aire-ink-2">{text}</span>
      </div>

      <div className="relative h-48 overflow-hidden rounded-aire-md bg-aire-surface-3">
        {center ? (
          <MapContainer
            center={center}
            zoom={14}
            className="h-full w-full"
            zoomControl={false}
            dragging={false}
            scrollWheelZoom={false}
            doubleClickZoom={false}
            touchZoom={false}
            attributionControl={false}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <Recenter center={center} />
            <Marker position={center} icon={iconoSeleccionado} />
          </MapContainer>
        ) : (
          <div className="flex h-full items-center justify-center">
            <Icon name="explore_nearby" size={44} className="text-aire-ink-3" />
          </div>
        )}
      </div>
    </div>
  );
}
