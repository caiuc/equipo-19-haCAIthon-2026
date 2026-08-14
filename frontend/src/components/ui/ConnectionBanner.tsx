"use client";

import { Badge } from "./Badge";
import { cn } from "@/lib/cn";

interface ConnectionBannerProps {
  isOnline: boolean;
  /** Respuestas guardadas localmente que todavía no llegaron al servidor. */
  pendingCount: number;
  className?: string;
}

/**
 * Estado de conexión y de la cola de sincronización.
 *
 * No estaba en los mocks, pero sin esto la historia HU-6 no se puede mostrar:
 * la alumna necesita ver que sus respuestas quedaron guardadas y que se van a
 * enviar solas. Sin esta señal, trabajar sin conexión se siente como perder
 * el trabajo.
 */
export function ConnectionBanner({
  isOnline,
  pendingCount,
  className,
}: ConnectionBannerProps) {
  const hasPending = pendingCount > 0;

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <Badge tone={isOnline ? "live" : "offline"}>
        <span
          className={cn(
            "size-2 rounded-full",
            isOnline ? "bg-ink" : "bg-cream",
          )}
        />
        {isOnline ? "Con conexión" : "Sin conexión"}
      </Badge>

      {hasPending && (
        <Badge tone="pending">
          {pendingCount} {pendingCount === 1 ? "pendiente" : "pendientes"} de
          enviar
        </Badge>
      )}

      {!hasPending && isOnline && (
        <span className="font-body text-sm text-muted">Todo sincronizado</span>
      )}
    </div>
  );
}
