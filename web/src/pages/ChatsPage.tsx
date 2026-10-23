import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader, PageHeader, Stagger } from "@/components/aire";
import { Vacio } from "@/components/Vacio";
import { api } from "@/lib/api";
import { tr } from "@/lib/i18n";
import { usePolling } from "@/lib/usePolling";
import type { Conversacion } from "@/lib/types";

function iniciales(nombre: string) {
  return nombre
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function ChatsPage() {
  const navigate = useNavigate();
  const [conversaciones, setConversaciones] = useState<Conversacion[] | null>(null);
  const [error, setError] = useState(false);

  const cargar = useCallback(
    () =>
      api.conversaciones
        .listar()
        .then(setConversaciones)
        .catch(() => setError(true)),
    [],
  );

  useEffect(() => {
    cargar();
  }, [cargar]);
  usePolling(cargar, 4000);

  return (
    <div className="pb-6">
      <PageHeader title={tr("Mensajes")} subtitle={tr("Tus conversaciones activas")} reserveBar />

      {error ? (
        <Vacio image="empty_no_signal" title={tr("Sin conexión")} />
      ) : conversaciones === null ? (
        <Loader label={tr("Cargando conversaciones...")} />
      ) : conversaciones.length === 0 ? (
        <Vacio
          image="empty_no_messages"
          title={tr("Sin conversaciones aún")}
          message={tr("Las conversaciones aparecerán aquí cuando contactes a alguien.")}
        />
      ) : (
        <Stagger className="mx-5 grid overflow-hidden rounded-aire-lg bg-aire-surface">
          {conversaciones.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => navigate(`/chats/${c.id}`)}
              className="flex min-h-[72px] w-full items-center gap-3.5 border-b border-aire-hairline px-4 py-3 text-left transition-colors duration-[100ms] last:border-b-0 active:bg-aire-surface-2"
            >
              <span className="aire-text-headline flex h-12 w-12 shrink-0 items-center justify-center rounded-aire-full bg-aire-accent-soft text-aire-accent-text">
                {iniciales(c.nombre)}
              </span>
              <span className="grid min-w-0 flex-1 gap-0.5">
                <span className={`aire-text-headline truncate text-aire-ink ${c.noLeidos > 0 ? "" : "font-medium"}`}>{c.nombre}</span>
                <span className={`aire-text-subhead truncate ${c.noLeidos > 0 ? "font-semibold text-aire-ink" : "text-aire-ink-2"}`}>
                  {c.ultimoMensaje}
                </span>
              </span>
              <span className="grid shrink-0 justify-items-end gap-1.5">
                <span className="aire-text-caption text-aire-ink-2">{c.hora}</span>
                {c.noLeidos > 0 && (
                  <span className="aire-text-caption flex h-5 min-w-5 items-center justify-center rounded-aire-full bg-aire-accent px-1.5 font-bold text-aire-on-accent">
                    {c.noLeidos}
                  </span>
                )}
              </span>
            </button>
          ))}
        </Stagger>
      )}
    </div>
  );
}
