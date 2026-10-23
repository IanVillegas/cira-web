import type { ReactNode } from "react";
import { cx } from "./cx";

export type BadgeTone = "accent" | "success" | "warning" | "danger" | "neutral";

export interface BadgeProps {
  tone?: BadgeTone;
  /** Punto de estado a la izquierda; con `pulse` late suavemente (estado en vivo). */
  dot?: boolean;
  pulse?: boolean;
  children: ReactNode;
}

/** Insignia de estado en píldora suave. */
export function Badge({ tone = "accent", dot = false, pulse = false, children }: BadgeProps) {
  return (
    <span className={cx("ca-badge", `ca-badge--${tone}`)}>
      {dot && <i className={cx("ca-badge__dot", pulse && "is-pulse")} aria-hidden="true" />}
      {children}
    </span>
  );
}
