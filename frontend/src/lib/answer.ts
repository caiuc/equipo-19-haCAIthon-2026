import { EXERCISE_TYPE, type ExerciseType } from "@/lib/types";

/**
 * Compara la respuesta del alumno contra la correcta.
 *
 * Vive aparte de la interfaz a proposito: es la unica logica del cliente que
 * decide si algo esta bien o mal, y se puede probar sin renderizar nada.
 *
 * OJO: esta correccion es solo para el feedback inmediato sin conexion. La
 * oficial la recalcula el servidor al sincronizar.
 */
export function isAnswerCorrect(
  submitted: string,
  correct: string,
  type: ExerciseType,
): boolean {
  if (type === EXERCISE_TYPE.NUMERIC) {
    const a = toNumber(submitted);
    const b = toNumber(correct);
    return a !== null && b !== null && a === b;
  }

  if (type === EXERCISE_TYPE.TEXT) {
    return normalizeText(submitted) === normalizeText(correct);
  }

  // multiple_choice: la opcion se elige de una lista, comparacion exacta.
  return submitted === correct;
}

/**
 * Acepta coma decimal ademas de punto: en Chile se escribe 3,5 y no 3.5, y
 * rechazar eso seria contar como error algo que el alumno resolvio bien.
 */
function toNumber(value: string): number | null {
  const cleaned = value.trim().replace(",", ".");
  if (cleaned === "") return null;

  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : null;
}

/**
 * Ignora mayusculas, espacios de sobra y tildes.
 *
 * Un alumno que escribe "triangulo" sin tilde sabe la respuesta; marcarsela
 * mal seria evaluar su teclado, no su matematica.
 */
function normalizeText(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/\s+/g, " ");
}

export function isFreeInput(type: ExerciseType): boolean {
  return type !== EXERCISE_TYPE.MULTIPLE_CHOICE;
}
