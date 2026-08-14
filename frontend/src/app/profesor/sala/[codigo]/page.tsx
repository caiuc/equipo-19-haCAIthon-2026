"use client";

import { use, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { CreateActivityForm } from "./CreateActivityForm";
import { PROFESOR_NAV } from "@/lib/nav";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { StatCard } from "@/components/ui/StatCard";
import {
  getActivityResults,
  listRoomActivities,
  listRooms,
  listRoomStudents,
  type ActivityResults,
  type RoomStudent,
} from "@/lib/api";
import { useSession } from "@/offline/useSession";
import type { ActivitySummary, Room } from "@/lib/types";

interface PageProps {
  params: Promise<{ codigo: string }>;
}

const MODE_LABEL: Record<string, string> = {
  live: "En vivo",
  homework: "Tarea",
  practice: "Práctica",
};

export default function SalaProfesorPage({ params }: PageProps) {
  // En Next 16 `params` es una promesa incluso en componentes cliente.
  const { codigo } = use(params);

  const { session, isLoading } = useSession();
  const [room, setRoom] = useState<Room | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [students, setStudents] = useState<RoomStudent[]>([]);
  const [activities, setActivities] = useState<ActivitySummary[]>([]);
  const [results, setResults] = useState<Record<string, ActivityResults>>({});
  const [isCreating, setIsCreating] = useState(false);
  const [openActivity, setOpenActivity] = useState<string | null>(null);

  const token = session?.accessToken ?? null;

  const load = useCallback(async () => {
    if (!token) return;

    // TODO(P3): usar GET /rooms/{id} cuando exista. Hoy se filtra del listado.
    const rooms = await listRooms(token);
    const found = rooms.find((r) => r.code === codigo.toUpperCase()) ?? null;

    setRoom(found);
    setNotFound(found === null);
    if (!found) return;

    // Cada bloque falla por su cuenta: que no haya alumnos todavia no deberia
    // impedir ver las actividades, ni al reves.
    const [roster, list] = await Promise.all([
      listRoomStudents(token, found.id).catch(() => []),
      listRoomActivities(token, found.id, found.name).catch(() => []),
    ]);

    setStudents(roster);
    setActivities(list);

    const entries = await Promise.all(
      list.map(async (activity) => {
        try {
          return [
            activity.activityId,
            await getActivityResults(token, activity.activityId),
          ] as const;
        } catch {
          return null;
        }
      }),
    );

    setResults(Object.fromEntries(entries.filter((e) => e !== null)));
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

  const totalAnswers = Object.values(results).flatMap((r) => r.results);
  const totalCorrect = totalAnswers.reduce((sum, r) => sum + r.correct, 0);
  const totalAnswered = totalAnswers.reduce((sum, r) => sum + r.answered, 0);
  const average =
    totalAnswered === 0 ? null : Math.round((totalCorrect / totalAnswered) * 100);

  return (
    <AppShell nav={PROFESOR_NAV} role="Profesor">
      <main className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-8">
      <header className="flex items-center justify-between gap-4">
        <Link
          href="/profesor"
          className="font-body text-sm text-muted underline underline-offset-4"
        >
          ← Mis salas
        </Link>
        <div className="flex items-center gap-3">
          {room && <Badge tone="live">{room.status}</Badge>}
          <Button variant="ghost" onClick={() => void load()}>
            Actualizar
          </Button>
        </div>
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
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <StatCard tone="primary" label="Alumnos" value={students.length} />
        <StatCard tone="pulse" label="Actividades" value={activities.length} />
        <StatCard
          tone="plain"
          label="Promedio"
          value={average === null ? "—" : `${average}%`}
          footer={
            average !== null ? <ProgressBar value={average} /> : undefined
          }
        />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-display text-2xl font-extrabold">
          Alumnos ({students.length})
        </h2>

        {students.length === 0 ? (
          <Card className="text-center text-ink-soft">
            Todavía no se unió nadie. Comparte el código{" "}
            <strong className="font-display">{room?.code}</strong>.
          </Card>
        ) : (
          <Card className="flex flex-col divide-y-2 divide-surface-sunk p-0">
            {students.map((student) => (
              <div
                key={student.studentId}
                className="flex items-center justify-between gap-4 px-6 py-4"
              >
                <span className="font-display font-bold">{student.name}</span>
                <span className="font-body text-xs text-muted">
                  {new Date(student.joinedAt).toLocaleDateString("es-CL")}
                </span>
              </div>
            ))}
          </Card>
        )}
      </section>

      <section className="flex flex-col gap-3">
        <Button
          size="lg"
          fullWidth
          onClick={() => setIsCreating((v) => !v)}
        >
          {isCreating ? "Cerrar" : "+ Nueva actividad"}
        </Button>

        {isCreating && token && room && (
          <CreateActivityForm
            token={token}
            roomId={room.id}
            onCreated={() => {
              setIsCreating(false);
              void load();
            }}
          />
        )}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-display text-2xl font-extrabold">
          Actividades ({activities.length})
        </h2>

        {activities.length === 0 && (
          <Card className="text-center text-ink-soft">
            Todavía no creaste actividades en esta sala.
          </Card>
        )}

        {activities.map((activity) => {
          const result = results[activity.activityId];
          const rows = result?.results ?? [];
          const respondieron = rows.length;

          return (
            <Card key={activity.activityId} className="flex flex-col gap-4">
              <button
                type="button"
                aria-expanded={openActivity === activity.activityId}
                onClick={() =>
                  setOpenActivity((current) =>
                    current === activity.activityId ? null : activity.activityId,
                  )
                }
                className="flex w-full items-start justify-between gap-3 text-left"
              >
                <div>
                  <p className="font-display text-xl font-bold">
                    {activity.title}
                  </p>
                  <p className="text-sm text-muted">
                    {activity.exerciseCount} ejercicios · {activity.difficulty} ·{" "}
                    {respondieron} {respondieron === 1 ? "respuesta" : "respuestas"}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Badge tone={activity.mode === "live" ? "live" : "done"}>
                    {MODE_LABEL[activity.mode] ?? activity.mode}
                  </Badge>
                  <span className="font-display text-lg text-muted">
                    {openActivity === activity.activityId ? "−" : "+"}
                  </span>
                </div>
              </button>

              {openActivity !== activity.activityId ? null : respondieron === 0 ? (
                <p className="text-sm text-muted">
                  Nadie respondió todavía. Las respuestas resueltas sin conexión
                  aparecen acá cuando el alumno recupera la señal.
                </p>
              ) : (
                <div className="flex flex-col gap-3">
                  <p className="font-display text-sm font-bold">
                    {respondieron} de {students.length || respondieron}{" "}
                    respondieron
                  </p>

                  {rows.map((row) => {
                    const student = students.find(
                      (s) => s.studentId === row.studentId,
                    );
                    const percent =
                      row.answered === 0
                        ? 0
                        : Math.round((row.correct / row.answered) * 100);

                    return (
                      <div
                        key={row.studentId}
                        className="flex flex-col gap-1 rounded-xl border-2 border-ink p-3"
                      >
                        <div className="flex items-baseline justify-between gap-3">
                          <span className="font-display text-sm font-bold">
                            {student?.name ?? "Alumno"}
                          </span>
                          <span className="font-body text-xs text-muted tabular-nums">
                            {row.correct}/{row.answered} correctas
                          </span>
                        </div>
                        <ProgressBar value={percent} />
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          );
        })}
      </section>
      </main>
    </AppShell>
  );
}
