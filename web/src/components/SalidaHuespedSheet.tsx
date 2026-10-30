import { useState } from "react";
import { Button, Field, Input, SelectableCard, Sheet, TextArea } from "@/components/aire";
import { api } from "@/lib/api";
import { hoyDia } from "@/lib/fechas";
import { tr } from "@/lib/i18n";
import { useConfig } from "@/lib/useConfig";
import type { MetodoPago, Propiedad, Trabajo } from "@/lib/types";

interface SalidaHuespedSheetProps {
  propiedad: Propiedad | null;
  onClose: () => void;
  onCreada: (trabajo: Trabajo) => void;
}

/**
 * Limpieza entre huéspedes: cuándo sale el huésped y cuándo entra el próximo. CIRA se la ofrece
 * al limpiador habitual y, si no responde a tiempo, la pasa a urgencia.
 */
export function SalidaHuespedSheet({ propiedad, onClose, onCreada }: SalidaHuespedSheetProps) {
  const config = useConfig();
  const hoy = hoyDia();
  const [form, setForm] = useState({ salidaDia: hoy, salidaHora: "11:00", entradaDia: hoy, entradaHora: "15:00", pago: "", notas: "" });
  const [metodo, setMetodo] = useState<MetodoPago>("Tarjeta");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const salida = `${form.salidaDia}T${form.salidaHora}`;
  const entrada = `${form.entradaDia}T${form.entradaHora}`;
  const valido = form.salidaDia && form.salidaHora && form.entradaDia && form.entradaHora && entrada > salida && Number(form.pago) > 0;

  const enviar = async () => {
    if (!propiedad || !valido) return;
    setEnviando(true);
    setError(null);
    try {
      const t = await api.propiedades.entreHuespedes(propiedad.id, {
        salida,
        entrada,
        pago: Number(form.pago),
        metodoPago: metodo,
        notas: form.notas.trim() || undefined,
      });
      onCreada(t);
    } catch (e) {
      setError(e instanceof Error ? e.message : tr("No se pudo completar la acción."));
    } finally {
      setEnviando(false);
    }
  };

  return (
    <Sheet open={propiedad !== null} onClose={onClose} title={tr("Salida de huésped")} subtitle={propiedad?.nombre} contained>
      {propiedad && (
        <div className="grid gap-3.5">
          <div className="grid grid-cols-2 gap-3">
            <Input
              label={tr("Sale el huésped")}
              type="date"
              min={hoy}
              value={form.salidaDia}
              onChange={(e) => setForm({ ...form, salidaDia: e.target.value, entradaDia: e.target.value > form.entradaDia ? e.target.value : form.entradaDia })}
            />
            <Input label={tr("Hora")} type="time" value={form.salidaHora} onChange={(e) => setForm({ ...form, salidaHora: e.target.value })} />
            <Input
              label={tr("Entra el próximo")}
              type="date"
              min={form.salidaDia}
              value={form.entradaDia}
              onChange={(e) => setForm({ ...form, entradaDia: e.target.value })}
            />
            <Input label={tr("Hora")} type="time" value={form.entradaHora} onChange={(e) => setForm({ ...form, entradaHora: e.target.value })} />
          </div>
          {form.entradaDia && form.entradaHora && entrada <= salida && (
            <p className="aire-text-footnote font-semibold text-aire-danger-text">{tr("La entrada del próximo huésped debe ser después de la salida.")}</p>
          )}
          <Input
            label={tr("Monto de la limpieza")}
            type="number"
            inputMode="numeric"
            min={1}
            prefix="₡"
            placeholder="18000"
            value={form.pago}
            onChange={(e) => setForm({ ...form, pago: e.target.value })}
          />
          <Field label={tr("Método de pago")}>
            <div className="grid grid-cols-2 gap-2.5">
              <SelectableCard icon="payments" text={tr("Efectivo")} selected={metodo === "Efectivo"} onClick={() => setMetodo("Efectivo")} />
              <SelectableCard icon="credit_card" text={tr("Tarjeta")} selected={metodo === "Tarjeta"} onClick={() => setMetodo("Tarjeta")} />
            </div>
          </Field>
          <TextArea
            label={tr("Notas (opcional)")}
            rows={2}
            maxLength={500}
            placeholder={tr("Ej: Llegan 4 personas, dejar 2 juegos de toallas extra.")}
            value={form.notas}
            onChange={(e) => setForm({ ...form, notas: e.target.value })}
          />
          <p className="aire-text-footnote rounded-aire-md bg-aire-surface-2 p-3 text-aire-ink-2">
            {propiedad.limpiadorNombre
              ? tr("Se la ofrecemos primero a {nombre}. Si no responde en {min} min, pasa a urgencia y avisamos a los trabajadores cercanos (con tarifa de urgencia).", {
                  nombre: propiedad.limpiadorNombre,
                  min: config.escalarTurnoMin,
                })
              : tr("No tienes limpiador habitual: se publica como urgencia y avisamos a los trabajadores cercanos (con tarifa de urgencia).")}
          </p>
          {error && <p className="aire-text-footnote text-center font-semibold text-aire-danger-text">{error}</p>}
          <Button icon="luggage" loading={enviando} disabled={!valido} onClick={enviar}>
            {tr("Pedir limpieza")}
          </Button>
        </div>
      )}
    </Sheet>
  );
}
