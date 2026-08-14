import {
  ACTIVITY_MODE,
  DIFFICULTY,
  EXERCISE_TYPE,
  type ActivityPackage,
  type Difficulty,
  type ExerciseWithKey,
} from "@/lib/types";

/*
  Generador de ejercicios en el cliente.

  Es un RESPALDO, no el motor definitivo: el generador real vive en el backend
  (services/exercise_service.py) para que el profesor arme la actividad y el
  servidor conserve las claves. Esto existe para que el flujo del alumno se
  pueda construir y demostrar antes de que ese endpoint este listo.

  Cuando GET /activities/{id}/package responda, este archivo se borra entero.
*/

interface Range {
  min: number;
  max: number;
}

const MULTIPLICATION_RANGES: Record<Difficulty, [Range, Range]> = {
  easy: [
    { min: 2, max: 9 },
    { min: 2, max: 9 },
  ],
  medium: [
    { min: 10, max: 99 },
    { min: 2, max: 9 },
  ],
  hard: [
    { min: 10, max: 99 },
    { min: 10, max: 99 },
  ],
};

function randomInt({ min, max }: Range): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/** Distractores plausibles: errores tipicos, no numeros al azar. */
function buildDistractors(correct: number, a: number, b: number): string[] {
  const candidates = [
    correct + a,
    correct - b,
    correct + 10,
    Math.max(1, correct - 10),
    (a + 1) * b,
  ];

  const seen = new Set<number>([correct]);
  const distractors: string[] = [];

  for (const candidate of candidates) {
    if (candidate > 0 && !seen.has(candidate)) {
      seen.add(candidate);
      distractors.push(String(candidate));
    }
    if (distractors.length === 3) break;
  }

  return distractors;
}

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function buildExercise(position: number, difficulty: Difficulty): ExerciseWithKey {
  const [rangeA, rangeB] = MULTIPLICATION_RANGES[difficulty];
  const a = randomInt(rangeA);
  const b = randomInt(rangeB);
  const correct = a * b;

  return {
    id: `ej-${position}`,
    position,
    prompt: `¿Cuánto es ${a} × ${b}?`,
    options: shuffle([String(correct), ...buildDistractors(correct, a, b)]),
    points: 1,
    correctAnswer: String(correct),
    explanation: `${a} × ${b} = ${correct}`,
  };
}

const SEED_ACTIVITY_ID = "demo-multiplicacion";

export function buildSeedPackage(amount = 10): ActivityPackage {
  const exercises = Array.from({ length: amount }, (_, index) =>
    buildExercise(index + 1, index < 6 ? DIFFICULTY.EASY : DIFFICULTY.MEDIUM),
  );

  return {
    activityId: SEED_ACTIVITY_ID,
    title: "Tabla de multiplicar",
    subject: "Matemáticas",
    roomName: "2°B — Álgebra",
    mode: ACTIVITY_MODE.HOMEWORK,
    exercises,
  };
}

export const SEED_EXERCISE_TYPE = EXERCISE_TYPE.MULTIPLE_CHOICE;
