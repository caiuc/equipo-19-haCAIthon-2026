import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export function Input({
  label,
  error,
  hint,
  id,
  className,
  ...props
}: InputProps) {
  const inputId = id ?? props.name;
  const errorId = inputId ? `${inputId}-error` : undefined;
  const hintId = inputId ? `${inputId}-hint` : undefined;

  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label
          htmlFor={inputId}
          className="font-display text-sm font-bold text-ink"
        >
          {label}
        </label>
      )}

      {hint && (
        <p id={hintId} className="text-sm text-muted">
          {hint}
        </p>
      )}

      <input
        id={inputId}
        aria-invalid={Boolean(error)}
        aria-describedby={
          [error ? errorId : null, hint ? hintId : null]
            .filter(Boolean)
            .join(" ") || undefined
        }
        className={cn(
          // En foco aparece la sombra amarilla: el campo "se activa" en vez
          // de cambiar de color, que es la señal del sistema.
          "h-15 rounded-full border-2 border-ink bg-surface px-6",
          "font-body text-base text-ink placeholder:text-muted",
          "transition-shadow focus:shadow-pulse focus:outline-none",
          error && "border-danger",
          className,
        )}
        {...props}
      />

      {error && (
        <p id={errorId} role="alert" className="text-sm font-medium text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
