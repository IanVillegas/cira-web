import type { ReactNode } from "react";
import { Reveal } from "@/components/aire";
import { PhoneFrame } from "./PhoneFrame";

/**
 * Estructura común de Login / Registro / Recuperar / Sesión expirada:
 * isotipo arriba y una tarjeta blanca centrada sobre el fondo perla.
 */
export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <PhoneFrame>
      <div className="relative isolate flex min-h-0 flex-1 flex-col overflow-hidden bg-aire-accent-soft before:absolute before:inset-0 before:-z-10 before:bg-[url(/images/background.svg)] before:bg-cover before:opacity-[0.14] before:content-['']">
        <div className="no-scrollbar flex min-h-0 flex-1 flex-col overflow-y-auto px-5 py-8">
        <div className="flex h-[180px] shrink-0 items-end justify-center pb-6">
          <img src="/images/cira_isotipo_outline_blue.svg" alt="CIRA" className="h-28 w-28" />
        </div>

        <Reveal effect="up" className="mx-auto w-full max-w-[560px]">
          <div className="ca-card ca-pad--lg grid gap-5">{children}</div>
        </Reveal>

        <div className="min-h-6 flex-1" />
        </div>
      </div>
    </PhoneFrame>
  );
}

/** Título y subtítulo centrados. */
export function AuthHeading({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="grid gap-1.5 text-center">
      <h1 className="aire-text-title-1 text-aire-ink">{title}</h1>
      {subtitle && <p className="aire-text-subhead text-aire-ink-2">{subtitle}</p>}
    </div>
  );
}

/** Chip con el teléfono o correo elegido. */
export function IdentifierChip({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-aire-md bg-aire-surface-2 px-4 py-2.5 text-center">
      <span className="aire-text-headline block truncate text-aire-ink">{children}</span>
    </div>
  );
}

export function AuthError({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <p role="alert" className="aire-text-footnote text-center font-semibold text-aire-danger-text">
      {message}
    </p>
  );
}
