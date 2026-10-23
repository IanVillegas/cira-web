import { useMemo, useState } from "react";
import { Icon, Input, Sheet } from "@/components/aire";
import { DISTRITOS, type Distrito } from "@/lib/districts";
import { tr } from "@/lib/i18n";

interface DistrictPickerSheetProps {
  open: boolean;
  onClose: () => void;
  onSelect: (distrito: Distrito) => void;
}

/** Hoja inferior con buscador para elegir el distrito. */
export function DistrictPickerSheet({ open, onClose, onSelect }: DistrictPickerSheetProps) {
  const [query, setQuery] = useState("");

  const lista = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return DISTRITOS;
    return DISTRITOS.filter((d) => `${d.nombre} ${d.canton} ${d.provincia}`.toLowerCase().includes(q));
  }, [query]);

  return (
    <Sheet open={open} onClose={onClose} title={tr("Selecciona distrito")} subtitle={tr("Se centrará el mapa en esa zona.")} contained>
      <div className="grid gap-3">
        <Input icon="search" placeholder={tr("Buscar")} value={query} onChange={(e) => setQuery(e.target.value)} />
        <div className="no-scrollbar grid max-h-[300px] gap-1.5 overflow-y-auto">
          {lista.map((d) => (
            <button
              key={d.id}
              type="button"
              onClick={() => {
                onSelect(d);
                setQuery("");
              }}
              className="flex min-h-14 items-center justify-between gap-3 rounded-aire-md bg-aire-surface-2 px-4 py-2.5 text-left transition-transform duration-[100ms] ease-aire-pop active:scale-[0.98]"
            >
              <span>
                <span className="aire-text-headline block text-aire-ink">{d.nombre}</span>
                <span className="aire-text-footnote block text-aire-ink-2">
                  {d.canton}, {d.provincia}
                </span>
              </span>
              <Icon name="location_on" size={22} className="text-aire-accent-text" />
            </button>
          ))}
          {lista.length === 0 && <p className="aire-text-subhead py-6 text-center text-aire-ink-2">{tr("Sin resultados.")}</p>}
        </div>
      </div>
    </Sheet>
  );
}
