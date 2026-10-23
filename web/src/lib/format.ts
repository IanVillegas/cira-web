export const formatoColones = new Intl.NumberFormat("es-CR", {
  style: "currency",
  currency: "CRC",
  maximumFractionDigits: 0,
});

/** Solo los dígitos de un teléfono (sin guion ni espacios). */
export const soloDigitosTelefono = (v: string) => v.replace(/\D/g, "").slice(0, 8);

/** 61044195 → 6104-4195 (solo para mostrar; el valor guardado y validado son los 8 dígitos). */
export function formatearTelefono(v: string) {
  const d = soloDigitosTelefono(v);
  return d.length > 4 ? `${d.slice(0, 4)}-${d.slice(4)}` : d;
}
