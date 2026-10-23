import { Icon } from "./Icon";

export interface FabProps {
  icon: string;
  /** Etiqueta accesible (obligatoria: el botón no tiene texto). */
  label: string;
  onClick: () => void;
}

/** Botón de acción flotante (adición a CIRA Aire): círculo de 56px con el color de acción; se hunde al presionar. */
export function Fab({ icon, label, onClick }: FabProps) {
  return (
    <button type="button" className="ca-fab" aria-label={label} onClick={onClick}>
      <Icon name={icon} size={30} />
    </button>
  );
}
