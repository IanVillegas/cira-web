import { Children, isValidElement, type CSSProperties, type ReactNode } from "react";
import { cx } from "./cx";
import { useInView } from "./motion";

export interface RevealProps {
  children: ReactNode;
  /** Retardo en ms antes de aparecer. */
  delay?: number;
  /** "up" (por defecto): sube 16px y se desenfoca → nítido; "scale": crece desde 0.96; "fade": solo opacidad. */
  effect?: "up" | "scale" | "fade";
  className?: string;
}

/** Aparece la primera vez que entra en pantalla. */
export function Reveal({ children, delay = 0, effect = "up", className }: RevealProps) {
  const [ref, inView] = useInView<HTMLDivElement>();
  return (
    <div ref={ref} className={cx("ca-reveal", `ca-reveal--${effect}`, inView && "is-in", className)} style={{ "--ca-delay": `${delay}ms` } as CSSProperties}>
      {children}
    </div>
  );
}

export interface StaggerProps {
  children: ReactNode;
  /** Separación entre elementos (ms). Por defecto, el token `stagger` (45ms). */
  step?: number;
  effect?: RevealProps["effect"];
  className?: string;
}

/** Lista que aparece en cascada: cada hijo entra un poco después del anterior. */
export function Stagger({ children, step = 45, effect = "up", className }: StaggerProps) {
  const [ref, inView] = useInView<HTMLDivElement>();
  let i = 0;
  return (
    <div ref={ref} className={cx("ca-stagger", inView && "is-in", className)}>
      {Children.map(children, (child) =>
        isValidElement(child) ? (
          <div className={cx("ca-reveal", `ca-reveal--${effect}`)} style={{ "--ca-delay": `${i++ * step}ms` } as CSSProperties}>
            {child}
          </div>
        ) : (
          child
        ),
      )}
    </div>
  );
}
