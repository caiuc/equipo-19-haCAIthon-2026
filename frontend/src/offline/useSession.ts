"use client";

import { useCallback, useEffect, useState } from "react";
import { clearSession, loadSession } from "@/offline/db";
import type { StoredSession } from "@/lib/types";

interface UseSessionResult {
  session: StoredSession | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
}

/**
 * Sesion guardada en el dispositivo.
 *
 * No revalida contra Supabase: sin conexion esa llamada fallaria y sacaria al
 * usuario de la aplicacion justo cuando mas necesita entrar. El servidor sigue
 * siendo la autoridad — rechaza el token en cada peticion que importa.
 */
export function useSession(): UseSessionResult {
  const [session, setSession] = useState<StoredSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function boot() {
      setSession((await loadSession()) ?? null);
      setIsLoading(false);
    }
    void boot();
  }, []);

  const signOut = useCallback(async () => {
    await clearSession();
    setSession(null);
  }, []);

  return { session, isLoading, signOut };
}
