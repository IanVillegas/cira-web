import L from "leaflet";

// Leaflet's default marker PNGs no resuelven bien con Vite. En vez de pelear
// con las rutas de esos assets, usamos íconos propios (divIcon) hechos con
// el mismo Material Symbol "location_on" del resto de la app, así el mapa
// se ve consistente con el design system de CIRA.
function pinIcon(colorVar: string, size = 38) {
  return L.divIcon({
    className: "",
    html: `<span class="material-symbols-rounded" style="font-size:${size}px; color:${colorVar}; font-variation-settings:'FILL' 1; filter: drop-shadow(0 2px 3px rgba(0,0,0,.25))">location_on</span>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size],
  });
}

export const iconoTrabajo = pinIcon("var(--color-cira-accent)");
export const iconoTrabajador = pinIcon("var(--color-cira-tertiary)");
export const iconoSeleccionado = pinIcon("#d94b5f", 42);
export const iconoUsuario = L.divIcon({
  className: "",
  html: `<span style="display:block;width:16px;height:16px;border-radius:9999px;background:var(--color-cira-accent);border:3px solid white;box-shadow:0 0 0 2px var(--color-cira-accent), 0 2px 6px rgba(0,0,0,.35)"></span>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});
