import { useState } from "react";
import { Button, Dialog, Sheet, TextArea, cx } from "@/components/aire";
import { api } from "@/lib/api";
import { tr } from "@/lib/i18n";

// Se guardan en español (clave de traducción); se muestran traducidos.
const MOTIVOS = ["No se presentó", "Mal trato", "Cobro indebido", "Perfil falso", "Otro"];

interface ReportSheetProps {
  /** Persona a reportar; null mantiene la hoja cerrada. */
  usuario: { id: string; nombre: string } | null;
  trabajoId?: string;
  onClose: () => void;
}

export function ReportSheet({ usuario, trabajoId, onClose }: ReportSheetProps) {
  const [motivo, setMotivo] = useState("");
  const [detalle, setDetalle] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cerrar = () => {
    setMotivo("");
    setDetalle("");
    setEnviado(false);
    setError(null);
    onClose();
  };

  const enviar = async () => {
    if (!usuario || !motivo) return;
    setEnviando(true);
    setError(null);
    try {
      await api.reportes.crear({ usuarioId: usuario.id, motivo, detalle, trabajoId });
      setEnviado(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : tr("No se pudo enviar el reporte."));
    } finally {
      setEnviando(false);
    }
  };

  return (
    <>
      <Sheet
        open={usuario !== null && !enviado}
        onClose={cerrar}
        title={tr("Reportar a {nombre}", { nombre: usuario?.nombre ?? "" })}
        subtitle={tr("Elige el motivo del reporte.")}
        contained
      >
        <div className="grid gap-4">
          <div className="grid gap-1.5">
            {MOTIVOS.map((m) => (
              <button
                key={m}
                type="button"
                aria-pressed={motivo === m}
                onClick={() => setMotivo(m)}
                className={cx(
                  "aire-text-body min-h-12 rounded-aire-md px-4 text-left transition-transform duration-[100ms] ease-aire-pop active:scale-[0.98]",
                  motivo === m ? "bg-aire-accent-soft font-semibold text-aire-accent-text" : "bg-aire-surface-2 text-aire-ink",
                )}
              >
                {tr(m)}
              </button>
            ))}
          </div>
          <TextArea rows={3} maxLength={500} placeholder={tr("Detalles (opcional)")} value={detalle} onChange={(e) => setDetalle(e.target.value)} />
          {error && <p className="aire-text-footnote text-center font-semibold text-aire-danger-text">{error}</p>}
          <Button variant="destructive" disabled={!motivo} loading={enviando} onClick={enviar}>
            {tr("Enviar reporte")}
          </Button>
          <Button variant="plain" onClick={cerrar}>
            {tr("Cancelar")}
          </Button>
        </div>
      </Sheet>

      <Dialog
        open={usuario !== null && enviado}
        onClose={cerrar}
        contained
        title={tr("Reporte enviado")}
        message={tr("Gracias, el equipo de CIRA lo revisará.")}
        actions={<Button onClick={cerrar}>{tr("Cerrar")}</Button>}
      />
    </>
  );
}
