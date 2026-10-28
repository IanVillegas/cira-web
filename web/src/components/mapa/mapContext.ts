import type * as MapLibreGL from "maplibre-gl";
import { createContext, useContext } from "react";

// Contexto del mapa (separado de mapcn.tsx para que Fast Refresh funcione).

export type MapLibreModule = typeof MapLibreGL;

/** Estilos de OpenFreeMap: Positron (claro y sobrio) y Dark. Cambiar aquí para probar otro. */
export const ESTILOS_MAPA = {
  claro: "https://tiles.openfreemap.org/styles/positron",
  oscuro: "https://tiles.openfreemap.org/styles/dark",
};

export type MapContextValue = {
  map: MapLibreGL.Map | null;
  mapLib: MapLibreModule | null;
  isLoaded: boolean;
};

export const MapContext = createContext<MapContextValue | null>(null);

/** Acceso a la instancia de MapLibre desde un hijo de <Map>. */
export function useMap() {
  const context = useContext(MapContext);
  if (!context) throw new Error("useMap debe usarse dentro de <Map>");
  return context;
}

