import { useState } from "react";
import { BottomSheet } from "./ui/BottomSheet";
import { Button } from "./ui/Button";
import { EstrellasInput } from "./Estrellas";
import { api } from "@/lib/api";
import type { Trabajo } from "@/lib/types";
import { tr } from "@/lib/i18n";

interface RatingSheetProps {
  trabajo: Trabajo | null;
  onClose: () => void;
  onDone: (trabajo: Trabajo) => void;
}

/** Calificación de 1 a 5 estrellas con comentario: la hacen ambas partes al terminar el trabajo. */
export function RatingSheet({ trabajo, onClose, onDone }: RatingSheetProps) {
  const [estrellas, setEstrellas] = useState(0);
  const [comentario, setComentario] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const enviar = async () => {
    if (!trabajo || estrellas === 0) return;
    setEnviando(true);
    setError(null);
    try {
      const actualizado = await api.trabajos.calificar(trabajo.id, estrellas, comentario);
      setEstrellas(0);
      setComentario("");
      onDone(actualizado);
    } catch (e) {
      setError(e instanceof Error ? e.message : tr("No se pudo enviar la calificación."));
    } finally {
      setEnviando(false);
    }
  };

  return (
    <BottomSheet
      open={trabajo !== null}
      onClose={onClose}
      title={tr("Califica a {nombre}", { nombre: trabajo?.contraparteNombre ?? tr("la otra persona") })}
      subtitle={trabajo?.titulo}
    >
      <EstrellasInput value={estrellas} onChange={setEstrellas} />
      <textarea
        rows={3}
        maxLength={500}
        placeholder={tr("Cuéntanos cómo fue (opcional)")}
        value={comentario}
        onChange={(e) => setComentario(e.target.value)}
        className="w-full resize-none rounded-cira-input bg-cira-input-bg px-3.5 py-2.5 text-cira-body text-cira-text-primary ring-1 ring-cira-border placeholder:text-cira-text-helper focus:outline-none"
      />
      {error && <p className="text-center text-[13px] text-cira-btn-destructive-text">{error}</p>}
      <Button disabled={estrellas === 0 || enviando} onClick={enviar}>
        {enviando ? tr("ENVIANDO...") : tr("ENVIAR CALIFICACIÓN")}
      </Button>
      <Button variant="outlined" onClick={onClose}>
        {tr("Ahora no")}
      </Button>
    </BottomSheet>
  );
}
