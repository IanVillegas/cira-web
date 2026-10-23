import type { ReactNode } from "react";

export interface EmptyStateProps {
  title: string;
  message?: string;
  /** URL de la ilustración (en CIRA: `/images/empty_*.svg`). */
  image?: string;
  imageSize?: number;
  /** Acción opcional, normalmente un <Button>. */
  action?: ReactNode;
}

/** Estado vacío: ilustración que flota suave, título y mensaje que aparecen escalonados. */
export function EmptyState({ title, message, image, imageSize = 160, action }: EmptyStateProps) {
  return (
    <div className="ca-empty">
      {image && <img src={image} alt="" aria-hidden="true" width={imageSize} height={imageSize} className="ca-empty__img" />}
      <p className="ca-empty__title">{title}</p>
      {message && <p className="ca-empty__msg">{message}</p>}
      {action && <div className="ca-empty__action">{action}</div>}
    </div>
  );
}
