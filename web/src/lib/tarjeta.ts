export type MarcaTarjeta = "Visa" | "Mastercard" | "American Express" | "Tarjeta";

/** Marca según el inicio del número (misma regla que el servidor). */
export function marcaDe(numero: string): MarcaTarjeta {
  const n = numero.replace(/\D/g, "");
  if (/^4/.test(n)) return "Visa";
  if (/^(5[1-5]|2(2[2-9][1-9]|[3-6]\d\d|7[01]\d|720))/.test(n)) return "Mastercard";
  if (/^3[47]/.test(n)) return "American Express";
  return "Tarjeta";
}

/** Muestra los dígitos escritos y completa con puntos hasta 16, en grupos de 4. */
export function numeroEnmascarado(digitos: string): string {
  const d = digitos.replace(/\D/g, "").slice(0, 16).padEnd(16, "•");
  return d.replace(/(.{4})/g, "$1 ").trim();
}
