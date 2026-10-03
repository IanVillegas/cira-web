import { useEffect } from "react";
import { MapContainer, Marker, TileLayer, useMap } from "react-leaflet";
import { Icon } from "./ui/Icon";
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
    <div className="flex flex-col gap-2">
      <div className="flex min-h-14 items-center gap-2.5 rounded-cira-input bg-cira-input-bg px-3.5">
        <Icon name="location_on" size={20} className="text-cira-accent" />
        <span className="text-cira-body text-cira-text-secondary">{text}</span>
      </div>

      <div className="relative h-48 overflow-hidden rounded-cira-input bg-cira-input-bg">
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
            <Icon name="explore_nearby" size={44} className="text-cira-text-helper" />
          </div>
        )}
      </div>
    </div>
  );
}
