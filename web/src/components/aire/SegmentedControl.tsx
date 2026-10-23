import { useLayoutEffect, useRef, useState } from "react";
import { cx } from "./cx";

export interface SegmentItem {
  value: string;
  label: string;
}

export interface SegmentedControlProps {
  items: SegmentItem[];
  value: string;
  onChange: (value: string) => void;
  /** Ocupa todo el ancho con segmentos iguales. */
  fullWidth?: boolean;
  label?: string;
  /** Margen lateral de 20px que se desplaza con el contenido (para alinear con el resto de la pantalla). */
  gutter?: boolean;
}

/**
 * Control segmentado (reemplaza a ExploreTabs): una píldora blanca se desliza
 * hasta la opción elegida con la curva de resorte de iOS. Si no cabe, se
 * desplaza horizontalmente y mantiene visible la opción activa.
 */
export function SegmentedControl({ items, value, onChange, fullWidth = false, label = "Secciones", gutter = false }: SegmentedControlProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [thumb, setThumb] = useState<{ x: number; w: number } | null>(null);

  useLayoutEffect(() => {
    const track = trackRef.current;
    const active = track?.querySelector<HTMLElement>('[aria-selected="true"]');
    if (!track || !active) return;
    const measure = () => setThumb({ x: active.offsetLeft, w: active.offsetWidth });
    measure();
    const scroller = track.parentElement;
    if (scroller && scroller.scrollWidth > scroller.clientWidth) {
      scroller.scrollTo({ left: active.offsetLeft - (scroller.clientWidth - active.offsetWidth) / 2, behavior: "smooth" });
    }
    // Re-medir si cambia el tamaño de la barra o de cualquier ítem (p. ej. al terminar de cargar la fuente).
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(measure) : null;
    ro?.observe(track);
    track.querySelectorAll("button").forEach((el) => ro?.observe(el));
    let alive = true;
    document.fonts?.ready.then(() => alive && measure());
    return () => {
      alive = false;
      ro?.disconnect();
    };
  }, [value, items.length]);

  return (
    <div className={cx("ca-seg-scroll", fullWidth && "is-full", gutter && "has-gutter")}>
      <div ref={trackRef} className="ca-seg" role="tablist" aria-label={label}>
        <span
          className={cx("ca-seg__thumb", thumb && "is-ready")}
          style={thumb ? { width: thumb.w, transform: `translateX(${thumb.x}px)` } : undefined}
          aria-hidden="true"
        />
        {items.map((it) => (
          <button
            key={it.value}
            type="button"
            role="tab"
            aria-selected={it.value === value}
            className="ca-seg__item"
            onClick={() => onChange(it.value)}
          >
            {it.label}
          </button>
        ))}
      </div>
    </div>
  );
}
