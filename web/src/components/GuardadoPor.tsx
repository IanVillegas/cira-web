import { Icon } from "@/components/aire";
import { tr } from "@/lib/i18n";

/** "Guardado por 3 clientes": solo el número de personas que lo tienen De confianza, nunca quiénes. */
export function GuardadoPor({ n }: { n: number }) {
  return (
    <span className="aire-text-footnote inline-flex items-center gap-1 text-aire-ink-2">
      <Icon name="favorite" filled size={16} className="text-aire-accent-text" />
      {n === 1 ? tr("Guardado por 1 cliente") : tr("Guardado por {n} clientes", { n })}
    </span>
  );
}
