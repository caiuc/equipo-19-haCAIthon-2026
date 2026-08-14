import type { NavItem } from "@/components/AppShell";

export const ALUMNO_NAV: ReadonlyArray<NavItem> = [
  { href: "/alumno", label: "Inicio" },
  { href: "/alumno/salas", label: "Mis salas" },
  { href: "/alumno/practicar", label: "Mis tareas" },
];

export const PROFESOR_NAV: ReadonlyArray<NavItem> = [
  { href: "/profesor", label: "Mis salas" },
];
