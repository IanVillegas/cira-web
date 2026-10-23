import { cx } from "./cx";
import { Icon } from "./Icon";

export interface SelectableCardProps {
  icon: string;
  text: string;
  selected: boolean;
  onClick: () => void;
}

/** Opción en tarjeta (servicios, categorías): al elegirla aparece un check con rebote. */
export function SelectableCard({ icon, text, selected, onClick }: SelectableCardProps) {
  return (
    <button type="button" aria-pressed={selected} onClick={onClick} className={cx("ca-select", selected && "is-selected")}>
      <span className="ca-select__check" aria-hidden="true">
        <Icon name="check" size={14} />
      </span>
      <Icon name={icon} size={24} filled={selected} className="ca-select__icon" />
      <span className="ca-select__text">{text}</span>
    </button>
  );
}
