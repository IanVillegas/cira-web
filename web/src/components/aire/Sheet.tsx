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
}

/**
 * Hoja inferior (reemplaza a DistrictPickerSheet y similares): sube con la
 * curva de resorte de iOS, el fondo se oscurece y se puede cerrar
 * arrastrándola hacia abajo, tocando el velo o con Escape.
 */
export function Sheet({ open, onClose, title, subtitle, children, contained = false }: SheetProps) {
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

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    panelRef.current?.focus();
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!mounted) return null;

  const onPointerDown = (e: RPointerEvent) => {
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
        aria-label={title}
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
