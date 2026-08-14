import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

const STAT_TONE = {
  PRIMARY: "primary",
  PULSE: "pulse",
  PLAIN: "plain",
} as const;

export type StatTone = (typeof STAT_TONE)[keyof typeof STAT_TONE];

const TONE_STYLES: Record<StatTone, string> = {
  primary: "bg-primary text-white",
  pulse: "bg-pulse text-ink",
  plain: "bg-surface text-ink",
};

interface StatCardProps {
  label: string;
  value: ReactNode;
  tone?: StatTone;
  footer?: ReactNode;
  className?: string;
}

export function StatCard({
  label,
  value,
  tone = "plain",
  footer,
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-2 rounded-card border-2 border-ink p-6 shadow-pulse",
        tone === "pulse" && "shadow-ink",
        TONE_STYLES[tone],
        className,
      )}
    >
      <span className="font-display text-xs font-bold tracking-widest uppercase opacity-80">
        {label}
      </span>
      <span className="font-display text-4xl font-extrabold tabular-nums">
        {value}
      </span>
      {footer}
    </div>
  );
}
