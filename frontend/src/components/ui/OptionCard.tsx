"use client";

import { cn } from "@/lib/cn";

const OPTION_STATE = {
  IDLE: "idle",
  SELECTED: "selected",
  CORRECT: "correct",
  WRONG: "wrong",
} as const;

export type OptionState = (typeof OPTION_STATE)[keyof typeof OPTION_STATE];

const STATE_STYLES: Record<OptionState, string> = {
  idle: "border-ink bg-surface hover:bg-primary-soft/40",
  selected: "border-primary bg-primary-soft text-primary-deep",
  correct: "border-ink bg-success text-ink",
  wrong: "border-ink bg-danger/15 text-ink",
};

interface OptionCardProps {
  label: string;
  state?: OptionState;
  disabled?: boolean;
  onSelect: () => void;
}

export function OptionCard({
  label,
  state = "idle",
  disabled = false,
  onSelect,
}: OptionCardProps) {
  const isChosen = state === "selected" || state === "correct";

  return (
    <button
      type="button"
      role="radio"
      aria-checked={isChosen}
      disabled={disabled}
      onClick={onSelect}
      className={cn(
        "flex w-full items-center gap-4 rounded-xl border-2 p-4 text-left",
        "font-body text-base transition-colors",
        "disabled:cursor-not-allowed",
        STATE_STYLES[state],
      )}
    >
      <span
        className={cn(
          "grid size-5 shrink-0 place-items-center rounded-full border-2",
          isChosen ? "border-current" : "border-ink",
        )}
      >
        {isChosen && <span className="size-2.5 rounded-full bg-current" />}
      </span>
      {label}
    </button>
  );
}
