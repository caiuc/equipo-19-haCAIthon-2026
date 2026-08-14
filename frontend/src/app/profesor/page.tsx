"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { PROFESOR_NAV } from "@/lib/nav";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { StatCard } from "@/components/ui/StatCard";
import { ApiError, createRoom, listRooms, listRoomStudents } from "@/lib/api";
import { useSession } from "@/offline/useSession";
import type { Room } from "@/lib/types";

export default function ProfesorPage() {
  const router = useRouter();
  const { session, isLoading, signOut } = useSession();

  const [rooms, setRooms] = useState<Room[]>([]);
  const [totalStudents, setTotalStudents] = useState(0);
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const token = session?.accessToken ?? null;

  const refresh = useCallback(async () => {
    if (!token) return;
    try {
      const mine = await listRooms(token);
      setRooms(mine);

      // Total de alumnos del profesor, sumando el padron de cada sala.
      const counts = await Promise.all(
        mine.map((room) =>
          listRoomStudents(token, room.id)
            .then((s) => s.length)
            .catch(() => 0),
        ),
      );
      setTotalStudents(counts.reduce((a, b) => a + b, 0));
    } catch (caught: unknown) {
      setError(
        caught instanceof ApiError && caught.status === 401
          ? "Tu sesión venció. Vuelve a entrar."
          : "No se pudieron cargar tus salas.",
      );
    }
  }, [token]);

  useEffect(() => {
    if (!isLoading && !session) router.replace("/login");
  }, [isLoading, session, router]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!token) return;

    setError(null);
    setIsCreating(true);

    try {
      await createRoom(token, name);
      setName("");
      await refresh();
    } catch (caught: unknown) {
      setError(
        caught instanceof ApiError && caught.status === 403
          ? "Tu cuenta no tiene rol de profesor."
          : "No se pudo crear la sala.",
      );
    } finally {
      setIsCreating(false);
    }
  }

  if (isLoading) {
    return <main className="p-8 text-muted">Cargando…</main>;
  }

  return (
    <AppShell nav={PROFESOR_NAV} role="Profesor">
      <main className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-8">
      <header className="flex items-center justify-between gap-4">
        <div>
          <span className="font-display text-xl font-extrabold">EduFlow</span>
          <p className="text-sm text-muted">Panel del profesor</p>
        </div>
        <Button
          variant="ghost"
          onClick={() => {
            void signOut().then(() => router.replace("/login"));
          }}
        >
          Salir
        </Button>
      </header>

      <section className="grid gap-4 sm:grid-cols-2">
        <StatCard tone="primary" label="Salas activas" value={rooms.length} />
        <StatCard tone="pulse" label="Alumnos" value={totalStudents} />
      </section>

      <section className="flex flex-col gap-3">
        <h1 className="font-display text-3xl font-extrabold">Crear una sala</h1>
        <Card className="flex flex-col gap-4">
          <form onSubmit={submit} className="flex flex-col gap-4">
            <Input
              name="nombre"
              label="Nombre de la sala"
              placeholder="2°B — Álgebra"
              required
              minLength={3}
              maxLength={60}
              value={name}
              onChange={(event) => setName(event.target.value)}
              error={error ?? undefined}
            />
            <Button type="submit" disabled={isCreating || name.length < 3}>
              {isCreating ? "Creando…" : "Crear sala"}
            </Button>
          </form>
        </Card>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-display text-2xl font-extrabold">Mis salas</h2>

        {rooms.length === 0 && (
          <Card className="text-center text-ink-soft">
            Todavía no creaste ninguna sala.
          </Card>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          {rooms.map((room) => (
            <Card key={room.id} featured className="flex flex-col gap-4">
              <div className="flex items-start justify-between gap-3">
                <p className="font-display text-xl font-bold">{room.name}</p>
                <Badge tone={room.status === "active" ? "live" : "waiting"}>
                  {room.status}
                </Badge>
              </div>

              <div className="flex flex-col gap-1">
                <span className="font-display text-xs font-bold tracking-widest text-muted uppercase">
                  Código
                </span>
                <span className="font-display text-3xl font-extrabold tracking-[0.2em] tabular-nums">
                  {room.code}
                </span>
              </div>

              <Link href={`/profesor/sala/${room.code}`}>
                <Button variant="secondary" fullWidth>
                  Abrir sala
                </Button>
              </Link>
            </Card>
          ))}
        </div>
      </section>
      </main>
    </AppShell>
  );
}
