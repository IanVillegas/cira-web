import { useEffect, useRef, useState } from "react";

/** true si el sistema pide reducir movimiento. */
export function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Marca un elemento como visible la primera vez que entra en pantalla.
 * Con movimiento reducido (o sin IntersectionObserver) aparece de inmediato.
 */
export function useInView<T extends Element>(options: { once?: boolean; rootMargin?: string } = {}) {
  const { once = true, rootMargin = "0px 0px -8% 0px" } = options;
  const ref = useRef<T | null>(null);
  // Con movimiento reducido (o sin IntersectionObserver) empieza visible.
  const [inView, setInView] = useState(() => prefersReducedMotion() || typeof IntersectionObserver === "undefined");
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    if (inView && once) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setInView(true);
            if (once) io.disconnect();
          } else if (!once) setInView(false);
        }
      },
      { rootMargin, threshold: 0.12 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [once, rootMargin, inView]);
  return [ref, inView] as const;
}
