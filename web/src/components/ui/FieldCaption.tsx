import type { ReactNode } from "react";

/** Etiqueta de campo de los formularios MAUI: 11 px, semibold, espaciado 1.5, en mayúsculas. */
export function FieldCaption({ children }: { children: ReactNode }) {
  return (
    <span className="text-[11px] font-semibold tracking-[0.14em] text-cira-text-secondary uppercase">
      {children}
    </span>
  );
}

/** Campo con etiqueta arriba (VerticalStackLayout Spacing=8). */
export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <FieldCaption>{label}</FieldCaption>
      {children}
    </div>
  );
}
