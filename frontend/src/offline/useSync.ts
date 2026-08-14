"use client";

import { useCallback, useEffect, useState } from "react";
import { countPendingAnswers } from "@/offline/db";
import { syncPendingAnswers } from "@/offline/sync";
import { useOnline } from "@/offline/useOnline";

interface UseSyncResult {
  isOnline: boolean;
  pendingCount: number;
  isSyncing: boolean;
  /** true si el ultimo envio fue simulado porque falta el endpoint. */
  wasSimulated: boolean;
  refreshPending: () => Promise<void>;
  syncNow: () => Promise<void>;
}

export function useSync(token: string | null): UseSyncResult {
  const isOnline = useOnline();
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [wasSimulated, setWasSimulated] = useState(false);

  const refreshPending = useCallback(async () => {
    setPendingCount(await countPendingAnswers());
  }, []);

  const syncNow = useCallback(async () => {
    if (!token) return;

    setIsSyncing(true);
    try {
      const result = await syncPendingAnswers(token);
      setWasSimulated(result.simulated);
    } catch {
      // La cola queda intacta: se reintenta en el proximo evento `online`.
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
    wasSimulated,
    refreshPending,
    syncNow,
  };
}
