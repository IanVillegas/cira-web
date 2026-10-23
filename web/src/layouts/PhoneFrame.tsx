import type { ReactNode } from "react";

/**
 * Envuelve cada pantalla en un "marco de teléfono" centrado: en desktop se ve
 * como una app móvil; en pantallas angostas ocupa todo el ancho disponible.
 */
export function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh w-full items-center justify-center bg-aire-ink sm:py-6">
      <div className="ca-root relative flex h-dvh w-full flex-col overflow-hidden sm:h-[860px] sm:max-h-[92dvh] sm:w-[420px] sm:rounded-[40px] sm:shadow-aire-float sm:ring-8 sm:ring-black">
        {children}
      </div>
    </div>
  );
}
