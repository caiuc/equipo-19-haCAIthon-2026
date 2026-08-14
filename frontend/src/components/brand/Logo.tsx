import { cn } from "@/lib/cn";

/*
  Marca EduFlow.

  El simbolo esta redibujado a partir de `mocks/landing_plus_logo/logo.svg`:
  un monitor con birrete y una flecha de progreso. El original es una
  vectorizacion (paths de ~16 KB, stroke de 0.25 para tapar el antialiasing y
  el wordmark convertido a curvas), asi que se rehizo con los tokens del
  sistema para que pese nada, herede el color desde CSS y el nombre siga
  siendo texto de verdad en Outfit.

  El archivo original vive en `public/logo.svg` con los colores normalizados:
  se usa donde hace falta un archivo suelto (Open Graph, compartir, prensa).
*/

type LogoSize = "sm" | "md" | "lg";

const MARK_SIZE: Record<LogoSize, string> = {
  sm: "size-8",
  md: "size-10",
  lg: "size-16",
};

const WORDMARK_SIZE: Record<LogoSize, string> = {
  sm: "text-lg",
  md: "text-2xl",
  lg: "text-4xl",
};

interface LogoMarkProps {
  size?: LogoSize;
  className?: string;
  /** Cuando el wordmark acompaña al simbolo, este pasa a ser decorativo. */
  decorative?: boolean;
}

/** Solo el simbolo, sin el nombre. Para espacios estrechos. */
export function LogoMark({
  size = "md",
  className,
  decorative = false,
}: LogoMarkProps) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      role={decorative ? undefined : "img"}
      aria-hidden={decorative || undefined}
      aria-label={decorative ? undefined : "EduFlow"}
      className={cn(MARK_SIZE[size], "shrink-0", className)}
    >
      {/*
        Orden de pintado, de atras hacia adelante. El cuello arranca en y=36
        para que el trazo del monitor (que termina en 36.75) lo tape entero: si
        empieza antes, asoma un guion amarillo dentro de la pantalla.
      */}
      <path
        d="M20.5 36h7v5h-7z"
        className="fill-pulse stroke-ink"
        strokeWidth={2.5}
        strokeLinejoin="round"
      />
      <rect
        x="12.5"
        y="39.5"
        width="23"
        height="5.5"
        rx="2.75"
        className="fill-pulse stroke-ink"
        strokeWidth={2.5}
      />

      {/* Pantalla */}
      <rect
        x="3.5"
        y="11.5"
        width="41"
        height="24"
        rx="6"
        className="fill-primary stroke-ink"
        strokeWidth={2.5}
      />

      {/* Flecha de progreso: es el "flow" del nombre. */}
      <path
        d="M11 30c4.5-.5 7-4 9.5-6.5 2-2 3.5-3 5.5-4"
        className="stroke-pulse"
        strokeWidth={3.5}
        strokeLinecap="round"
      />
      <path
        d="M32 14 29.5 22.9 23.2 16.5z"
        className="fill-pulse stroke-pulse"
        strokeWidth={2}
        strokeLinejoin="round"
      />

      {/* Birrete: monta sobre la esquina superior izquierda del monitor. */}
      <path
        d="M14 2.5 2.5 7.5 14 12.5l11.5-5z"
        className="fill-pulse stroke-ink"
        strokeWidth={2.5}
        strokeLinejoin="round"
      />
      <path
        d="M7 10v3.5c0 1.9 3.1 3.5 7 3.5s7-1.6 7-3.5V10"
        className="fill-pulse stroke-ink"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

interface LogoProps {
  size?: LogoSize;
  /** Bajada bajo el nombre: el rol o el contexto de la pantalla. */
  tagline?: string;
  className?: string;
}

/** Simbolo + nombre. El nombre es texto, no curvas: se lee y se selecciona. */
export function Logo({ size = "md", tagline, className }: LogoProps) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <LogoMark size={size} decorative />

      <span className="flex flex-col leading-none">
        <span
          className={cn(
            "font-display font-extrabold tracking-tight",
            WORDMARK_SIZE[size],
          )}
        >
          EduFlow
        </span>

        {tagline && (
          <span className="mt-1 font-body text-xs tracking-wide text-muted uppercase">
            {tagline}
          </span>
        )}
      </span>
    </span>
  );
}
