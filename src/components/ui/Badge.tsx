import type { ReactNode } from "react";

const toneClasses = {
  accent: "bg-cira-secondary text-cira-accent",
  success: "bg-emerald-100 text-emerald-700",
  warning: "bg-amber-100 text-amber-700",
  danger: "bg-cira-btn-destructive-bg text-cira-btn-destructive-text",
  neutral: "bg-cira-surface-disabled text-cira-text-secondary",
} as const;

interface BadgeProps {
  children: ReactNode;
  tone?: keyof typeof toneClasses;
}

export function Badge({ children, tone = "accent" }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-cira-badge px-3 py-1 text-xs font-semibold tracking-wide uppercase ${toneClasses[tone]}`}
    >
      {children}
    </span>
  );
}
