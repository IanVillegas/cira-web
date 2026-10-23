import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, FilterChip, Icon, Input, Sheet } from "@/components/aire";
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

  const resumen = trabajo ? calcularResumen(trabajo.pago, trabajo.urgente, trabajo.metodoPago, config, propina) : null;
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

  const montoBoton = formatoColones.format(resumen?.enTarjeta || resumen?.total || 0);

  return (
    <Sheet
      open={trabajo !== null}
      onClose={cerrar}
      title={tr("Pagar trabajo")}
      subtitle={trabajo ? `${trabajo.titulo} · ${trabajo.trabajadorNombre ?? ""}` : undefined}
      contained
    >
      <div className="grid gap-4">
        <div className="grid gap-2">
          <div>
            <p className="aire-text-headline text-aire-ink">{tr("Agrega una propina para {nombre}", { nombre: trabajo?.trabajadorNombre ?? "" })}</p>
            <p className="aire-text-footnote text-aire-ink-2">{tr("Es opcional y va completa para el trabajador.")}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {PROPINAS.map((p) => (
              <FilterChip
                key={p}
                label={p === 0 ? tr("Sin propina") : formatoColones.format(p)}
                active={!otro && propina === p}
                onClick={() => {
                  setOtro(false);
                  setPropina(p);
                }}
              />
            ))}
            <FilterChip
              label={tr("Otro monto")}
              active={otro}
              onClick={() => {
                setOtro(true);
                setPropina(0);
              }}
            />
          </div>
          {otro && (
            <Input
              type="number"
              inputMode="numeric"
              min={0}
              autoFocus
              prefix="₡"
              placeholder={tr("Monto de la propina")}
              onChange={(e) => setPropina(Math.max(0, Math.round(Number(e.target.value) || 0)))}
            />
          )}
        </div>

        {resumen && <PagoResumen resumen={resumen} />}

        {necesitaTarjeta &&
          (tarjeta ? (
            <p className="aire-text-subhead flex items-center gap-2 text-aire-ink-2">
              <Icon name="credit_card" size={20} className="text-aire-accent-text" />
              {tr("Se cobrará a tu {marca} terminada en {ultimos4}", { marca: tarjeta.marca, ultimos4: tarjeta.ultimos4 })}
            </p>
          ) : (
            <Button variant="secondary" icon="credit_card" onClick={() => navigate("/cuenta/tarjeta")}>
              {tr("Registrar tarjeta")}
            </Button>
          ))}

        {error && <p className="aire-text-footnote text-center font-semibold text-aire-danger-text">{error}</p>}

        <Button loading={pagando} disabled={necesitaTarjeta && !tarjeta} onClick={pagar}>
          {trabajo?.metodoPago === "Efectivo" && !necesitaTarjeta ? tr("Confirmar pago en efectivo") : tr("Pagar {monto}", { monto: montoBoton })}
        </Button>
        <Button variant="plain" onClick={cerrar}>
          {tr("Cancelar")}
        </Button>
      </div>
    </Sheet>
  );
}
