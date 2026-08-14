import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Añade la sombra desplazada. Reservado para lo destacado o activo. */
  featured?: boolean;
}

export function Card({
  featured = false,
  className,
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        "rounded-card border-2 border-ink bg-surface p-6",
        featured && "shadow-pulse",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
