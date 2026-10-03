import { useNavigate } from "react-router-dom";
import { Icon } from "./Icon";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: string;
  showBack?: boolean;
  onIconClick?: () => void;
  /** Padding del encabezado (por defecto 20,24,20,12 como CiraPageHeader). */
  className?: string;
}

export function PageHeader({ title, subtitle, icon, showBack = false, onIconClick, className = "px-5 pt-6 pb-3" }: PageHeaderProps) {
  const navigate = useNavigate();

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {showBack && (
        <button
          onClick={() => navigate(-1)}
          className="text-cira-header-text"
          aria-label="Volver"
        >
          <Icon name="chevron_backward" size={28} />
        </button>
      )}

      <div className="min-w-0 flex-1">
        <h1 className="truncate text-cira-title font-semibold text-cira-header-text">
          {title}
        </h1>
        {subtitle && (
          <p className="truncate text-sm text-cira-header-text-muted">{subtitle}</p>
        )}
      </div>

      {icon && (
        <button
          onClick={onIconClick}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-cira-header-icon-bg text-cira-header-text"
        >
          <Icon name={icon} size={24} />
        </button>
      )}
    </div>
  );
}
