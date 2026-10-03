import { Icon } from "./Icon";

interface SelectableCardProps {
  icon: string;
  text: string;
  selected: boolean;
  onClick: () => void;
}

/** Réplica de CiraSelectableCard: 76 px de alto, radio 14, ícono 21 + etiqueta 10 semibold. */
export function SelectableCard({ icon, text, selected, onClick }: SelectableCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`flex h-[76px] flex-col items-center justify-center gap-1 rounded-[14px] border bg-cira-card p-2.5 transition-colors ${
        selected ? "border-cira-accent" : "border-transparent"
      }`}
    >
      <Icon name={icon} size={21} className="text-cira-accent" />
      <span className="text-[10px] font-semibold text-cira-text-primary">{text}</span>
    </button>
  );
}
