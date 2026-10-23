import type { HTMLAttributes, ReactNode } from "react";
import { cx } from "./cx";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Reacciona al toque: se hunde al presionar y se eleva en hover. */
  interactive?: boolean;
  /** Superficie interna (`surface-2`) en vez de tarjeta. */
  inset?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
  children: ReactNode;
}

/** Tarjeta blanca de radio 22, casi plana; la elevación aparece al interactuar. */
export function Card({ interactive = false, inset = false, padding = "md", className, children, ...rest }: CardProps) {
  return (
    <div
      className={cx("ca-card", inset && "ca-card--inset", interactive && "ca-card--interactive", `ca-pad--${padding}`, className)}
      tabIndex={interactive && rest.onClick ? 0 : undefined}
      {...rest}
    >
      {children}
    </div>
  );
}
