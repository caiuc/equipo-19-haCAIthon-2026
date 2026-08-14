"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/brand/Logo";
import { cn } from "@/lib/cn";

export interface NavItem {
  href: string;
  label: string;
}

interface AppShellProps {
  nav: ReadonlyArray<NavItem>;
  role: string;
  aside?: ReactNode;
  children: ReactNode;
}

/**
 * Marco de la aplicacion: barra lateral en escritorio, barra inferior en movil.
 *
 * En el celular la navegacion va abajo y no arriba: es donde llega el pulgar, y
 * el celular es el dispositivo donde la alumna resuelve la tarea.
 */
export function AppShell({ nav, role, aside, children }: AppShellProps) {
  const pathname = usePathname();

  /*
    Se marca solo la coincidencia MAS LARGA.

    Con `startsWith` a secas, "/alumno" tambien coincidia con "/alumno/salas" y
    quedaban dos items encendidos a la vez: Inicio nunca se apagaba.
  */
  const activeHref = nav
    .filter(
      (item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
    )
    .reduce<string | null>(
      (best, item) =>
        best === null || item.href.length > best.length ? item.href : best,
      null,
    );

  function isActive(href: string): boolean {
    return activeHref === href;
  }

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      {/* Barra lateral, solo escritorio */}
      <aside className="hidden w-64 shrink-0 flex-col gap-8 border-r-2 border-ink bg-surface px-5 py-8 md:flex">
        <Link href="/" className="rounded-card">
          <Logo size="md" tagline={role} />
        </Link>

        <nav className="flex flex-col gap-2">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive(item.href) ? "page" : undefined}
              className={cn(
                "rounded-full border-2 px-4 py-2.5 font-display text-sm font-bold transition-all",
                isActive(item.href)
                  ? "border-ink bg-primary text-white shadow-pulse"
                  : "border-transparent text-ink-soft hover:bg-surface-sunk",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {aside && <div className="mt-auto">{aside}</div>}
      </aside>

      {/* Cabecera compacta, solo movil */}
      <header className="flex items-center justify-between gap-4 border-b-2 border-ink bg-surface px-4 py-3 md:hidden">
        <Link href="/" className="rounded-card">
          <Logo size="sm" />
        </Link>
        <span className="font-body text-xs text-muted uppercase">{role}</span>
      </header>

      {/* pb-24 en movil deja aire para la barra inferior fija */}
      <div className="flex-1 pb-24 md:pb-0">{children}</div>

      <nav className="fixed inset-x-0 bottom-0 z-10 flex border-t-2 border-ink bg-surface md:hidden">
        {nav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive(item.href) ? "page" : undefined}
            className={cn(
              "flex-1 px-2 py-4 text-center font-display text-xs font-bold",
              isActive(item.href)
                ? "bg-primary text-white"
                : "text-ink-soft",
            )}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
