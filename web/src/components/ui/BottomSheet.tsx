import type { ReactNode } from "react";

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
}

/** Hoja modal pegada abajo, dentro del marco del teléfono. */
export function BottomSheet({ open, onClose, title, subtitle, children }: BottomSheetProps) {
  if (!open) return null;
  return (
    <div className="absolute inset-0 z-[3000] flex items-end bg-black/55" onClick={onClose}>
      <div
        role="dialog"
        aria-label={title}
        className="no-scrollbar max-h-full w-full overflow-y-auto rounded-t-[26px] bg-cira-card p-5 pb-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-[20px] font-semibold text-cira-text-primary">{title}</h3>
        {subtitle && <p className="mt-1 text-[13px] text-cira-text-secondary">{subtitle}</p>}
        <div className="mt-4 flex flex-col gap-3.5">{children}</div>
      </div>
    </div>
  );
}
