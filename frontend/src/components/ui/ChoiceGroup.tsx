"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface Choice<T extends string> {
  value: T;
  label: string;
  icon?: ReactNode;
  dotClassName?: string;
}

interface ChoiceGroupProps<T extends string> {
  legend: string;
  choices: ReadonlyArray<Choice<T>>;
  value: T;
  onChange: (value: T) => void;
  /** `row` para formatos de ejercicio, `column` para niveles de dificultad. */
  direction?: "row" | "column";
}

export function ChoiceGroup<T extends string>({
  legend,
  choices,
  value,
  onChange,
  direction = "column",
}: ChoiceGroupProps<T>) {
  return (
    <fieldset>
      <legend className="mb-3 font-display text-lg font-bold text-ink">
        {legend}
      </legend>

      <div
        role="radiogroup"
        aria-label={legend}
        className={cn(
          "flex gap-3",
          direction === "column" ? "flex-col" : "flex-wrap",
        )}
      >
        {choices.map((choice) => {
          const isSelected = choice.value === value;

          return (
            <button
              key={choice.value}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => onChange(choice.value)}
              className={cn(
                "flex items-center gap-3 rounded-xl border-2 px-4 py-3",
                "font-display text-sm font-bold transition-all",
                direction === "row" && "flex-1 flex-col justify-center gap-2 py-5",
                isSelected
                  ? "border-ink bg-primary-soft text-primary-deep shadow-pulse"
                  : "border-ink bg-surface text-ink hover:bg-surface-sunk",
              )}
            >
              {choice.icon}
              <span className={direction === "column" ? "flex-1 text-left" : ""}>
                {choice.label}
              </span>
              {choice.dotClassName && (
                <span className={cn("size-3 rounded-full", choice.dotClassName)} />
              )}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
