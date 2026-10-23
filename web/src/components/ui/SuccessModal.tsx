import type { ReactNode } from "react";
import { Button } from "./Button";
import { Icon } from "./Icon";

interface SuccessModalProps {
  open: boolean;
  title: string;
  message?: string;
  buttonLabel: string;
  onClose: () => void;
  children?: ReactNode;
}

/** Confirmación a pantalla del teléfono: check animado, título, detalle opcional y un botón. */
export function SuccessModal({ open, title, message, buttonLabel, onClose, children }: SuccessModalProps) {
  if (!open) return null;
  return (
    <div className="absolute inset-0 z-[3500] flex items-center justify-center bg-black/60 p-6">
      <div role="dialog" aria-label={title} className="w-full max-w-[340px] rounded-[26px] bg-cira-card p-6 text-center">
        <div className="mx-auto flex h-20 w-20 animate-[pop_0.35s_ease-out] items-center justify-center rounded-full bg-emerald-100">
          <Icon name="check_circle" filled size={52} className="text-emerald-600" />
        </div>
        <h3 className="mt-4 text-[21px] font-semibold text-cira-text-primary">{title}</h3>
        {message && <p className="mt-1 text-[14px] text-cira-text-secondary">{message}</p>}
        {children && <div className="mt-4 text-left">{children}</div>}
        <Button className="mt-5" onClick={onClose}>
          {buttonLabel}
        </Button>
      </div>
    </div>
  );
}
