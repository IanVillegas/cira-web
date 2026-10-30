import { useEffect, useRef } from "react";

/** Ejecuta `fn` cada `ms` mientras la pestaña esté visible (actualización "en vivo" entre usuarios). */
export function usePolling(fn: () => void, ms: number) {
  const guardada = useRef(fn);
  useEffect(() => {
    guardada.current = fn;
  });
  useEffect(() => {
    const id = window.setInterval(() => {
      if (document.visibilityState === "visible") guardada.current();
    }, ms);
    return () => window.clearInterval(id);
  }, [ms]);
}
