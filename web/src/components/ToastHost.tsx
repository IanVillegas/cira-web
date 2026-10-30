import { useEffect, useState } from "react";
import { Toast as AireToast } from "@/components/aire";
import { cerrarToast, suscribirToasts, type Toast, type TipoToast } from "@/lib/toast";

const ESTILO: Record<TipoToast, { icon: string; tone: "success" | "danger" | "neutral" }> = {
  exito: { icon: "check_circle", tone: "success" },
  error: { icon: "error", tone: "danger" },
  info: { icon: "info", tone: "neutral" },
};

/**
 * Muestra el aviso más reciente con el Toast de Aire; se monta una sola vez en AppShell.
 * Conserva el último mensaje mientras el aviso sale, para que la animación no parpadee.
 */
export function ToastHost() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [ultimo, setUltimo] = useState<Toast | null>(null);

  useEffect(() => suscribirToasts(setToasts), []);

  const actual = toasts[toasts.length - 1] ?? null;
  // Ajusta el último mensaje conocido cuando llega uno nuevo (patrón de "estado derivado de una prop").
  if (actual && actual !== ultimo) setUltimo(actual);

  if (!ultimo) return null;
  const estilo = ESTILO[ultimo.tipo];
  return (
    <AireToast
      open={!!actual}
      message={ultimo.texto}
      icon={estilo.icon}
      tone={estilo.tone}
      duration={0}
      onPress={
        ultimo.accion
          ? () => {
              ultimo.accion?.();
              cerrarToast(ultimo.id);
            }
          : undefined
      }
    />
  );
}
