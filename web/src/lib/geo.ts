// Geocodificación gratuita usando Nominatim (OpenStreetMap). No requiere
// API key; solo se le pide identificarse con un User-Agent/Referer válido,
// que el navegador agrega automáticamente. Uso razonable (no hacer ráfagas
// de requests) es suficiente para esta demo.

const NOMINATIM_URL = "https://nominatim.openstreetmap.org";

/** Coordenadas → texto de dirección legible (geocodificación inversa). */
export async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const res = await fetch(
      `${NOMINATIM_URL}/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=16&addressdetails=1`,
    );
    if (!res.ok) throw new Error("reverse geocode failed");
    const data = await res.json();
    return data.display_name ?? `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
  } catch {
    return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
  }
}

export interface ResultadoBusquedaDireccion {
  nombre: string;
  lat: number;
  lng: number;
}

/** Texto de dirección → lista de coincidencias con coordenadas (geocodificación). */
export async function buscarDireccion(query: string): Promise<ResultadoBusquedaDireccion[]> {
  if (!query.trim()) return [];
  try {
    const res = await fetch(
      `${NOMINATIM_URL}/search?format=jsonv2&q=${encodeURIComponent(query)}&countrycodes=cr&limit=5`,
    );
    if (!res.ok) throw new Error("geocode failed");
    const data = await res.json();
    return data.map((r: { display_name: string; lat: string; lon: string }) => ({
      nombre: r.display_name,
      lat: Number(r.lat),
      lng: Number(r.lon),
    }));
  } catch {
    return [];
  }
}

/** Pide la ubicación actual del navegador (gratis, requiere permiso del usuario). */
export function obtenerUbicacionActual(): Promise<{ lat: number; lng: number }> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Este navegador no soporta geolocalización."));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => reject(err),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  });
}
