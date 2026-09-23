import type { HTMLAttributes, ReactNode } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function Card({ children, className = "", ...rest }: CardProps) {
  return (
    <div
      className={`rounded-cira-card bg-cira-card p-4 shadow-[0_8px_24px_-12px_rgba(25,28,30,0.18)] ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}
