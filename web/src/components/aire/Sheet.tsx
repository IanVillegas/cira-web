import { useEffect, useRef, useState, type PointerEvent as RPointerEvent, type ReactNode } from "react";
import { cx } from "./cx";
import { Icon } from "./Icon";
import { prefersReducedMotion } from "./motion";

export interface SheetProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: ReactNode;
  /** Contenedor posicionado donde vive la hoja (por defecto, la ventana). */
  contained?: boolean;
  /** Nombre accesible cuando la hoja no lleva título visible (p. ej. el detalle de un trabajo). */
  label?: string;
}

/**
 * Hoja inferior (reemplaza a DistrictPickerSheet y similares): sube con la
 * curva de resorte de iOS, el fondo se oscurece y se puede cerrar
 * deslizándola hacia abajo (desde cualquier parte en táctil, desde la barrita con
 * mouse), tocando el velo o con Escape.
 */
export function Sheet({ open, onClose, title, subtitle, children, contained = false, label }: SheetProps) {
  const [mounted, setMounted] = useState(open);
  const [shown, setShown] = useState(false);
  // Al abrir se monta en el mismo render (patrón de "ajustar estado cuando cambia una prop").
  if (open && !mounted) setMounted(true);
  const [drag, setDrag] = useState(0);
  const start = useRef<{ y: number; t: number } | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Abrir: mostrar dos cuadros después de montar, para que la transición corra.
  // Cerrar: la clase se quita al instante y se desmonta cuando termina la animación.
  useEffect(() => {
    if (open) {
      let inner = 0;
      const outer = requestAnimationFrame(() => {
        inner = requestAnimationFrame(() => setShown(true));
      });
      return () => {
        cancelAnimationFrame(outer);
        cancelAnimationFrame(inner);
      };
    }
    const t = window.setTimeout(() => {
      setShown(false);
      setMounted(false);
    }, prefersReducedMotion() ? 0 : 420);
    return () => window.clearTimeout(t);
  }, [open]);

  // Cerrar deslizando hacia abajo desde cualquier parte del panel (en táctil). Solo arrastra
  // cuando el contenido ya está arriba del todo; si no, el gesto es un scroll normal. Mientras
  // arrastra, el gesto no llega a la página (evita el "deslizar para recargar" del navegador).
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });
  useEffect(() => {
    const panel = panelRef.current;
    if (!open || !panel) return;
    let inicio: { x: number; y: number; t: number } | null = null;
    let arrastrando = false;
    let dy = 0;

    const cuerpoArriba = (target: EventTarget | null) => {
      const cuerpo = panel.querySelector(".ca-sheet__body");
      return !cuerpo || !cuerpo.contains(target as Node) || cuerpo.scrollTop <= 0;
    };
    const onStart = (e: TouchEvent) => {
      const p = e.touches[0];
      inicio = cuerpoArriba(e.target) ? { x: p.clientX, y: p.clientY, t: performance.now() } : null;
      arrastrando = false;
      dy = 0;
    };
    const onMove = (e: TouchEvent) => {
      if (!inicio) return;
      const p = e.touches[0];
      const dx = p.clientX - inicio.x;
      dy = p.clientY - inicio.y;
      if (!arrastrando) {
        // Hacia arriba o de lado (un carrusel): es scroll, no cierre.
        if (dy <= 0 || Math.abs(dx) > Math.abs(dy)) {
          if (Math.abs(dx) > 8 || dy < -8) inicio = null;
          return;
        }
        if (dy < 8) return;
        arrastrando = true;
      }
      e.preventDefault();
      setDrag(Math.max(0, dy));
    };
    const onEnd = () => {
      if (arrastrando && inicio) {
        const v = dy / Math.max(1, performance.now() - inicio.t);
        if (dy > 120 || v > 0.6) onCloseRef.current();
      }
      inicio = null;
      arrastrando = false;
      setDrag(0);
    };

    panel.addEventListener("touchstart", onStart, { passive: true });
    panel.addEventListener("touchmove", onMove, { passive: false });
    panel.addEventListener("touchend", onEnd);
    panel.addEventListener("touchcancel", onEnd);
    return () => {
      panel.removeEventListener("touchstart", onStart);
      panel.removeEventListener("touchmove", onMove);
      panel.removeEventListener("touchend", onEnd);
      panel.removeEventListener("touchcancel", onEnd);
    };
  }, [open, mounted]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    panelRef.current?.focus();
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!mounted) return null;

  // Con mouse o lápiz se arrastra desde la barrita de arriba; el táctil lo maneja el efecto de arriba.
  const onPointerDown = (e: RPointerEvent) => {
    if (e.pointerType === "touch") return;
    start.current = { y: e.clientY, t: performance.now() };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: RPointerEvent) => {
    if (!start.current) return;
    setDrag(Math.max(0, e.clientY - start.current.y));
  };
  const onPointerUp = (e: RPointerEvent) => {
    if (!start.current) return;
    const dy = e.clientY - start.current.y;
    const v = dy / Math.max(1, performance.now() - start.current.t);
    start.current = null;
    setDrag(0);
    if (dy > 120 || v > 0.6) onClose();
  };

  return (
    <div className={cx("ca-sheet", contained && "is-contained", open && shown && "is-open")} role="presentation">
      <div className="ca-sheet__scrim" onClick={onClose} />
      <div
        ref={panelRef}
        className={cx("ca-sheet__panel", drag > 0 && "is-dragging")}
        style={drag ? { transform: `translateY(${drag}px)` } : undefined}
        role="dialog"
        aria-modal="true"
        aria-label={title ?? label}
        tabIndex={-1}
      >
        <div className="ca-sheet__grab" onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={onPointerUp}>
          <span />
        </div>
        {(title || subtitle) && (
          <div className="ca-sheet__head">
            <div>
              {title && <h2>{title}</h2>}
              {subtitle && <p>{subtitle}</p>}
            </div>
            <button type="button" className="ca-iconbtn ca-iconbtn--sm" aria-label="Cerrar" onClick={onClose}>
              <Icon name="close" size={20} />
            </button>
          </div>
        )}
        <div className="ca-sheet__body">{children}</div>
      </div>
    </div>
  );
}
