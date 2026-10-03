export type EmptyStateImage =
  | "empty_no_data_variant"
  | "empty_no_messages"
  | "empty_no_signal"
  | "empty_not_found_variant"
  | "empty_map_connection";

interface EmptyStateProps {
  title: string;
  message?: string;
  image?: EmptyStateImage;
  /** Tamaño de la ilustración (190 por defecto, como CiraEmptyState). */
  imageSize?: number;
}

/** Réplica de CiraEmptyState: ilustración SVG + título semibold 18 + mensaje 14, centrados. */
export function EmptyState({
  title,
  message,
  image = "empty_no_data_variant",
  imageSize = 190,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-3 px-8 py-6 text-center">
      <img
        src={`/images/${image}.svg`}
        alt=""
        aria-hidden="true"
        style={{ width: imageSize, height: imageSize }}
        className="object-contain"
      />
      <div className="flex flex-col gap-1">
        <p className="text-lg font-semibold text-cira-text-primary">{title}</p>
        {message && <p className="text-cira-body text-cira-text-secondary">{message}</p>}
      </div>
    </div>
  );
}
