import { useSyncExternalStore } from "react";

// Cantidad de mensajes sin leer, compartida entre el vigilante (AppShell) y la barra inferior.
let total = 0;
const oyentes = new Set<() => void>();

export function fijarNoLeidos(nuevo: number) {
  if (nuevo === total) return;
  total = nuevo;
  oyentes.forEach((o) => o());
}

export function useNoLeidos(): number {
  return useSyncExternalStore(
    (cb) => {
      oyentes.add(cb);
      return () => {
        oyentes.delete(cb);
      };
    },
    () => total,
  );
}
