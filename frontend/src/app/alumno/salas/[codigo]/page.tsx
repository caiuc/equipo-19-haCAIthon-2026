"use client";

import { use, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import {
  fetchActivityPackage,
  listRoomActivities,
  listStudentRooms,
} from "@/lib/api";
import { ALUMNO_NAV } from "@/lib/nav";
import { listActivities, saveActivity, loadSession } from "@/offline/db";
import type { ActivitySummary, Room, StoredActivity } from "@/lib/types";

interface PageProps {
  params: Promise<{ codigo: string }>;
}

const TYPE_LABEL: Record<string, string> = {
  multiple_choice: "opción múltiple",
  numeric: "respuesta numérica",
  text: "respuesta escrita",
};

const MODE_LABEL: Record<string, string> = {
  live: "En vivo",
  homework: "Tarea",
  practice: "Práctica",
};

export default function SalaAlumnoPage({ params }: PageProps) {
  const { codigo } = use(params);

  const [token, setToken] = useState<string | null>(null);
  const [room, setRoom] = useState<Room | null>(null);
  const [activities, setActivities] = useState<ActivitySummary[]>([]);
  const [downloaded, setDownloaded] = useState<StoredActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    const session = await loadSession();
    const stored = session?.accessToken ?? null;
    setToken(stored);
    setDownloaded(await listActivities());

    if (!stored || stored === "demo") {
      setIsLoading(false);
      return;
    }

    try {
      const rooms = await listStudentRooms(stored);
      const found =
        rooms.find((r) => r.code === codigo.toUpperCase()) ?? null;
      setRoom(found);

      if (found) {
        setActivities(
          await listRoomActivities(stored, found.id, found.name).catch(() => []),
        );
      }
    } finally {
      setIsLoading(false);
    }
  }, [codigo]);

  useEffect(() => {
    void load();
  }, [load]);

  async function download(activityId: string) {
    if (!token) return;
    setBusy(activityId);
    try {
      const pkg = await fetchActivityPackage(token, activityId);
      await saveActivity(pkg);
      setDownloaded(await listActivities());
    } finally {
      setBusy(null);
    }
  }

  return (
    <AppShell nav={ALUMNO_NAV} role="Alumno">
      <main className="mx-auto flex w-full max-w-lg flex-col gap-6 px-4 py-8">
        <Link
          href="/alumno/salas"
          className="font-body text-sm text-muted underline underline-offset-4"
        >
          ← Mis salas
        </Link>

        {isLoading && <p className="text-muted">Cargando…</p>}

        {!isLoading && !room && (
          <Card className="text-center text-ink-soft">
            No estás en una sala con el código {codigo.toUpperCase()}.
          </Card>
        )}

        {room && (
          <>
            <div>
              <h1 className="font-display text-3xl font-extrabold">
                {room.name}
              </h1>
              <p className="text-sm text-muted">
                Código <span className="font-display font-bold">{room.code}</span>
              </p>
            </div>

            <h2 className="font-display text-xl font-extrabold">
              Tareas de esta sala ({activities.length})
            </h2>

            {activities.length === 0 && (
              <Card className="text-center text-ink-soft">
                Tu profe todavía no asignó tareas en esta sala.
              </Card>
            )}

            {activities.map((activity) => {
              const done = downloaded.some(
                (d) => d.activityId === activity.activityId,
              );

              return (
                <Card
                  key={activity.activityId}
                  featured={!done}
                  className="flex flex-col gap-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-display text-xl font-bold">
                        {activity.title}
                      </p>
                      <p className="text-sm text-muted">
                        {activity.exerciseCount} ejercicios ·{" "}
                        {TYPE_LABEL[activity.exerciseType] ??
                          activity.exerciseType}
                      </p>
                    </div>
                    <Badge tone={done ? "done" : "waiting"}>
                      {done ? "Descargada" : MODE_LABEL[activity.mode] ?? activity.mode}
                    </Badge>
                  </div>

                  {done ? (
                    <Link href="/alumno/practicar">
                      <Button variant="secondary" fullWidth>
                        Ir a resolverla
                      </Button>
                    </Link>
                  ) : (
                    <Button
                      fullWidth
                      disabled={busy !== null}
                      onClick={() => void download(activity.activityId)}
                    >
                      {busy === activity.activityId
                        ? "Descargando…"
                        : "Descargar para usar sin conexión"}
                    </Button>
                  )}
                </Card>
              );
            })}
          </>
        )}
      </main>
    </AppShell>
  );
}
