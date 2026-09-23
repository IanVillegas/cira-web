import type { ReactNode } from "react";

/**
 * Envuelve cada pantalla en un "marco de teléfono" centrado: en desktop se ve
 * como una app móvil (igual a cómo se vería CIRA en Android); en pantallas
 * angostas ocupa todo el ancho disponible.
 */
export function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh w-full items-center justify-center bg-cira-gray-950 sm:py-6">
      <div className="relative flex h-dvh w-full flex-col overflow-hidden bg-cira-base sm:h-[860px] sm:max-h-[92dvh] sm:w-[420px] sm:rounded-[36px] sm:shadow-2xl sm:ring-8 sm:ring-black/80">
        {children}
      </div>
    </div>
  );
}
