import { useState } from "react";
import { Button, Icon, Sheet, TextArea, cx } from "@/components/aire";
import { formatoColones } from "@/lib/format";
import { tr } from "@/lib/i18n";
import type { Trabajo } from "@/lib/types";

interface PostularTruequeSheetProps {
  trabajo: Trabajo | null;
  onClose: () => void;
  /** propuesta vacía = acepta lo ofrecido. */
  onPostular: (id: string, propuesta?: string) => Promise<unknown>;
}

/** Postularse a un trueque: aceptar lo que se ofrece o proponer otra cosa a cambio (contraoferta). */
export function PostularTruequeSheet({ trabajo, onClose, onPostular }: PostularTruequeSheetProps) {
  const [modo, setModo] = useState<"acepto" | "propongo">("acepto");
  const [propuesta, setPropuesta] = useState("");
  const [enviando, setEnviando] = useState(false);

  const cerrar = () => {
    setModo("acepto");
    setPropuesta("");
    onClose();
  };

  const enviar = async () => {
    if (!trabajo) return;
    setEnviando(true);
    try {
      await onPostular(trabajo.id, modo === "propongo" ? propuesta.trim() : undefined);
      cerrar();
    } finally {
      setEnviando(false);
    }
  };

  const t = trabajo?.trueque;
  return (
    <Sheet open={trabajo !== null} onClose={cerrar} title={tr("Postularme al trueque")} subtitle={trabajo?.titulo} contained>
      {trabajo && t && (
        <div className="grid gap-3">
          <Opcion activa={modo === "acepto"} icon="handshake" titulo={tr("Acepto lo que ofrece")} onClick={() => setModo("acepto")}>
            {t.ofrece}
            {trabajo.pago > 0 && ` + ${formatoColones.format(trabajo.pago)}`}
          </Opcion>
          <Opcion activa={modo === "propongo"} icon="swap_horiz" titulo={tr("Propongo otra cosa")} onClick={() => setModo("propongo")}>
            {tr("Pide un servicio distinto a cambio de tu trabajo.")}
          </Opcion>
          {modo === "propongo" && (
            <TextArea
              label={tr("¿Qué te gustaría a cambio?")}
              rows={2}
              maxLength={300}
              placeholder={tr("Ej: Cambiarme 2 tomacorrientes del taller")}
              value={propuesta}
              onChange={(e) => setPropuesta(e.target.value)}
            />
          )}
          <p className="aire-text-footnote text-aire-ink-2">
            {tr("Si te elige, los dos firman el acuerdo en la app antes de empezar.")}
          </p>
          <Button icon="send" loading={enviando} disabled={modo === "propongo" && !propuesta.trim()} onClick={enviar}>
            {tr("Postularme")}
          </Button>
        </div>
      )}
    </Sheet>
  );
}

function Opcion({
  activa,
  icon,
  titulo,
  onClick,
  children,
}: {
  activa: boolean;
  icon: string;
  titulo: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={activa}
      onClick={onClick}
      className={cx(
        "flex items-start gap-3 rounded-aire-md p-3.5 text-left transition-transform duration-[100ms] ease-aire-pop active:scale-[0.98]",
        activa ? "bg-aire-accent-soft shadow-[inset_0_0_0_1.5px_var(--aire-accent)]" : "bg-aire-surface-2",
      )}
    >
      <Icon name={icon} filled={activa} size={22} className={activa ? "text-aire-accent-text" : "text-aire-ink-2"} />
      <span className="grid gap-0.5">
        <span className={cx("aire-text-headline", activa ? "text-aire-accent-text" : "text-aire-ink")}>{titulo}</span>
        <span className="aire-text-footnote text-aire-ink-2">{children}</span>
      </span>
    </button>
  );
}
