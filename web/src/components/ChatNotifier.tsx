import { useCallback, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { fijarNoLeidos } from "@/lib/noLeidos";
import { tr } from "@/lib/i18n";
import { mostrarToast } from "@/lib/toast";
import { usePolling } from "@/lib/usePolling";

/**
 * Vigila los mensajes nuevos: actualiza la insignia del chat y avisa con un toast
 * cuando llega un mensaje de una conversación que no está abierta. No pinta nada.
 */
export function ChatNotifier() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const conteos = useRef<Map<string, number> | null>(null);
  const rutaActual = useRef(pathname);

  useEffect(() => {
    rutaActual.current = pathname;
  }, [pathname]);

  const revisar = useCallback(async () => {
    try {
      const { total, pendientes } = await api.conversaciones.noLeidos();
      fijarNoLeidos(total);
      const nuevos = new Map(pendientes.map((p) => [p.conversacionId, p.cantidad]));
      // La primera consulta solo registra el estado actual, para no avisar de mensajes viejos.
      if (conteos.current) {
        for (const p of pendientes) {
          const antes = conteos.current.get(p.conversacionId) ?? 0;
          if (p.cantidad > antes && rutaActual.current !== `/chats/${p.conversacionId}`) {
            mostrarToast(tr("{nombre}: {texto}", { nombre: p.nombre, texto: p.texto }), "info", () =>
              navigate(`/chats/${p.conversacionId}`),
            );
          }
        }
      }
      conteos.current = nuevos;
    } catch {
      /* sin conexión: se reintenta en el siguiente ciclo */
    }
  }, [navigate]);

  useEffect(() => {
    revisar();
  }, [revisar]);
  usePolling(revisar, 4000);

  return null;
}
