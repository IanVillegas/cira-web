import { TileLayer } from "react-leaflet";

// Estilo del mapa: teselas estándar de OpenStreetMap (gratis, sin API key) con
// un filtro CSS (.ca-maptiles en aire.css) que las suaviza en claro y las
// vuelve oscuras en modo oscuro. Los pines quedan fuera del filtro.
// Nota: CARTO (Voyager / Dark Matter) ahora pide API key, por eso no se usa.
const URL_TESELAS = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

const ATRIBUCION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';

/** Capa base de todos los mapas de CIRA; sigue el modo claro u oscuro de la app. */
export function MapaTeselas() {
  return <TileLayer url={URL_TESELAS} attribution={ATRIBUCION} className="ca-maptiles" maxZoom={19} />;
}
