import { useEffect, type ReactNode } from "react";
import { cx } from "./cx";

export interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  message?: string;
  /** Ícono grande arriba (Material Symbols); por defecto un check de éxito. */
  icon?: string;
  tone?: "success" | "accent" | "danger";
  /** Contenido extra (desglose, detalle) bajo el mensaje. */
  children?: ReactNode;
  /** Botones; normalmente un <Button> principal. */
  actions: ReactNode;
  /** Vive dentro de un contenedor posicionado (por defecto, la ventana). */
  contained?: boolean;
}

/**
 * Diálogo centrado de confirmación (adición a CIRA Aire): el ícono entra con
 * rebote sobre un velo; se cierra con Escape o tocando fuera.
 */
export function Dialog({ open, onClose, title, message, icon = "check_circle", tone = "success", children, actions, contained = false }: DialogProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className={cx("ca-dialog", contained && "is-contained")} role="presentation">
      <div className="ca-dialog__scrim" onClick={onClose} />
      <div className="ca-dialog__panel" role="dialog" aria-modal="true" aria-label={title}>
        <span className={cx("ca-dialog__icon", `ca-dialog__icon--${tone}`)}>
          <span className="ca-icon is-filled" style={{ fontSize: 44 }} aria-hidden="true">
            {icon}
          </span>
        </span>
        <h2>{title}</h2>
        {message && <p>{message}</p>}
        {children && <div className="ca-dialog__body">{children}</div>}
        <div className="ca-dialog__actions">{actions}</div>
      </div>
    </div>
  );
}
