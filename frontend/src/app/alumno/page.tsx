"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ConnectionBanner } from "@/components/ui/ConnectionBanner";
import { Input } from "@/components/ui/Input";
import { fetchActivityPackage } from "@/lib/api";
import { SEED_ACTIVITIES } from "@/lib/seed";
import { listActivities, saveActivity, saveSession, loadSession } from "@/offline/db";
import { useSync } from "@/offline/useSync";
import type { StoredActivity } from "@/lib/types";

// Catalogo temporal de tareas disponibles. Cuando el backend exponga las
// actividades de la sala, esta lista sale de la API.
const DEMO_ACTIVITIES = [
  {
    id: SEED_ACTIVITIES.MULTIPLE_CHOICE,
    title: "Tabla de multiplicar",
    detail: "2°B — Álgebra · 10 ejercicios · opción múltiple",
  },
  {
    id: SEED_ACTIVITIES.NUMERIC,
    title: "Multiplicación — escribí el resultado",
    detail: "2°B — Álgebra · 10 ejercicios · respuesta numérica",
  },
] as const;

export default function AlumnoPage() {
  const [token, setToken] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [downloaded, setDownloaded] = useState<StoredActivity[]>([]);
  const [isDownloading, setIsDownloading] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const { isOnline, pendingCount } = useSync(token);

  const refresh = useCallback(async () => {
    setDownloaded(await listActivities());
  }, []);

  useEffect(() => {
    async function boot() {
      const session = await loadSession();
      setToken(session?.accessToken ?? null);
      await refresh();
    }
    void boot();
  }, [refresh]);

  function isDownloaded(activityId: string): boolean {
    return downloaded.some((a) => a.activityId === activityId);
  }

  async function download(activityId: string) {
    setIsDownloading(activityId);
    setMessage(null);

    try {
      // Si no hay sesion todavia, se guarda una local para que la pantalla
      // offline tenga con que sincronizar despues.
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
        `Listo — ${Math.round(stored.sizeBytes / 1024)} KB. Ya podés resolverla sin conexión.`,
      );
      await refresh();
    } finally {
      setIsDownloading(null);
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-lg flex-col gap-6 px-4 py-8">
      <header className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-4">
          <span className="font-display text-xl font-extrabold">EduFlow</span>
          <Link
            href="/alumno/practicar"
            className="font-body text-sm text-muted underline underline-offset-4"
          >
            Mis tareas
          </Link>
        </div>
        <ConnectionBanner isOnline={isOnline} pendingCount={pendingCount} />
      </header>

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
          {/* TODO(P3): conectar con POST /rooms/join cuando exista. */}
          <Button fullWidth disabled={code.length !== 6}>
            Unirme
          </Button>
        </Card>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-display text-2xl font-extrabold">Tareas asignadas</h2>

        {DEMO_ACTIVITIES.map((task) => {
          const done = isDownloaded(task.id);

          return (
            <Card key={task.id} featured={!done} className="flex flex-col gap-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-display text-xl font-bold">{task.title}</p>
                  <p className="text-sm text-muted">{task.detail}</p>
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
                  onClick={() => void download(task.id)}
                >
                  {isDownloading === task.id
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
  );
}
