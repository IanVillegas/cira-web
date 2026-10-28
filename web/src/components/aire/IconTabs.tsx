import { cx } from "./cx";
import { Icon } from "./Icon";

export interface IconTabItem {
  value: string;
  label: string;
  /** Ícono de Material Symbols. */
  icon: string;
}

export interface IconTabsProps {
  items: IconTabItem[];
  value: string;
  onChange: (value: string) => void;
  /** Nombre accesible del grupo. */
  label?: string;
}

/**
 * Secciones con ícono: una fila de círculos con su nombre debajo, repartida a lo ancho
 * (sin scroll). La sección activa se rellena con el tono del acento.
 */
export function IconTabs({ items, value, onChange, label = "Secciones" }: IconTabsProps) {
  return (
    <nav className="ca-icontabs" aria-label={label} style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}>
      {items.map((item) => {
        const activo = item.value === value;
        return (
          <button
            key={item.value}
            type="button"
            className={cx("ca-icontab", activo && "is-active")}
            aria-current={activo ? "page" : undefined}
            onClick={() => !activo && onChange(item.value)}
          >
            <span className="ca-icontab__circle">
              <Icon name={item.icon} size={26} filled={activo} />
            </span>
            <span className="ca-icontab__label">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
