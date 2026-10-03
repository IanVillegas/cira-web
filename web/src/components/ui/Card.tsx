import type { HTMLAttributes, ReactNode } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function Card({ children, className = "", ...rest }: CardProps) {
  return (
    <div
      className={`rounded-cira-card bg-cira-card p-4 ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}
