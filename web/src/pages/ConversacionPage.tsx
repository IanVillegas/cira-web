import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Icon, Loader } from "@/components/aire";
import { ReportSheet } from "@/components/ReportSheet";
import { api } from "@/lib/api";
import { usePolling } from "@/lib/usePolling";
import type { Conversacion } from "@/lib/types";
import { tr } from "@/lib/i18n";

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
  const [reportando, setReportando] = useState(false);
  const finRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!id) return;
    api.conversaciones
      .obtener(id)
      .then(setConversacion)
      .catch(() => setNotFound(true));
  }, [id]);

  // Mensajes del otro usuario sin recargar.
  usePolling(() => {
    if (id) api.conversaciones.obtener(id).then(setConversacion).catch(() => {});
  }, 3000);

  useEffect(() => {
    finRef.current?.scrollIntoView({ block: "end" });
  }, [conversacion?.mensajes.length]);

  if (notFound) {
    return (
      <div className="aire-text-body flex h-full items-center justify-center text-aire-ink-2">
        {tr("Conversación no encontrada.")}
      </div>
    );
  }

  if (!conversacion) return <Loader label={tr("Cargando conversación...")} />;

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
      <div className="flex items-center gap-2.5 px-3 pt-4 pb-3">
        <button type="button" onClick={() => navigate(-1)} aria-label={tr("Atrás")} className="flex h-11 w-11 items-center justify-center text-aire-accent-text">
          <Icon name="chevron_backward" size={28} />
        </button>
        <span className="aire-text-headline flex h-10 w-10 shrink-0 items-center justify-center rounded-aire-full bg-aire-accent-soft text-aire-accent-text">
          {iniciales(conversacion.nombre)}
        </span>
        <button
          type="button"
          onClick={() => navigate(`/usuarios/${conversacion.contraparteId}`)}
          className="aire-text-headline min-w-0 flex-1 truncate text-left text-aire-ink"
        >
          {conversacion.nombre}
        </button>
        <button type="button" onClick={() => setReportando(true)} aria-label={tr("Reportar usuario")} className="ca-iconbtn">
          <Icon name="flag" size={22} />
        </button>
      </div>

      <ReportSheet
        usuario={reportando ? { id: conversacion.contraparteId, nombre: conversacion.nombre } : null}
        onClose={() => setReportando(false)}
      />

      <div className="relative min-h-0 flex-1">
        <div className="no-scrollbar relative h-full overflow-y-auto py-1.5">
          {conversacion.mensajes.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
              <Icon name="chat_bubble" size={48} className="text-aire-ink-3" />
              <p className="aire-text-body text-aire-ink-2">
                {tr("Aún no hay mensajes.")}
                <br />
                {tr("¡Sé el primero en escribir!")}
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              {conversacion.mensajes.map((m) => {
                const mio = m.autor === "yo";
                return (
                  <div key={m.id} className={`flex px-4 ${mio ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[290px] rounded-aire-lg px-3.5 py-2 ${
                        mio ? "rounded-br-aire-xs bg-aire-accent text-aire-on-accent" : "rounded-bl-aire-xs bg-aire-surface text-aire-ink"
                      }`}
                    >
                      <p className="aire-text-body break-words">{m.texto}</p>
                      <p className={`aire-text-caption mt-0.5 text-end ${mio ? "opacity-80" : "text-aire-ink-2"}`}>{m.hora}</p>
                    </div>
                  </div>
                );
              })}
              <div ref={finRef} />
            </div>
          )}
        </div>
      </div>

      <div className="mx-3 mb-3 flex items-center rounded-aire-full bg-aire-surface p-1 shadow-aire-card">
        <input
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && enviar()}
          placeholder={tr("Escribe un mensaje...")}
          maxLength={2000}
          className="aire-text-body min-h-11 flex-1 bg-transparent pl-3 text-aire-ink placeholder:text-aire-ink-3 focus:outline-none"
        />
        <button
          type="button"
          onClick={enviar}
          disabled={enviando}
          aria-label={tr("Enviar")}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-aire-full bg-aire-accent text-aire-on-accent transition-transform duration-[100ms] ease-aire-pop active:scale-90 disabled:opacity-60"
        >
          <Icon name="arrow_upward" size={22} />
        </button>
      </div>
    </div>
  );
}
