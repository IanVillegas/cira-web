import L from "leaflet";
import { visualDeCategoria } from "@/lib/categorias";

// Pines del mapa hechos con divIcon (HTML + clases .ca-pin* de aire.css), así
// usan los tokens --aire-* y cambian solos con el modo oscuro. Los estilos
// viven en components/aire/aire.css, sección "Mapa".

const cache = new Map<string, L.DivIcon>();

function memo(clave: string, crear: () => L.DivIcon) {
  let icono = cache.get(clave);
  if (!icono) {
    icono = crear();
    cache.set(clave, icono);
  }
  return icono;
}

const escapar = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

const simbolo = (nombre: string) => `<span class="material-symbols-rounded ca-pin-icon">${nombre}</span>`;

/** Gota con el ícono de la categoría. Las urgencias van en rojo y laten. */
export function iconoTrabajo(categoria: string, urgente = false) {
  return memo(`trabajo:${categoria}:${urgente}`, () =>
    L.divIcon({
      className: "",
      html: `<div class="ca-pin${urgente ? " ca-pin--urgente" : ""}">${simbolo(visualDeCategoria(categoria).icono)}</div>`,
      iconSize: [40, 48],
      iconAnchor: [20, 48],
      popupAnchor: [0, -46],
    }),
  );
}

function iniciales(nombre: string) {
  const partes = nombre.trim().split(/\s+/);
  return ((partes[0]?.[0] ?? "") + (partes[1]?.[0] ?? "")).toUpperCase();
}

/** Avatar redondo con iniciales, punto de disponibilidad y su calificación. */
export function iconoTrabajador(nombre: string, disponible: boolean, calificacion: number | null) {
  const nota = calificacion != null ? calificacion.toFixed(1) : null;
  return memo(`trabajador:${nombre}:${disponible}:${nota}`, () =>
    L.divIcon({
      className: "",
      html:
        `<div class="ca-pin-avatar${disponible ? "" : " ca-pin-avatar--ocupado"}">` +
        `<span class="ca-pin-avatar-ini">${escapar(iniciales(nombre))}</span>` +
        `<span class="ca-pin-avatar-dot"></span>` +
        (nota ? `<span class="ca-pin-avatar-nota">★ ${nota}</span>` : "") +
        `</div>`,
      iconSize: [40, 40],
      iconAnchor: [20, 20],
      popupAnchor: [0, -22],
    }),
  );
}

/** Punto elegido al publicar o en la vista previa: gota grande en acento. */
export const iconoSeleccionado = L.divIcon({
  className: "",
  html: `<div class="ca-pin ca-pin--grande">${simbolo("home_pin")}</div>`,
  iconSize: [48, 58],
  iconAnchor: [24, 58],
  popupAnchor: [0, -56],
});

/** "Tu ubicación": punto azul con halo que respira. */
export const iconoUsuario = L.divIcon({
  className: "",
  html: `<div class="ca-pin-yo"></div>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});
