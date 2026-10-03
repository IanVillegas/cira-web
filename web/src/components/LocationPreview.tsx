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

/** Vista previa no interactiva de la zona elegida (CiraLocationPreview). */
export function LocationPreview({ center, text }: LocationPreviewProps) {
  return (
    <div className="overflow-hidden rounded-cira-input bg-cira-input-bg">
      <div className="relative h-44 w-full bg-cira-surface-muted">
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
      <div className="flex items-center gap-2 px-3.5 py-3">
        <Icon name="location_on" size={18} className="text-cira-accent" />
        <span className="text-[13px] text-cira-text-secondary">{text}</span>
      </div>
    </div>
  );
}
