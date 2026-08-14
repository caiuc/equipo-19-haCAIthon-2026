"use client";

import { useEffect, useState } from "react";

/**
 * Estado de conexion del navegador.
 *
 * Arranca en `true` a proposito: en el servidor no existe `navigator`, y
 * asumir "sin conexion" haria parpadear el cartel de offline en cada carga.
 *
 * `navigator.onLine` miente en un caso: dice `true` cuando hay wifi pero sin
 * salida a internet. Para la demo alcanza, y el fallo real se detecta igual
 * cuando la peticion de sincronizacion falla.
 */
export function useOnline(): boolean {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    setIsOnline(navigator.onLine);

    const goOnline = () => setIsOnline(true);
    const goOffline = () => setIsOnline(false);

    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);

    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  return isOnline;
}
