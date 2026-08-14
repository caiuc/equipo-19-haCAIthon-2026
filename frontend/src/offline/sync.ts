import { pushAnswers } from "@/lib/api";
import { listPendingAnswers, markAnswersSynced } from "@/offline/db";

export interface SyncResult {
  sent: number;
}

/**
 * Vacia la cola de respuestas pendientes contra el servidor.
 *
 * Es idempotente por diseno: la tabla `answers` tiene
 * unique(exercise_id, student_id), asi que reenviar una respuesta ya
 * registrada no la duplica. Por eso un reintento tras un corte de red es
 * seguro.
 *
 * Solo se marcan como enviadas las que el servidor confirma en `accepted`.
 * Las que no vuelven quedan en la cola y se reintentan en el proximo evento
 * `online`: perder una respuesta es peor que reenviarla de mas.
 */
export async function syncPendingAnswers(token: string): Promise<SyncResult> {
  const pending = await listPendingAnswers();

  if (pending.length === 0) {
    return { sent: 0 };
  }

  const result = await pushAnswers(token, pending);
  await markAnswersSynced(result.accepted);

  return { sent: result.accepted.length };
}
