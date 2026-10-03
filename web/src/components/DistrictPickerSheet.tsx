import { useMemo, useState } from "react";
import { Icon } from "./ui/Icon";
import { DISTRITOS, type Distrito } from "@/lib/districts";

interface DistrictPickerSheetProps {
  open: boolean;
  onClose: () => void;
  onSelect: (distrito: Distrito) => void;
}

/** Hoja inferior con buscador (réplica del DistrictPickerOverlay del registro). */
export function DistrictPickerSheet({ open, onClose, onSelect }: DistrictPickerSheetProps) {
  const [query, setQuery] = useState("");

  const lista = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return DISTRITOS;
    return DISTRITOS.filter((d) =>
      `${d.nombre} ${d.canton} ${d.provincia}`.toLowerCase().includes(q),
    );
  }, [query]);

  if (!open) return null;

  return (
    <div className="absolute inset-0 z-[2000] flex items-end bg-black/40" onClick={onClose}>
      <div
        className="m-4 w-full rounded-[28px] bg-cira-base p-5 pt-[18px]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-2">
          <div>
            <h2 className="text-[21px] font-bold text-cira-text-primary">Selecciona distrito</h2>
            <p className="text-[13px] text-cira-text-secondary">Se centrará el mapa en esa zona.</p>
          </div>
          <button onClick={onClose} aria-label="Cerrar" className="flex h-10 w-10 items-center justify-center text-cira-text-primary">
            <Icon name="close" size={24} />
          </button>
        </div>

        <div className="my-3.5 h-px bg-cira-border" />

        <div className="flex min-h-14 items-center gap-2 rounded-cira-input bg-cira-input-bg px-3.5">
          <Icon name="search" size={20} className="text-cira-text-secondary" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar"
            className="min-h-12 w-full bg-transparent text-cira-control focus:outline-none placeholder:text-cira-text-helper"
          />
        </div>

        <div className="no-scrollbar mt-3 max-h-[300px] overflow-y-auto">
          {lista.map((d) => (
            <button
              key={d.id}
              onClick={() => {
                onSelect(d);
                setQuery("");
              }}
              className="my-1 flex w-full items-center justify-between gap-3 rounded-cira-input bg-cira-surface-muted px-3.5 py-3 text-left"
            >
              <div>
                <p className="text-[15px] font-bold text-cira-text-primary">{d.nombre}</p>
                <p className="text-xs text-cira-text-secondary">
                  {d.canton}, {d.provincia}
                </p>
              </div>
              <Icon name="location_on" size={22} className="text-cira-accent" />
            </button>
          ))}
          {lista.length === 0 && (
            <p className="py-6 text-center text-sm text-cira-text-secondary">Sin resultados.</p>
          )}
        </div>
      </div>
    </div>
  );
}
