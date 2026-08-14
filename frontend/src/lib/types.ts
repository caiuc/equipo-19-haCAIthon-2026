export const DIFFICULTY = {
  EASY: "easy",
  MEDIUM: "medium",
  HARD: "hard",
} as const;

export type Difficulty = (typeof DIFFICULTY)[keyof typeof DIFFICULTY];

export const EXERCISE_TYPE = {
  MULTIPLE_CHOICE: "multiple_choice",
  NUMERIC: "numeric",
  TEXT: "text",
} as const;

export type ExerciseType = (typeof EXERCISE_TYPE)[keyof typeof EXERCISE_TYPE];

export const ACTIVITY_MODE = {
  LIVE: "live",
  HOMEWORK: "homework",
  PRACTICE: "practice",
} as const;

export type ActivityMode = (typeof ACTIVITY_MODE)[keyof typeof ACTIVITY_MODE];

/** Modos cuyo paquete puede descargarse con las claves de correccion. */
export const DOWNLOADABLE_MODES: ReadonlyArray<ActivityMode> = [
  ACTIVITY_MODE.HOMEWORK,
  ACTIVITY_MODE.PRACTICE,
];

export interface Exercise {
  id: string;
  position: number;
  prompt: string;
  options: string[] | null;
  points: number;
}

/**
 * Ejercicio con su solucion.
 *
 * La clave solo viaja al dispositivo en modo `homework` o `practice`, nunca en
 * `live`. Es una decision de modelo de amenaza: una guia de practica en casa no
 * tiene el mismo requisito de secreto que una evaluacion calificada, y sin la
 * clave local es imposible corregir sin conexion. Al sincronizar, el servidor
 * recalcula `is_correct` y sobrescribe lo que mando el cliente.
 */
export interface ExerciseWithKey extends Exercise {
  correctAnswer: string;
  explanation: string | null;
}

/** Lo que devuelve GET /activities/{id}/package. */
export interface ActivityPackage {
  activityId: string;
  title: string;
  subject: string;
  roomName: string;
  mode: ActivityMode;
  /**
   * Determina que entrada se le muestra al alumno. Sin este campo el cliente
   * no puede distinguir un ejercicio numerico de uno de texto: en ambos
   * `options` llega en null, y la pantalla quedaria sin forma de responder.
   */
  exerciseType: ExerciseType;
  exercises: ExerciseWithKey[];
}

export interface StoredActivity extends ActivityPackage {
  downloadedAt: number;
  /** Peso del paquete. Se muestra al alumno: el argumento es que cabe en datos de prepago. */
  sizeBytes: number;
}

export interface StoredAnswer {
  /** `${activityId}:${exerciseId}` */
  key: string;
  activityId: string;
  exerciseId: string;
  answer: string;
  /** Correccion local, provisoria. La oficial la calcula el servidor al sincronizar. */
  isCorrect: boolean;
  answeredAt: number;
  pendingSync: boolean;
}

export interface StoredSession {
  accessToken: string;
  userId: string;
  name: string;
  role: "teacher" | "student";
}

export interface Room {
  id: string;
  code: string;
  name: string;
  status: string;
}
