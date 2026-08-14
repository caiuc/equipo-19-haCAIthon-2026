"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ConnectionBanner } from "@/components/ui/ConnectionBanner";
import { Input } from "@/components/ui/Input";
import { fetchActivityPackage } from "@/lib/api";
import { listActivities, saveActivity, saveSession, loadSession } from "@/offline/db";
import { useSync } from "@/offline/useSync";
import type { StoredActivity } from "@/lib/types";

const DEMO_ACTIVITY_ID = "demo-multiplicacion";

export default function AlumnoPage() {
  const [token, setToken] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [downloaded, setDownloaded] = useState<StoredActivity[]>([]);
  const [isDownloading, setIsDownloading] = useState(false);
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

  const alreadyDownloaded = downloaded.some(
    (a) => a.activityId === DEMO_ACTIVITY_ID,
  );

  async function download() {
    setIsDownloading(true);
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

      const pkg = await fetchActivityPackage(token ?? "demo", DEMO_ACTIVITY_ID);
      const stored = await saveActivity(pkg);

      setMessage(
        `Listo — ${Math.round(stored.sizeBytes / 1024)} KB. Ya podés resolverla sin conexión.`,
      );
      await refresh();
    } finally {
      setIsDownloading(false);
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

        <Card featured className="flex flex-col gap-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-display text-xl font-bold">
                Tabla de multiplicar
              </p>
              <p className="text-sm text-muted">2°B — Álgebra · 10 ejercicios</p>
            </div>
            <Badge tone={alreadyDownloaded ? "done" : "waiting"}>
              {alreadyDownloaded ? "Descargada" : "Tarea"}
            </Badge>
          </div>

          <p className="text-ink-soft">
            Descargala ahora que tenés señal y resolvela después, aunque no
            tengas internet.
          </p>

          {alreadyDownloaded ? (
            <Link href="/alumno/practicar">
              <Button fullWidth size="lg">
                Ir a resolverla
              </Button>
            </Link>
          ) : (
            <Button
              fullWidth
              size="lg"
              disabled={isDownloading}
              onClick={() => void download()}
            >
              {isDownloading ? "Descargando…" : "Descargar para usar sin conexión"}
            </Button>
          )}

          {message && (
            <p className="font-display text-sm font-bold text-primary-deep">
              {message}
            </p>
          )}
        </Card>
      </section>
    </main>
  );
}
