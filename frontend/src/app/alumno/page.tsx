"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { ALUMNO_NAV } from "@/lib/nav";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ConnectionBanner } from "@/components/ui/ConnectionBanner";
import { Input } from "@/components/ui/Input";
import {
  fetchActivityPackage,
  joinRoom,
  listActivitiesForStudent,
} from "@/lib/api";
import { SEED_ACTIVITIES } from "@/lib/seed";
import { listActivities, saveActivity, saveSession, loadSession } from "@/offline/db";
import { useSync } from "@/offline/useSync";
import type { ActivitySummary, StoredActivity } from "@/lib/types";

/*
  Tareas de respaldo, generadas en el cliente. Se muestran solo cuando el backend
  no devuelve ninguna actividad real, para que la pantalla nunca quede vacia.
  Van marcadas como demostracion: presentarlas como tareas del profesor seria
  mentirle a quien esta probando la aplicacion.
*/
const SEED_TASKS: ActivitySummary[] = [
  {
    activityId: SEED_ACTIVITIES.MULTIPLE_CHOICE,
    title: "Tabla de multiplicar",
    subject: "Matemáticas",
    exerciseType: "multiple_choice",
    difficulty: "medium",
    mode: "homework",
    exerciseCount: 10,
    roomName: "2°B — Álgebra",
  },
  {
    activityId: SEED_ACTIVITIES.NUMERIC,
    title: "Multiplicación — escribe el resultado",
    subject: "Matemáticas",
    exerciseType: "numeric",
    difficulty: "medium",
    mode: "homework",
    exerciseCount: 10,
    roomName: "2°B — Álgebra",
  },
];

const TYPE_LABEL: Record<string, string> = {
  multiple_choice: "opción múltiple",
  numeric: "respuesta numérica",
  text: "respuesta escrita",
};

export default function AlumnoPage() {
  const [token, setToken] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState("Alumno");
  const [code, setCode] = useState("");
  const [downloaded, setDownloaded] = useState<StoredActivity[]>([]);
  const [remote, setRemote] = useState<ActivitySummary[] | null>(null);
  const [isDownloading, setIsDownloading] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isJoining, setIsJoining] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);

  const { isOnline, pendingCount } = useSync(token);

  const refresh = useCallback(async () => {
    setDownloaded(await listActivities());
  }, []);

  useEffect(() => {
    async function boot() {
      const session = await loadSession();
      const stored = session?.accessToken ?? null;
      setToken(stored);
      if (session?.name) setDisplayName(session.name);
      await refresh();

      // "demo" es la sesion local que se crea al descargar sin haber entrado:
      // no sirve para pedirle nada al backend.
      if (!stored || stored === "demo") {
        setRemote([]);
        return;
      }

      try {
        setRemote(await listActivitiesForStudent(stored));
      } catch {
        // Sin conexion, sesion vencida o sin salas: se cae al respaldo local.
        setRemote([]);
      }
    }

    void boot();
  }, [refresh]);

  const isLoading = remote === null;
  const usingSeed = !isLoading && remote.length === 0;
  const tasks = usingSeed ? SEED_TASKS : (remote ?? []);

  function isDownloaded(activityId: string): boolean {
    return downloaded.some((a) => a.activityId === activityId);
  }

  async function join() {
    if (!token || token === "demo") {
      setJoinError("Entra con tu cuenta antes de unirte a una sala.");
      return;
    }

    setJoinError(null);
    setIsJoining(true);

    try {
      await joinRoom(token, code, displayName);
      setCode("");
      // Recien unido: la sala ya tiene sus actividades disponibles.
      setRemote(await listActivitiesForStudent(token));
    } catch {
      setJoinError("No encontramos una sala con ese código.");
    } finally {
      setIsJoining(false);
    }
  }

  async function download(activityId: string) {
    setIsDownloading(activityId);
    setMessage(null);

    try {
      if (!token) {
        await saveSession({
          accessToken: "demo",
          userId: "demo",
          name: "Camila",
          role: "student",
        });
        setToken("demo");
      }

      const pkg = await fetchActivityPackage(token ?? "demo", activityId);
      const stored = await saveActivity(pkg);

      setMessage(
        `Listo — ${Math.round(stored.sizeBytes / 1024)} KB. Ya puedes resolverla sin conexión.`,
      );
      await refresh();
    } finally {
      setIsDownloading(null);
    }
  }

  return (
    <AppShell nav={ALUMNO_NAV} role="Alumno">
      <main className="mx-auto flex w-full max-w-lg flex-col gap-6 px-4 py-8">
        <ConnectionBanner isOnline={isOnline} pendingCount={pendingCount} />

      <section className="flex flex-col gap-3">
        <h1 className="font-display text-3xl font-extrabold">Unirme a una clase</h1>
        <Card className="flex flex-col gap-4">
          <Input
            name="codigo"
            label="Código de la sala"
            placeholder="Ej: K7M2PQ"
            hint="Son 6 caracteres, te lo da tu profe."
            value={code}
            maxLength={6}
            onChange={(event) => setCode(event.target.value.toUpperCase())}
          />
          {joinError && (
            <p role="alert" className="text-sm font-medium text-danger">
              {joinError}
            </p>
          )}

          <Button
            fullWidth
            disabled={code.length !== 6 || isJoining}
            onClick={() => void join()}
          >
            {isJoining ? "Uniéndote…" : "Unirme"}
          </Button>
        </Card>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-display text-2xl font-extrabold">Tareas asignadas</h2>

        {isLoading && <p className="text-muted">Buscando tus tareas…</p>}

        {usingSeed && (
          <p className="rounded-xl border-2 border-dashed border-muted p-3 text-sm text-muted">
            Estas son tareas de demostración generadas en tu dispositivo. Únete a
            una sala para ver las que asignó tu profesor.
          </p>
        )}

        {tasks.map((task) => {
          const done = isDownloaded(task.activityId);

          return (
            <Card
              key={task.activityId}
              featured={!done}
              className="flex flex-col gap-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-display text-xl font-bold">{task.title}</p>
                  <p className="text-sm text-muted">
                    {task.roomName} · {task.exerciseCount} ejercicios ·{" "}
                    {TYPE_LABEL[task.exerciseType] ?? task.exerciseType}
                  </p>
                </div>
                <Badge tone={done ? "done" : "waiting"}>
                  {done ? "Descargada" : "Tarea"}
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
                  size="lg"
                  disabled={isDownloading !== null}
                  onClick={() => void download(task.activityId)}
                >
                  {isDownloading === task.activityId
                    ? "Descargando…"
                    : "Descargar para usar sin conexión"}
                </Button>
              )}
            </Card>
          );
        })}

        {message && (
          <p className="font-display text-sm font-bold text-primary-deep">
            {message}
          </p>
        )}
      </section>
      </main>
    </AppShell>
  );
}
