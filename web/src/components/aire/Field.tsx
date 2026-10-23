import type { ReactNode } from "react";

/** Etiqueta de campo en mayúsculas (11px, 600). */
export function FieldCaption({ children }: { children: ReactNode }) {
  return <span className="ca-caption">{children}</span>;
}

/** Campo con etiqueta arriba y ayuda opcional debajo. */
export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <div className="ca-field">
      <FieldCaption>{label}</FieldCaption>
      {children}
      {hint && <span className="ca-field__hint">{hint}</span>}
    </div>
  );
}
