import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { Loader } from "@/components/ui/Loader";
import { api } from "@/lib/api";
import type { Conversacion } from "@/lib/types";

export function ChatsPage() {
  const navigate = useNavigate();
  const [conversaciones, setConversaciones] = useState<Conversacion[] | null>(null);

  useEffect(() => {
    api.conversaciones.listar().then(setConversaciones).catch(() => setConversaciones([]));
  }, []);

  return (
    <div className="pb-4">
      <PageHeader title="Mensajes" subtitle="Tus conversaciones activas." icon="chat" />

      <div className="px-5">
        {conversaciones === null ? (
          <Loader label="Cargando conversaciones..." />
        ) : conversaciones.length === 0 ? (
          <EmptyState
            icon="chat_bubble"
            title="Sin mensajes"
            message="Cuando contactes a alguien, sus conversaciones aparecerán aquí."
          />
        ) : (
          conversaciones.map((c) => (
            <button
              key={c.id}
              onClick={() => navigate(`/chats/${c.id}`)}
              className="flex w-full items-center gap-3 border-b border-cira-border py-3.5 text-left last:border-none"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-cira-secondary font-semibold text-cira-accent">
                {c.nombre[0]}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <p className="truncate font-semibold text-cira-text-primary">{c.nombre}</p>
                  <span className="shrink-0 text-xs text-cira-text-helper">{c.hora}</span>
                </div>
                <p className="truncate text-sm text-cira-text-secondary">{c.ultimoMensaje}</p>
              </div>
              {c.noLeidos > 0 && (
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-cira-accent text-[11px] font-semibold text-white">
                  {c.noLeidos}
                </span>
              )}
            </button>
          ))
        )}
      </div>
    </div>
  );
}
