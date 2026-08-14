import { cn } from "@/lib/cn";

interface ProgressBarProps {
  /** Porcentaje 0-100. Se recorta al rango para tolerar datos sucios. */
  value: number;
  label?: string;
  className?: string;
}

export function ProgressBar({ value, label, className }: ProgressBarProps) {
  const safeValue = Math.min(100, Math.max(0, value));

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label && (
        <div className="flex items-baseline justify-between font-display text-sm font-bold">
          <span>{label}</span>
          <span className="tabular-nums">{safeValue}%</span>
        </div>
      )}

      <div
        role="progressbar"
        aria-valuenow={safeValue}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
        className="h-4 overflow-hidden rounded-full border-2 border-ink bg-surface"
      >
        {/* El relleno no lleva esquinas redondeadas: solo el contenedor. */}
        <div
          className="h-full bg-success transition-[width] duration-500"
          style={{ width: `${safeValue}%` }}
        />
      </div>
    </div>
  );
}
