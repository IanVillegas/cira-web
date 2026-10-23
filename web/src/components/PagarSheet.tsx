import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BottomSheet } from "./ui/BottomSheet";
import { Button } from "./ui/Button";
import { Icon } from "./ui/Icon";
import { PagoResumen } from "./PagoResumen";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { formatoColones } from "@/lib/format";
import { tr } from "@/lib/i18n";
import { calcularResumen, useConfig } from "@/lib/useConfig";
import type { Trabajo } from "@/lib/types";

const PROPINAS = [0, 500, 1000, 2000];

interface PagarSheetProps {
  trabajo: Trabajo | null;
  onClose: () => void;
  onPaid: (trabajo: Trabajo) => void;
}

/** Pago simulado estilo Uber: resumen, propina opcional y la tarjeta con la que se cobra. */
export function PagarSheet({ trabajo, onClose, onPaid }: PagarSheetProps) {
  const navigate = useNavigate();
  const config = useConfig();
  const { usuario } = useAuth();
  const [propina, setPropina] = useState(0);
  const [otro, setOtro] = useState(false);
  const [pagando, setPagando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resumen = trabajo
    ? calcularResumen(trabajo.pago, trabajo.urgente, trabajo.metodoPago, config, propina)
    : null;
  const necesitaTarjeta = (resumen?.enTarjeta ?? 0) > 0;
  const tarjeta = usuario?.tarjeta ?? null;

  const cerrar = () => {
    setPropina(0);
    setOtro(false);
    setError(null);
    onClose();
  };

  const pagar = async () => {
    if (!trabajo) return;
    setPagando(true);
    setError(null);
    try {
      const actualizado = await api.trabajos.pagar(trabajo.id, propina);
      setPropina(0);
      setOtro(false);
      onPaid(actualizado);
    } catch (e) {
      setError(e instanceof Error ? e.message : tr("No se pudo completar la acción."));
    } finally {
      setPagando(false);
    }
  };

  return (
    <BottomSheet
      open={trabajo !== null}
      onClose={cerrar}
      title={tr("Pagar trabajo")}
      subtitle={trabajo ? `${trabajo.titulo} · ${trabajo.trabajadorNombre ?? ""}` : undefined}
    >
      <div>
        <p className="text-[13px] font-semibold text-cira-text-primary">{tr("Agrega una propina para {nombre}", { nombre: trabajo?.trabajadorNombre ?? "" })}</p>
        <p className="mb-2 text-xs text-cira-text-secondary">{tr("Es opcional y va completa para el trabajador.")}</p>
        <div className="grid grid-cols-4 gap-2">
          {PROPINAS.map((p) => (
            <button
              key={p}
              type="button"
              aria-pressed={!otro && propina === p}
              onClick={() => {
                setOtro(false);
                setPropina(p);
              }}
              className={`rounded-full border px-1 py-2.5 text-[13px] font-semibold ${
                !otro && propina === p ? "border-cira-accent bg-cira-nav-selected-bg text-cira-accent" : "border-cira-border text-cira-text-primary"
              }`}
            >
              {p === 0 ? tr("Sin propina") : formatoColones.format(p)}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => {
            setOtro(true);
            setPropina(0);
          }}
          className="mt-2 w-full text-center text-[13px] font-semibold text-cira-accent"
        >
          {tr("Otro monto")}
        </button>
        {otro && (
          <input
            type="number"
            inputMode="numeric"
            min={0}
            autoFocus
            placeholder={tr("Monto de la propina")}
            onChange={(e) => setPropina(Math.max(0, Math.round(Number(e.target.value) || 0)))}
            className="mt-2 min-h-12 w-full rounded-cira-input bg-cira-input-bg px-3.5 text-cira-control ring-1 ring-cira-border focus:outline-none"
          />
        )}
      </div>

      {resumen && <PagoResumen resumen={resumen} />}

      {necesitaTarjeta &&
        (tarjeta ? (
          <p className="flex items-center gap-2 text-[13px] text-cira-text-secondary">
            <Icon name="credit_card" size={20} className="text-cira-accent" />
            {tr("Se cobrará a tu {marca} terminada en {ultimos4}", { marca: tarjeta.marca, ultimos4: tarjeta.ultimos4 })}
          </p>
        ) : (
          <Button variant="outlined" onClick={() => navigate("/cuenta/tarjeta")}>
            {tr("REGISTRAR TARJETA")}
          </Button>
        ))}

      {error && <p className="text-center text-[13px] text-cira-btn-destructive-text">{error}</p>}

      <Button disabled={pagando || (necesitaTarjeta && !tarjeta)} onClick={pagar}>
        {pagando
          ? tr("PROCESANDO...")
          : trabajo?.metodoPago === "Efectivo" && !necesitaTarjeta
            ? tr("CONFIRMAR PAGO EN EFECTIVO")
            : tr("PAGAR {monto}", { monto: formatoColones.format(resumen?.enTarjeta || resumen?.total || 0) })}
      </Button>
      <Button variant="outlined" onClick={cerrar}>
        {tr("Cancelar")}
      </Button>
    </BottomSheet>
  );
}
