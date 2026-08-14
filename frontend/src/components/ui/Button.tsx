import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

const BUTTON_VARIANT = {
  PRIMARY: "primary",
  SECONDARY: "secondary",
  GHOST: "ghost",
} as const;

export type ButtonVariant =
  (typeof BUTTON_VARIANT)[keyof typeof BUTTON_VARIANT];

const BUTTON_SIZE = {
  MD: "md",
  LG: "lg",
} as const;

export type ButtonSize = (typeof BUTTON_SIZE)[keyof typeof BUTTON_SIZE];

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  icon?: ReactNode;
}

const VARIANT_STYLES: Record<ButtonVariant, string> = {
  primary: "bg-primary text-white border-ink shadow-pulse",
  secondary: "bg-surface text-ink border-ink",
  ghost: "bg-transparent text-ink border-transparent shadow-none",
};

const SIZE_STYLES: Record<ButtonSize, string> = {
  md: "h-12 px-6 text-sm",
  lg: "h-15 px-8 text-base",
};

export function Button({
  variant = "primary",
  size = "md",
  fullWidth = false,
  icon,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        // El desplazamiento en hover simula que el objeto se levanta de la
        // página: es la "retroalimentación táctil" que pide el sistema.
        "inline-flex items-center justify-center gap-2 rounded-full border-2",
        "font-display font-bold transition-all",
        "hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-pulse-lg",
        "active:translate-x-0 active:translate-y-0 active:shadow-pulse",
        "disabled:pointer-events-none disabled:opacity-50",
        VARIANT_STYLES[variant],
        SIZE_STYLES[size],
        variant === "ghost" && "hover:shadow-none hover:translate-0",
        fullWidth && "w-full",
        className,
      )}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
}
