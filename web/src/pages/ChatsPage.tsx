import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { Loader } from "@/components/ui/Loader";
import { api } from "@/lib/api";
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

  useEffect(() => {
    api.conversaciones
      .listar()
      .then(setConversaciones)
      .catch(() => setError(true));
  }, []);

  return (
    <div className="pb-4">
      <PageHeader
        title="Mensajes"
        subtitle="Tus conversaciones activas"
        icon="chat"
        className="px-5 pt-10 pb-[18px]"
      />

      {error ? (
        <div className="mx-5 mt-3 rounded-cira-card bg-cira-card p-6">
          <EmptyState image="empty_no_signal" title="Sin conexión" />
        </div>
      ) : conversaciones === null ? (
        <Loader label="Cargando conversaciones..." />
      ) : conversaciones.length === 0 ? (
        <EmptyState
          image="empty_no_messages"
          title="Sin conversaciones aún"
          message="Las conversaciones aparecerán aquí cuando contactes a alguien."
        />
      ) : (
        <div className="mt-1">
          {conversaciones.map((c) => (
            <div key={c.id}>
              <button
                onClick={() => navigate(`/chats/${c.id}`)}
                className="flex w-full items-center gap-3.5 px-5 py-[13px] text-left"
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-cira-header-icon-bg text-base font-semibold text-cira-accent">
                  {iniciales(c.nombre)}
                </span>
                <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="truncate text-[15px] font-semibold text-cira-text-primary">
                    {c.nombre}
                  </span>
                  <span className="truncate text-xs text-cira-text-secondary">{c.ultimoMensaje}</span>
                </span>
                <span className="flex shrink-0 flex-col items-end gap-[5px]">
                  <span className="text-[11px] text-cira-text-helper">{c.hora}</span>
                  {c.noLeidos > 0 && (
                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-cira-accent px-[5px] text-[11px] font-semibold text-white">
                      {c.noLeidos}
                    </span>
                  )}
                </span>
              </button>
              <div className="mx-5 h-[0.6px] bg-cira-border" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
