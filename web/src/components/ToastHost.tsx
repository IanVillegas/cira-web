import { useEffect, useState } from "react";
import { Icon } from "./ui/Icon";
import { cerrarToast, suscribirToasts, type Toast } from "@/lib/toast";

const ESTILO = {
  exito: { icono: "check_circle", clase: "bg-emerald-600" },
  error: { icono: "error", clase: "bg-cira-btn-destructive-text" },
  info: { icono: "info", clase: "bg-cira-tertiary" },
} as const;

/** Avisos breves que flotan arriba del teléfono; se montan una sola vez en AppShell. */
export function ToastHost() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  useEffect(() => suscribirToasts(setToasts), []);

  if (toasts.length === 0) return null;
  return (
    <div className="pointer-events-none absolute inset-x-3 top-3 z-[4000] flex flex-col gap-2" aria-live="polite">
      {toasts.map((t) => (
        <button
          key={t.id}
          type="button"
          onClick={() => {
            t.accion?.();
            cerrarToast(t.id);
          }}
          className={`pointer-events-auto flex items-center gap-2.5 rounded-2xl px-4 py-3 text-left text-[14px] font-semibold text-white shadow-[0_10px_28px_rgba(0,0,0,0.3)] ${ESTILO[t.tipo].clase}`}
        >
          <Icon name={ESTILO[t.tipo].icono} filled size={22} />
          <span className="flex-1">{t.texto}</span>
        </button>
      ))}
    </div>
  );
}
