"use client";

import { useCallback, useEffect, useState } from "react";
import { countPendingAnswers } from "@/offline/db";
import { ApiError } from "@/lib/api";
import { syncPendingAnswers } from "@/offline/sync";
import { useOnline } from "@/offline/useOnline";

interface UseSyncResult {
  isOnline: boolean;
  pendingCount: number;
  isSyncing: boolean;
  /** Motivo del ultimo fallo de sincronizacion, para no fallar en silencio. */
  syncError: string | null;
  refreshPending: () => Promise<void>;
  syncNow: () => Promise<void>;
}

export function useSync(token: string | null): UseSyncResult {
  const isOnline = useOnline();
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);

  const refreshPending = useCallback(async () => {
    setPendingCount(await countPendingAnswers());
  }, []);

  const syncNow = useCallback(async () => {
    if (!token) return;

    setIsSyncing(true);
    try {
      const result = await syncPendingAnswers(token);
      // El servidor respondio pero no acepto nada: casi siempre es que el
      // alumno no es miembro de la sala, o que los ejercicios son de una
      // actividad de demostracion que no existe en la base.
      setSyncError(
        result.sent === 0 && result.attempted > 0
          ? "El servidor no aceptó las respuestas. ¿Estás en la sala de esa tarea?"
          : null,
      );
    } catch (caught: unknown) {
      // La cola queda intacta: se reintenta en el proximo evento `online`.
      // Pero el fallo se muestra: una sincronizacion que falla callada es
      // indistinguible de una que funciona.
      setSyncError(
        caught instanceof ApiError && caught.status === 401
          ? "Tu sesión no es válida. Vuelve a entrar para enviar tus respuestas."
          : "No se pudieron enviar las respuestas. Se reintenta solo.",
      );
    } finally {
      setIsSyncing(false);
      await refreshPending();
    }
  }, [token, refreshPending]);

  useEffect(() => {
    void refreshPending();
  }, [refreshPending]);

  // Vaciar la cola apenas vuelve la senal es el corazon de HU-6: la alumna no
  // tiene que acordarse de hacer nada.
  useEffect(() => {
    if (isOnline) void syncNow();
  }, [isOnline, syncNow]);

  return {
    isOnline,
    pendingCount,
    isSyncing,
    syncError,
    refreshPending,
    syncNow,
  };
}
