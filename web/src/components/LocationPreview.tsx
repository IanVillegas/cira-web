import { useEffect } from "react";
import { Icon } from "@/components/aire";
import { Map, MapMarker, MarkerContent } from "@/components/mapa/mapcn";
import { useMap } from "@/components/mapa/mapContext";
import { ANCLA_GOTA, PinSeleccionado } from "@/components/mapa/Pines";

function Recenter({ center }: { center: [number, number] }) {
  const { map } = useMap();
  useEffect(() => {
    map?.jumpTo({ center: [center[1], center[0]], zoom: 13 });
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
          <Map center={[center[1], center[0]]} zoom={13} interactive={false}>
            <Recenter center={center} />
            <MapMarker longitude={center[1]} latitude={center[0]} anchor={ANCLA_GOTA}>
              <MarkerContent>
                <PinSeleccionado />
              </MarkerContent>
            </MapMarker>
          </Map>
        ) : (
          <div className="flex h-full items-center justify-center">
            <Icon name="explore_nearby" size={44} className="text-aire-ink-3" />
          </div>
        )}
      </div>
    </div>
  );
}
