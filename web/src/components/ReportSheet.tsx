import { useState } from "react";
import { BottomSheet } from "./ui/BottomSheet";
import { Button } from "./ui/Button";
import { api } from "@/lib/api";

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
      setError(e instanceof Error ? e.message : "No se pudo enviar el reporte.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <BottomSheet
      open={usuario !== null}
      onClose={cerrar}
      title={enviado ? "Reporte enviado" : `Reportar a ${usuario?.nombre ?? ""}`}
      subtitle={enviado ? "Gracias, el equipo de CIRA lo revisará." : "Elige el motivo del reporte."}
    >
      {enviado ? (
        <Button onClick={cerrar}>Cerrar</Button>
      ) : (
        <>
          <div className="flex flex-col gap-2">
            {MOTIVOS.map((m) => (
              <button
                key={m}
                type="button"
                aria-pressed={motivo === m}
                onClick={() => setMotivo(m)}
                className={`rounded-2xl border px-4 py-3 text-left text-[15px] ${
                  motivo === m
                    ? "border-cira-accent bg-cira-nav-selected-bg font-semibold text-cira-accent"
                    : "border-cira-border text-cira-text-primary"
                }`}
              >
                {m}
              </button>
            ))}
          </div>
          <textarea
            rows={3}
            maxLength={500}
            placeholder="Detalles (opcional)"
            value={detalle}
            onChange={(e) => setDetalle(e.target.value)}
            className="w-full resize-none rounded-cira-input bg-cira-input-bg px-3.5 py-2.5 text-cira-body text-cira-text-primary ring-1 ring-cira-border placeholder:text-cira-text-helper focus:outline-none"
          />
          {error && <p className="text-center text-[13px] text-cira-btn-destructive-text">{error}</p>}
          <Button variant="destructive" disabled={!motivo || enviando} onClick={enviar}>
            {enviando ? "ENVIANDO..." : "ENVIAR REPORTE"}
          </Button>
          <Button variant="outlined" onClick={cerrar}>
            Cancelar
          </Button>
        </>
      )}
    </BottomSheet>
  );
}
