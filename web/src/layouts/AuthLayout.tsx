import type { ReactNode } from "react";
import { PhoneFrame } from "./PhoneFrame";

/**
 * Fondo y estructura comunes de Login / Registro / Recuperar / Sesión expirada,
 * igual que el MAUI original: fondo #EAF1FF con background.svg al 32 % de
 * opacidad, isotipo azul de 128 px arriba y una tarjeta blanca de 360 px
 * centrada (máx. 560).
 */
export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <PhoneFrame>
      <div className="relative flex-1 overflow-hidden bg-[#EAF1FF]">
        <img
          src="/images/background.svg"
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-[0.14]"
        />

        <div className="no-scrollbar relative flex h-full flex-col overflow-y-auto px-6 py-8">
          <div className="flex h-[220px] shrink-0 items-end justify-center pb-[18px]">
            <img
              src="/images/cira_isotipo_outline_blue.svg"
              alt="CIRA"
              className="h-32 w-32"
            />
          </div>

          <div className="mx-auto w-full max-w-[560px] rounded-cira-card bg-cira-card p-6 shadow-[0_8px_24px_-12px_rgba(25,28,30,0.18)]">
            {children}
          </div>

          <div className="min-h-6 flex-1" />
        </div>
      </div>
    </PhoneFrame>
  );
}

/** Título 26 bold + subtítulo 14, centrados (como en MAUI). */
export function AuthHeading({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="space-y-1.5 text-center">
      <h1 className="text-[26px] font-bold text-cira-text-primary">{title}</h1>
      {subtitle && <p className="text-cira-body text-cira-text-secondary">{subtitle}</p>}
    </div>
  );
}

/** Chip gris con el teléfono/correo seleccionado (CiraSurfaceMuted, radio 18). */
export function IdentifierChip({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-cira-nav-item bg-cira-surface-muted px-3.5 py-2.5 text-center text-cira-body font-bold text-cira-text-primary">
      <span className="block truncate">{children}</span>
    </div>
  );
}

export function AuthError({ message }: { message: string | null }) {
  if (!message) return null;
  return <p className="text-center text-[13px] text-cira-accent">{message}</p>;
}
