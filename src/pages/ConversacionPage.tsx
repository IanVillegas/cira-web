import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Icon } from "@/components/ui/Icon";
import { conversacionesMock } from "@/lib/mockData";
import type { Mensaje } from "@/lib/types";

export function ConversacionPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const conversacion = conversacionesMock.find((c) => c.id === id);
  const [mensajes, setMensajes] = useState<Mensaje[]>(conversacion?.mensajes ?? []);
  const [texto, setTexto] = useState("");

  if (!conversacion) {
    return (
      <div className="flex h-full items-center justify-center text-cira-text-secondary">
        Conversación no encontrada.
      </div>
    );
  }

  const enviar = () => {
    if (!texto.trim()) return;
    setMensajes((prev) => [
      ...prev,
      {
        id: `m-${Date.now()}`,
        autor: "yo",
        texto: texto.trim(),
        hora: new Date().toLocaleTimeString("es-CR", { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
    setTexto("");
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 border-b border-cira-border px-5 pb-3 pt-6">
        <button onClick={() => navigate(-1)} className="text-cira-header-text">
          <Icon name="arrow_back" size={26} />
        </button>
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cira-secondary font-semibold text-cira-accent">
          {conversacion.nombre[0]}
        </div>
        <p className="font-semibold text-cira-text-primary">{conversacion.nombre}</p>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
        {mensajes.map((m) => (
          <div key={m.id} className={`flex ${m.autor === "yo" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${
                m.autor === "yo"
                  ? "rounded-br-sm bg-cira-accent text-white"
                  : "rounded-bl-sm bg-cira-surface-muted text-cira-text-primary"
              }`}
            >
              <p>{m.texto}</p>
              <p className={`mt-1 text-[10px] ${m.autor === "yo" ? "text-white/70" : "text-cira-text-helper"}`}>
                {m.hora}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 border-t border-cira-border px-4 py-3">
        <input
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && enviar()}
          placeholder="Escribí un mensaje..."
          className="flex-1 rounded-full border border-cira-input-border bg-cira-input-bg px-4 py-2.5 text-sm focus:border-cira-accent focus:outline-none"
        />
        <button
          onClick={enviar}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-cira-accent text-white"
          aria-label="Enviar"
        >
          <Icon name="send" size={20} />
        </button>
      </div>
    </div>
  );
}
