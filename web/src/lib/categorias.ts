// Identidad visual de cada categoría para las tarjetas con foto: imagen de
// fondo (public/images/categorias/) y el token del tono oscuro al que se funde
// el degradado (--aire-cat-*, definidos en components/aire/aire.css).

export interface CategoriaVisual {
  /** URL de la foto, o "" si la categoría no tiene una. */
  imagen: string;
  /** Valor CSS del tono de la categoría, p. ej. "var(--aire-cat-limpieza)". */
  tono: string;
  /** Ícono de Material Symbols. */
  icono: string;
}

const VISUALES: Record<string, { slug: string; icono: string }> = {
  Limpieza: { slug: "limpieza", icono: "cleaning_services" },
  "Plomería": { slug: "plomeria", icono: "plumbing" },
  Electricidad: { slug: "electricidad", icono: "electrical_services" },
  "Jardinería": { slug: "jardineria", icono: "yard" },
  Mudanzas: { slug: "mudanzas", icono: "inventory_2" },
  Transporte: { slug: "transporte", icono: "local_shipping" },
  "Cuidado de mascotas": { slug: "mascotas", icono: "pets" },
  Reparaciones: { slug: "reparaciones", icono: "handyman" },
};

// Categorías todavía sin foto: tarjeta con el tono por defecto y su ícono.
const SIN_FOTO: Record<string, string> = {
  "Cerrajería": "key",
};

export function visualDeCategoria(categoria: string): CategoriaVisual {
  const v = VISUALES[categoria];
  if (!v) return { imagen: "", tono: "var(--aire-cat-default)", icono: SIN_FOTO[categoria] ?? "work" };
  return { imagen: `/images/categorias/${v.slug}.webp`, tono: `var(--aire-cat-${v.slug})`, icono: v.icono };
}
