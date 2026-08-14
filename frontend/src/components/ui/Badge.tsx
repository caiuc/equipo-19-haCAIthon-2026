import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

const BADGE_TONE = {
  LIVE: "live",
  WAITING: "waiting",
  CLOSED: "closed",
  DONE: "done",
  OFFLINE: "offline",
  PENDING: "pending",
} as const;

export type BadgeTone = (typeof BADGE_TONE)[keyof typeof BADGE_TONE];

const TONE_STYLES: Record<BadgeTone, string> = {
  live: "bg-success text-ink border-ink",
  waiting: "bg-surface-sunk text-ink-soft border-ink",
  closed: "bg-surface text-muted border-muted",
  done: "bg-primary-soft text-primary-deep border-ink",
  offline: "bg-ink text-cream border-ink",
  pending: "bg-pulse text-ink border-ink",
};

interface BadgeProps {
  tone?: BadgeTone;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function Badge({
  tone = "waiting",
  icon,
  children,
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border-2 px-3 py-1",
        "font-display text-xs font-bold tracking-wide",
        TONE_STYLES[tone],
        className,
      )}
    >
      {icon}
      {children}
    </span>
  );
}
