// Distritos disponibles en el registro. En el MAUI original se cargaban del
// backend (provincia → cantón → distrito); para el MVP web se usa una lista
// fija de zonas de Alajuela, Heredia y San José con su centro aproximado.
export interface Distrito {
  id: string;
  nombre: string;
  canton: string;
  provincia: string;
  lat: number;
  lng: number;
}

export const DISTRITOS: Distrito[] = [
  { id: "ala-centro", nombre: "Alajuela", canton: "Alajuela", provincia: "Alajuela", lat: 10.0163, lng: -84.2113 },
  { id: "ala-rio-segundo", nombre: "Río Segundo", canton: "Alajuela", provincia: "Alajuela", lat: 10.0134, lng: -84.2239 },
  { id: "ala-desamparados", nombre: "Desamparados", canton: "Alajuela", provincia: "Alajuela", lat: 10.025, lng: -84.25 },
  { id: "ala-san-jose", nombre: "San José", canton: "Alajuela", provincia: "Alajuela", lat: 10.0305, lng: -84.2335 },
  { id: "ala-guacima", nombre: "Guácima", canton: "Alajuela", provincia: "Alajuela", lat: 9.9769, lng: -84.2679 },
  { id: "ala-turrucares", nombre: "Turrúcares", canton: "Alajuela", provincia: "Alajuela", lat: 9.9758, lng: -84.3092 },
  { id: "her-centro", nombre: "Heredia", canton: "Heredia", provincia: "Heredia", lat: 9.9989, lng: -84.1174 },
  { id: "her-san-francisco", nombre: "San Francisco", canton: "Heredia", provincia: "Heredia", lat: 9.9811, lng: -84.1295 },
  { id: "sj-escazu", nombre: "Escazú", canton: "Escazú", provincia: "San José", lat: 9.9189, lng: -84.1394 },
  { id: "sj-centro", nombre: "Carmen", canton: "San José", provincia: "San José", lat: 9.9341, lng: -84.0795 },
];
