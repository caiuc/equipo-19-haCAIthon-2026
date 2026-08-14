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

const BASE =
  "inline-flex items-center justify-center gap-2 font-display font-bold transition-all disabled:pointer-events-none disabled:opacity-50";

/*
  El desplazamiento en hover simula que el objeto se levanta de la pagina: es la
  retroalimentacion tactil que pide el sistema de diseno.

  Las variantes con relieve lo declaran ellas mismas en vez de heredarlo de una
  base comun. Antes la base lo aplicaba a todas y `ghost` intentaba anularlo con
  shadow-none, pero la sombra igual aparecia: como `ghost` no tiene fondo ni
  borde, quedaba flotando una mancha amarilla sin boton adentro.
*/
const RAISED =
  "rounded-full border-2 shadow-pulse hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-pulse-lg active:translate-x-0 active:translate-y-0 active:shadow-pulse";

const VARIANT_STYLES: Record<ButtonVariant, string> = {
  primary: `${RAISED} bg-primary text-white border-ink`,
  secondary: `${RAISED} bg-surface text-ink border-ink`,
  // Sin relieve ni borde: es texto accionable, no una pieza fisica.
  ghost:
    "rounded-full bg-transparent text-ink-soft underline decoration-2 underline-offset-4 hover:text-ink hover:decoration-primary",
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
        BASE,
        VARIANT_STYLES[variant],
        SIZE_STYLES[size],
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
