import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Icon } from "@/components/ui/Icon";
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

/** Réplica de ConversacionPage.xaml: encabezado con avatar, burbujas y campo de mensaje en píldora. */
export function ConversacionPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [conversacion, setConversacion] = useState<Conversacion | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [texto, setTexto] = useState("");
  const [enviando, setEnviando] = useState(false);
  const finRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!id) return;
    api.conversaciones
      .obtener(id)
      .then(setConversacion)
      .catch(() => setNotFound(true));
  }, [id]);

  useEffect(() => {
    finRef.current?.scrollIntoView({ block: "end" });
  }, [conversacion?.mensajes.length]);

  if (notFound) {
    return (
      <div className="flex h-full items-center justify-center text-cira-text-secondary">
        Conversación no encontrada.
      </div>
    );
  }

  if (!conversacion) return <Loader label="Cargando conversación..." />;

  const enviar = async () => {
    if (!texto.trim() || !id) return;
    const nuevoTexto = texto.trim();
    setTexto("");
    setEnviando(true);
    try {
      const mensaje = await api.conversaciones.enviarMensaje(id, nuevoTexto);
      setConversacion((prev) => (prev ? { ...prev, mensajes: [...prev.mensajes, mensaje] } : prev));
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="flex h-full min-h-[480px] flex-col">
      <div className="flex items-center gap-2.5 px-4 pt-5 pb-3">
        <button onClick={() => navigate(-1)} aria-label="Volver" className="text-cira-accent">
          <Icon name="chevron_backward" size={28} />
        </button>
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-cira-header-icon-bg text-[15px] font-semibold text-cira-accent">
          {iniciales(conversacion.nombre)}
        </span>
        <p className="truncate text-[15px] font-semibold text-cira-text-primary">{conversacion.nombre}</p>
      </div>

      <div className="relative min-h-0 flex-1">
        <img
          src="/images/background.svg"
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-[0.09]"
        />

        <div className="no-scrollbar relative h-full overflow-y-auto py-1.5">
          {conversacion.mensajes.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
              <Icon name="chat" size={48} className="text-cira-text-helper" />
              <p className="text-cira-body text-cira-text-secondary">
                Aún no hay mensajes.
                <br />
                ¡Sé el primero en escribir!
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-0.5">
              {conversacion.mensajes.map((m) => {
                const mio = m.autor === "yo";
                return (
                  <div key={m.id} className={`flex px-3.5 py-0.5 ${mio ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[290px] rounded-2xl px-3 py-2 ${
                        mio ? "bg-cira-accent" : "bg-white"
                      }`}
                    >
                      <p className={`text-[15px] break-words ${mio ? "text-white" : "text-cira-text-primary"}`}>
                        {m.texto}
                      </p>
                      <p
                        className={`mt-[3px] text-end text-[10px] ${
                          mio ? "text-[#CCE0FF]" : "text-cira-text-helper"
                        }`}
                      >
                        {m.hora}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={finRef} />
            </div>
          )}
        </div>
      </div>

      <div className="mx-3 mb-3 flex items-center rounded-3xl border border-cira-border bg-white p-1">
        <input
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && enviar()}
          placeholder="Escribe un mensaje..."
          maxLength={2000}
          className="min-h-10 flex-1 bg-transparent pl-2 text-[15px] text-cira-text-primary placeholder:text-cira-text-helper focus:outline-none"
        />
        <button
          onClick={enviar}
          disabled={enviando}
          aria-label="Enviar"
          className="m-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-cira-accent text-white disabled:opacity-60"
        >
          <Icon name="send" size={22} filled />
        </button>
      </div>
    </div>
  );
}
