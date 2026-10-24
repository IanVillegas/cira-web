import { Card, Icon } from "@/components/aire";
import { fechaTrabajo } from "@/lib/fechas";
import { formatoColones } from "@/lib/format";
import { tr } from "@/lib/i18n";
import type { Trabajo } from "@/lib/types";

/**
 * Acuerdo digital de un trueque: quién hace qué y cuándo, más el diferencial. Lo ven las dos
 * partes; el publicador lo firma al elegir y el trabajador lo acepta en Mis trabajos.
 */
export function AcuerdoTrueque({ trabajo, rol }: { trabajo: Trabajo; rol: "publicador" | "trabajador" }) {
  const t = trabajo.trueque;
  if (!t) return null;
  const trabajador = rol === "trabajador" ? tr("Tú") : (trabajo.trabajadorNombre ?? tr("Trabajador"));
  const publicador = rol === "publicador" ? tr("Tú") : trabajo.publicador;
  const primeraLista = t.etapa !== "en_curso";
  const segundaLista = t.etapa === "finalizado";

  return (
    <Card inset padding="sm" className="grid gap-2.5">
      <p className="aire-text-eyebrow flex items-center gap-1.5 text-aire-ink-2">
        <Icon name="handshake" size={16} />
        {tr("Acuerdo de trueque")}
      </p>
      <Parte hecha={primeraLista} quien={trabajador} que={trabajo.titulo} cuando={fechaTrabajo(trabajo.fecha)} />
      <Parte hecha={segundaLista} quien={publicador} que={t.acordado ?? t.ofrece} cuando={tr("A coordinar por el chat")} />
      {trabajo.pago > 0 && (
        <p className="aire-text-footnote flex items-center gap-2 text-aire-ink-2">
          <Icon name="payments" size={16} className="shrink-0" />
          {tr("Más {monto} de diferencial ({metodo}), al finalizar.", {
            monto: formatoColones.format(trabajo.pago),
            metodo: tr(trabajo.metodoPago).toLowerCase(),
          })}
        </p>
      )}
    </Card>
  );
}

function Parte({ hecha, quien, que, cuando }: { hecha: boolean; quien: string; que: string; cuando: string }) {
  return (
    <div className="flex items-start gap-2.5">
      <Icon
        name={hecha ? "check_circle" : "radio_button_unchecked"}
        filled={hecha}
        size={20}
        className={`mt-px shrink-0 ${hecha ? "text-aire-success-text" : "text-aire-ink-2"}`}
      />
      <div className="min-w-0">
        <p className="aire-text-subhead text-aire-ink">
          <span className="font-semibold">{quien}:</span> {que}
        </p>
        <p className="aire-text-footnote text-aire-ink-2">{cuando}</p>
      </div>
    </div>
  );
}
