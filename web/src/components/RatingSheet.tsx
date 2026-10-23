import { useState } from "react";
import { Button, Sheet, TextArea } from "@/components/aire";
import { EstrellasInput } from "./Estrellas";
import { api } from "@/lib/api";
import { tr } from "@/lib/i18n";
import type { Trabajo } from "@/lib/types";

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
    <Sheet
      open={trabajo !== null}
      onClose={onClose}
      title={tr("Califica a {nombre}", { nombre: trabajo?.contraparteNombre ?? tr("la otra persona") })}
      subtitle={trabajo?.titulo}
      contained
    >
      <div className="grid gap-4">
        <EstrellasInput value={estrellas} onChange={setEstrellas} />
        <TextArea rows={3} maxLength={500} placeholder={tr("Cuéntanos cómo fue (opcional)")} value={comentario} onChange={(e) => setComentario(e.target.value)} />
        {error && <p className="aire-text-footnote text-center font-semibold text-aire-danger-text">{error}</p>}
        <Button disabled={estrellas === 0} loading={enviando} onClick={enviar}>
          {tr("Enviar calificación")}
        </Button>
        <Button variant="plain" onClick={onClose}>
          {tr("Ahora no")}
        </Button>
      </div>
    </Sheet>
  );
}
