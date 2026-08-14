import { ApiError, pushAnswers } from "@/lib/api";
import { listPendingAnswers, markAnswersSynced } from "@/offline/db";

export interface SyncResult {
  sent: number;
  /** true si el backend todavia no implementa /answers/bulk. */
  simulated: boolean;
}

/**
 * Vacia la cola de respuestas pendientes contra el servidor.
 *
 * Es idempotente por diseno: la tabla `answers` tiene unique(exercise_id,
 * student_id), asi que reenviar una respuesta ya registrada no la duplica.
 * Por eso un reintento tras un corte de red es seguro.
 */
export async function syncPendingAnswers(token: string): Promise<SyncResult> {
  const pending = await listPendingAnswers();

  if (pending.length === 0) {
    return { sent: 0, simulated: false };
  }

  try {
    const result = await pushAnswers(token, pending);
    await markAnswersSynced(result.accepted);
    return { sent: result.accepted.length, simulated: false };
  } catch (error: unknown) {
    // ATENCION: mientras POST /answers/bulk no exista, el backend responde 404
    // y la cola nunca se vaciaria. Se marcan como enviadas para que el flujo
    // completo sea demostrable, PERO no llegan a la base.
    //
    // TODO(P3): borrar esta rama en cuanto el endpoint exista. Hasta entonces
    // la sincronizacion es simulada y no debe presentarse como real.
    if (error instanceof ApiError && error.status === 404) {
      await markAnswersSynced(pending.map((answer) => answer.key));
      return { sent: pending.length, simulated: true };
    }

    // Cualquier otro fallo (sin red, 503, 500) deja la cola intacta para
    // reintentar despues. Perder respuestas es peor que reintentar de mas.
    throw error;
  }
}
