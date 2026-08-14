"use client";

import { use, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";
import { listRooms } from "@/lib/api";
import { useSession } from "@/offline/useSession";
import type { Room } from "@/lib/types";

interface PageProps {
  params: Promise<{ codigo: string }>;
}

export default function SalaProfesorPage({ params }: PageProps) {
  // En Next 16 `params` es una promesa incluso en componentes cliente.
  const { codigo } = use(params);

  const { session, isLoading } = useSession();
  const [room, setRoom] = useState<Room | null>(null);
  const [notFound, setNotFound] = useState(false);

  const token = session?.accessToken ?? null;

  const load = useCallback(async () => {
    if (!token) return;

    // TODO(P3): usar GET /rooms/{id} cuando exista. Hoy se filtra del listado.
    const rooms = await listRooms(token);
    const found = rooms.find((r) => r.code === codigo.toUpperCase()) ?? null;

    setRoom(found);
    setNotFound(found === null);
  }, [token, codigo]);

  useEffect(() => {
    void load();
  }, [load]);

  if (isLoading) return <main className="p-8 text-muted">Cargando…</main>;

  if (notFound) {
    return (
      <main className="mx-auto flex max-w-md flex-1 flex-col justify-center gap-4 px-4 text-center">
        <h1 className="font-display text-2xl font-extrabold">Sala no encontrada</h1>
        <p className="text-ink-soft">
          No existe una sala con el código {codigo.toUpperCase()} entre las tuyas.
        </p>
        <Link href="/profesor">
          <Button fullWidth>Volver al panel</Button>
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-8">
      <header className="flex items-center justify-between gap-4">
        <Link href="/profesor" className="font-body text-sm text-muted underline underline-offset-4">
          ← Mis salas
        </Link>
        {room && <Badge tone="live">{room.status}</Badge>}
      </header>

      {/* El codigo se proyecta al curso: tiene que leerse desde el fondo del aula. */}
      <section className="flex flex-col items-center gap-3 rounded-card border-2 border-ink bg-surface p-8 shadow-pulse">
        <h1 className="font-display text-2xl font-extrabold">{room?.name}</h1>
        <p className="font-display text-xs font-bold tracking-widest text-muted uppercase">
          Código para tus alumnos
        </p>
        <p className="font-display text-6xl font-extrabold tracking-[0.15em] tabular-nums sm:text-8xl">
          {room?.code}
        </p>
        <p className="text-center text-ink-soft">
          Que lo escriban en <strong>eduflow</strong> → Unirme a una clase.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <StatCard tone="plain" label="Alumnos" value="—" />
        <StatCard tone="plain" label="Actividades" value="—" />
        <StatCard tone="plain" label="Promedio" value="—" />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-display text-2xl font-extrabold">Resultados</h2>

        {/*
          Los endpoints de actividades y resultados todavia no existen. Se
          declara explicitamente en pantalla en vez de inventar datos: un
          resultado falso frente al jurado es peor que un espacio vacio.
        */}
        <Card className="flex flex-col gap-3 border-dashed">
          <p className="font-display text-lg font-bold">Todavía sin datos</p>
          <p className="text-ink-soft">
            Esta tabla se llena cuando el backend exponga{" "}
            <code className="rounded bg-surface-sunk px-1.5 py-0.5 text-sm">
              GET /activities/{"{id}"}/results
            </code>{" "}
            y{" "}
            <code className="rounded bg-surface-sunk px-1.5 py-0.5 text-sm">
              GET /rooms/{"{id}"}/students
            </code>
            .
          </p>
          <p className="text-sm text-muted">
            Las respuestas que los alumnos resuelvan sin conexión aparecen acá
            cuando sincronicen.
          </p>
        </Card>
      </section>
    </main>
  );
}
