export type TipoToast = "exito" | "error" | "info";

export interface Toast {
  id: number;
  texto: string;
  tipo: TipoToast;
  /** Si existe, tocar el aviso ejecuta esta acción (p. ej. abrir un chat). */
  accion?: () => void;
}

type Oyente = (toasts: Toast[]) => void;

let toasts: Toast[] = [];
let siguienteId = 1;
const oyentes = new Set<Oyente>();

const emitir = () => oyentes.forEach((o) => o(toasts));

export function suscribirToasts(oyente: Oyente) {
  oyentes.add(oyente);
  oyente(toasts);
  return () => {
    oyentes.delete(oyente);
  };
}

export function cerrarToast(id: number) {
  toasts = toasts.filter((t) => t.id !== id);
  emitir();
}

/** Muestra un aviso breve (se cierra solo). */
export function mostrarToast(texto: string, tipo: TipoToast = "exito", accion?: () => void) {
  const id = siguienteId++;
  toasts = [...toasts.slice(-2), { id, texto, tipo, accion }];
  emitir();
  window.setTimeout(() => cerrarToast(id), 3500);
}
