import { TileLayer } from "react-leaflet";
import { useTema } from "@/lib/tema";

// Estilo del mapa: teselas de CARTO sobre datos de OpenStreetMap (gratis, sin
// API key). "Voyager" en claro y "Dark Matter" en oscuro: calles suaves para
// que los pines de CIRA resalten. Para probar otro estilo basta cambiar estas URLs.
const TESELAS = {
  claro: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
  oscuro: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
};

const ATRIBUCION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>';

/** Capa base de todos los mapas de CIRA; sigue el modo claro u oscuro de la app. */
export function MapaTeselas() {
  const { oscuro } = useTema();
  const url = oscuro ? TESELAS.oscuro : TESELAS.claro;
  return <TileLayer key={url} url={url} attribution={ATRIBUCION} subdomains="abcd" maxZoom={20} />;
}
