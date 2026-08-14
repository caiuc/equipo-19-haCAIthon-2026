"use client";

import { useCallback, useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { listStudentRooms } from "@/lib/api";
import { ALUMNO_NAV } from "@/lib/nav";
import { loadSession } from "@/offline/db";
import type { Room } from "@/lib/types";

export default function MisSalasPage() {
  const [rooms, setRooms] = useState<Room[] | null>(null);

  const load = useCallback(async () => {
    const session = await loadSession();
    const token = session?.accessToken ?? null;

    if (!token || token === "demo") {
      setRooms([]);
      return;
    }

    try {
      setRooms(await listStudentRooms(token));
    } catch {
      setRooms([]);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <AppShell nav={ALUMNO_NAV} role="Alumno">
      <main className="mx-auto flex w-full max-w-lg flex-col gap-6 px-4 py-8">
        <div>
          <h1 className="font-display text-3xl font-extrabold">Mis salas</h1>
          <p className="text-ink-soft">Las clases a las que te uniste.</p>
        </div>

        {rooms === null && <p className="text-muted">Cargando…</p>}

        {rooms?.length === 0 && (
          <Card className="text-center text-ink-soft">
            Todavía no estás en ninguna sala. Únete con el código que te da tu
            profe.
          </Card>
        )}

        {rooms?.map((room) => (
          <Card key={room.id} featured className="flex flex-col gap-3">
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
              <span className="font-display text-2xl font-extrabold tracking-[0.2em]">
                {room.code}
              </span>
            </div>
          </Card>
        ))}
      </main>
    </AppShell>
  );
}
