import { Icon } from "./Icon";

interface EmptyStateProps {
  icon: string;
  title: string;
  message: string;
}

export function EmptyState({ icon, title, message }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-cira-card bg-cira-surface-muted px-6 py-10 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-cira-header-icon-bg">
        <Icon name={icon} size={32} className="text-cira-accent" />
      </div>
      <div>
        <p className="font-semibold text-cira-text-primary">{title}</p>
        <p className="mt-1 text-sm text-cira-text-secondary">{message}</p>
      </div>
    </div>
  );
}
