import { useEffect } from "react";
import { cx } from "./cx";
import { Icon } from "./Icon";

export interface ToastProps {
  open: boolean;
  message: string;
  icon?: string;
  tone?: "neutral" | "success" | "danger";
  /** Se cierra solo después de N ms (0 = no se cierra solo). */
  duration?: number;
  onClose?: () => void;
  /** Si se indica, tocar el aviso ejecuta esta acción (p. ej. abrir el chat). */
  onPress?: () => void;
}

/**
 * Aviso flotante de vidrio (adición: CIRA no lo tenía). Cae desde arriba con
 * rebote, como las notificaciones de iOS, y se cierra solo.
 */
export function Toast({ open, message, icon = "check_circle", tone = "success", duration = 2600, onClose, onPress }: ToastProps) {
  useEffect(() => {
    if (open && duration > 0 && onClose) {
      const t = window.setTimeout(onClose, duration);
      return () => window.clearTimeout(t);
    }
  }, [open, duration, onClose]);
  return (
    <div
      className={cx("ca-toast", `ca-toast--${tone}`, open && "is-open", onPress && "is-pressable")}
      role="status"
      aria-live="polite"
      onClick={onPress}
    >
      <Icon name={icon} filled size={22} className="ca-toast__icon" />
      <span>{message}</span>
    </div>
  );
}
