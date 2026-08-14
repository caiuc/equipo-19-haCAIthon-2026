"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ConnectionBanner } from "@/components/ui/ConnectionBanner";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { listActivities, listAnswersForActivity, loadSession } from "@/offline/db";
import { useSync } from "@/offline/useSync";
import type { StoredActivity } from "@/lib/types";
import { ExerciseRunner } from "./ExerciseRunner";

interface ActivityProgress {
  answered: number;
  total: number;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  return `${Math.round(bytes / 1024)} KB`;
}

/**
 * Superficie offline del alumno.
 *
 * Es una unica pagina cliente a proposito: sin conexion, navegar entre rutas
 * del App Router exigiria que el Service Worker cachee los payloads RSC, que es
 * fragil. Aca todo sale de IndexedDB y no se pide nada al servidor.
 */
export default function PracticarPage() {
  const [token, setToken] = useState<string | null>(null);
  const [activities, setActivities] = useState<StoredActivity[]>([]);
  const [progress, setProgress] = useState<Record<string, ActivityProgress>>({});
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const { isOnline, pendingCount, wasSimulated, refreshPending } = useSync(token);

  const load = useCallback(async () => {
    const stored = await listActivities();
    setActivities(stored);

    const entries = await Promise.all(
      stored.map(async (activity) => {
        const answers = await listAnswersForActivity(activity.activityId);
        return [
          activity.activityId,
          { answered: answers.length, total: activity.exercises.length },
        ] as const;
      }),
    );

    setProgress(Object.fromEntries(entries));
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    // La sesion se lee de local, sin validar contra Supabase: sin conexion esa
    // validacion fallaria y mandaria a la alumna al login justo cuando mas
    // necesita entrar.
    async function boot() {
      const session = await loadSession();
      setToken(session?.accessToken ?? null);
      await load();
    }

    void boot();
  }, [load]);

  const active = activities.find((a) => a.activityId === activeId) ?? null;

  async function handleAnswered() {
    await refreshPending();
    await load();
  }

  return (
    <main className="mx-auto flex w-full max-w-lg flex-col gap-6 px-4 py-8">
      <header className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-4">
          <Link
            href="/alumno"
            className="font-display text-xl font-extrabold text-ink"
          >
            EduFlow
          </Link>
          <Link
            href="/alumno"
            className="font-body text-sm text-muted underline underline-offset-4"
          >
            Mis clases
          </Link>
        </div>

        <ConnectionBanner isOnline={isOnline} pendingCount={pendingCount} />

        {wasSimulated && (
          <p className="rounded-xl border-2 border-dashed border-muted p-3 text-sm text-muted">
            Sincronización simulada: el endpoint <code>/answers/bulk</code>{" "}
            todavía no existe en el backend.
          </p>
        )}
      </header>

      {active ? (
        <ExerciseRunner
          activity={active}
          onAnswered={() => void handleAnswered()}
          onExit={() => {
            setActiveId(null);
            void load();
          }}
        />
      ) : (
        <section className="flex flex-col gap-4">
          <div>
            <h1 className="font-display text-3xl font-extrabold">Mis tareas</h1>
            <p className="text-ink-soft">
              Descargadas en este dispositivo. Funcionan sin conexión.
            </p>
          </div>

          {!isLoaded && <p className="text-muted">Cargando…</p>}

          {isLoaded && activities.length === 0 && (
            <Card className="flex flex-col gap-4 text-center">
              <p className="font-display text-lg font-bold">
                Todavía no descargaste ninguna tarea
              </p>
              <p className="text-ink-soft">
                Andá a tus clases y tocá &laquo;Descargar&raquo; mientras tengas
                señal. Después la podés resolver sin internet.
              </p>
              <Link href="/alumno">
                <Button fullWidth>Ir a mis clases</Button>
              </Link>
            </Card>
          )}

          {activities.map((activity) => {
            const stats = progress[activity.activityId];
            const answered = stats?.answered ?? 0;
            const total = stats?.total ?? activity.exercises.length;
            const isDone = answered >= total;

            return (
              <Card
                key={activity.activityId}
                featured={!isDone}
                className="flex flex-col gap-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-display text-xl font-bold">
                      {activity.title}
                    </p>
                    <p className="text-sm text-muted">{activity.roomName}</p>
                  </div>
                  <Badge tone={isDone ? "done" : "offline"}>
                    {isDone ? "Completada" : "Sin conexión ✓"}
                  </Badge>
                </div>

                <ProgressBar
                  value={total === 0 ? 0 : Math.round((answered / total) * 100)}
                  label={`${answered} de ${total} respondidas`}
                />

                <div className="flex items-center justify-between gap-4">
                  <span className="font-body text-xs text-muted tabular-nums">
                    {formatSize(activity.sizeBytes)} en tu dispositivo
                  </span>
                  <Button onClick={() => setActiveId(activity.activityId)}>
                    {answered === 0
                      ? "Empezar"
                      : isDone
                        ? "Ver resultado"
                        : "Seguir"}
                  </Button>
                </div>
              </Card>
            );
          })}
        </section>
      )}
    </main>
  );
}
