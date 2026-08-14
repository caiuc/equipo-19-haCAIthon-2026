import type {
  ActivityPackage,
  ActivitySummary,
  Room,
  StoredAnswer,
} from "@/lib/types";
import { buildSeedPackage } from "@/lib/seed";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(
  path: string,
  options: RequestInit & { token?: string } = {},
): Promise<T> {
  const { token, headers, ...rest } = options;

  const response = await fetch(`${API_URL}${path}`, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  });

  if (!response.ok) {
    // El backend devuelve 503 cuando no pudo contactar a Supabase. No es lo
    // mismo que un 401: la sesion puede estar perfecta y ser la red la que
    // falla, y el frontend necesita esa diferencia para entrar en modo offline
    // en vez de mandar al alumno a la pantalla de login.
    throw new ApiError(
      response.status === 503
        ? "El servidor no responde"
        : "La peticion fallo",
      response.status,
    );
  }

  return response.json() as Promise<T>;
}

/* ------------------------------- auth ------------------------------- */

interface LoginResponse {
  access_token: string;
  refresh_token: string;
  user: { id: string; email: string };
}

export function login(email: string, password: string) {
  return request<LoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function register(
  email: string,
  password: string,
  name: string,
  role: "teacher" | "student",
) {
  return request<{ message: string; user_id: string }>("/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password, name, role }),
  });
}

/* ------------------------------- salas ------------------------------ */

export function listRooms(token: string) {
  return request<Room[]>("/rooms/", { token });
}

// Sin 0/O ni 1/I/L: el codigo se dicta en voz alta y se escribe en el pizarron.
const CODE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

function generateRoomCode(): string {
  const values = crypto.getRandomValues(new Uint32Array(6));
  return Array.from(values, (n) => CODE_ALPHABET[n % CODE_ALPHABET.length]).join("");
}

/**
 * Crea una sala.
 *
 * TODO(P3 · S2): el codigo lo esta generando el CLIENTE porque el backend lo
 * exige en el body (schemas/room.py). Eso permite elegir el codigo o colisionar
 * con salas existentes. Cuando el servidor lo genere, borrar `code` de aca.
 */
export function createRoom(token: string, name: string) {
  return request<Room[] | Room>("/rooms/", {
    method: "POST",
    token,
    body: JSON.stringify({
      name,
      code: generateRoomCode(),
      status: "active",
    }),
  });
}

export function listStudentRooms(token: string) {
  return request<Room[]>("/rooms/student", { token });
}

interface ApiActivitySummary {
  activity_id: string;
  title: string;
  subject: string | null;
  exercise_type: ActivitySummary["exerciseType"];
  difficulty: ActivitySummary["difficulty"];
  mode: ActivitySummary["mode"];
  exercise_count: number;
}

/**
 * Actividades de una sala. Junta las salas del alumno con sus actividades para
 * armar la lista de tareas disponibles.
 *
 * Si una sala falla se omite en vez de tumbar la lista entera: es preferible
 * mostrar las tareas de las otras salas a mostrar una pantalla vacia.
 */
export async function listActivitiesForStudent(
  token: string,
): Promise<ActivitySummary[]> {
  const rooms = await listStudentRooms(token);

  const perRoom = await Promise.all(
    rooms.map(async (room) => {
      try {
        const payload = await request<ApiActivitySummary[]>(
          `/activities/?room_id=${encodeURIComponent(room.id)}`,
          { token },
        );

        return payload.map((item) => ({
          activityId: item.activity_id,
          title: item.title,
          subject: item.subject,
          exerciseType: item.exercise_type,
          difficulty: item.difficulty,
          mode: item.mode,
          exerciseCount: item.exercise_count,
          roomName: room.name,
        }));
      } catch {
        return [];
      }
    }),
  );

  return perRoom.flat();
}

/** Actividades de una sala, para la vista del profesor. */
export async function listRoomActivities(
  token: string,
  roomId: string,
  roomName: string,
): Promise<ActivitySummary[]> {
  const payload = await request<ApiActivitySummary[]>(
    `/activities/?room_id=${encodeURIComponent(roomId)}`,
    { token },
  );

  return payload.map((item) => ({
    activityId: item.activity_id,
    title: item.title,
    subject: item.subject,
    exerciseType: item.exercise_type,
    difficulty: item.difficulty,
    mode: item.mode,
    exerciseCount: item.exercise_count,
    roomName,
  }));
}

export interface RoomStudent {
  studentId: string;
  name: string;
  joinedAt: string;
}

export async function listRoomStudents(
  token: string,
  roomId: string,
): Promise<RoomStudent[]> {
  const payload = await request<
    { student_id: string; name: string; joined_at: string }[]
  >(`/rooms/${encodeURIComponent(roomId)}/students`, { token });

  return payload.map((s) => ({
    studentId: s.student_id,
    name: s.name,
    joinedAt: s.joined_at,
  }));
}

export interface ActivityResults {
  activityId: string;
  title: string;
  results: {
    studentId: string;
    totalPoints: number;
    correct: number;
    answered: number;
  }[];
}

export async function getActivityResults(
  token: string,
  activityId: string,
): Promise<ActivityResults> {
  const payload = await request<{
    activity_id: string;
    title: string;
    results: {
      student_id: string;
      total_points: number;
      answers: { is_correct: boolean }[];
    }[];
  }>(`/activities/${encodeURIComponent(activityId)}/results`, { token });

  return {
    activityId: payload.activity_id,
    title: payload.title,
    results: (payload.results ?? []).map((r) => ({
      studentId: r.student_id,
      totalPoints: r.total_points,
      correct: (r.answers ?? []).filter((a) => a.is_correct).length,
      answered: (r.answers ?? []).length,
    })),
  };
}

export function joinRoom(token: string, code: string, displayName: string) {
  return request<Room>("/rooms/join", {
    method: "POST",
    token,
    body: JSON.stringify({ code, display_name: displayName }),
  });
}

/* ---------------------------- actividades --------------------------- */

/*
  El backend es Python y responde en snake_case. La conversion se hace aca, en
  el borde: imponerle camelCase a Pydantic seria pelearse con las convenciones
  de ese lado del proyecto para comodidad de este.
  Contrato completo en backend/API_CONTRACT.md.
*/

interface ApiExercise {
  id: string;
  position: number;
  prompt: string;
  options: string[] | null;
  points: number;
  correct_answer: string;
  explanation: string | null;
}

interface ApiActivityPackage {
  activity_id: string;
  title: string;
  subject: string;
  room_name: string;
  mode: ActivityPackage["mode"];
  exercise_type: ActivityPackage["exerciseType"];
  exercises: ApiExercise[];
}

function toActivityPackage(payload: ApiActivityPackage): ActivityPackage {
  return {
    activityId: payload.activity_id,
    title: payload.title,
    subject: payload.subject,
    roomName: payload.room_name,
    mode: payload.mode,
    exerciseType: payload.exercise_type,
    exercises: payload.exercises
      .map((exercise) => ({
        id: exercise.id,
        position: exercise.position,
        prompt: exercise.prompt,
        options: exercise.options,
        points: exercise.points,
        correctAnswer: exercise.correct_answer,
        explanation: exercise.explanation,
      }))
      .sort((a, b) => a.position - b.position),
  };
}

/**
 * Descarga el paquete de una actividad para resolverla sin conexion.
 *
 * TODO(P3): cuando GET /activities/{id}/package exista, borrar el respaldo y
 * dejar que el error se propague. Hoy el endpoint no esta implementado, y sin
 * este fallback el flujo del alumno no se podria construir ni demostrar.
 */
export async function fetchActivityPackage(
  token: string,
  activityId: string,
): Promise<ActivityPackage> {
  try {
    const payload = await request<ApiActivityPackage>(
      `/activities/${activityId}/package`,
      { token },
    );
    return toActivityPackage(payload);
  } catch {
    return buildSeedPackage(activityId);
  }
}

/* ---------------------------- respuestas ---------------------------- */

export interface BulkAnswerResult {
  /** Claves `${activityId}:${exerciseId}` que el servidor acepto. */
  accepted: string[];
}

/**
 * Envia la cola de respuestas pendientes.
 *
 * El servidor recalcula `is_correct` contra exercise_keys y sobrescribe lo que
 * mando el cliente: la correccion local es solo para el feedback inmediato.
 */
export function pushAnswers(token: string, answers: StoredAnswer[]) {
  return request<BulkAnswerResult>("/answers/bulk", {
    method: "POST",
    token,
    body: JSON.stringify({
      answers: answers.map((a) => ({
        exercise_id: a.exerciseId,
        activity_id: a.activityId,
        submitted_answer: a.answer,
        answered_at: new Date(a.answeredAt).toISOString(),
      })),
    }),
  });
}

export interface CreateActivityInput {
  roomId: string;
  title: string;
  subject: string;
  exerciseType: string;
  difficulty: string;
  mode: string;
  exercises: {
    position: number;
    prompt: string;
    options: string[] | null;
    points: number;
    correctAnswer: string;
    explanation: string | null;
  }[];
}

export function createActivity(token: string, input: CreateActivityInput) {
  return request<{ activity_id: string; exercises_created: number }>(
    "/activities/",
    {
      method: "POST",
      token,
      body: JSON.stringify({
        room_id: input.roomId,
        title: input.title,
        subject: input.subject,
        exercise_type: input.exerciseType,
        difficulty: input.difficulty,
        mode: input.mode,
        status: "active",
        exercises: input.exercises.map((e) => ({
          position: e.position,
          prompt: e.prompt,
          options: e.options,
          points: e.points,
          correct_answer: e.correctAnswer,
          explanation: e.explanation,
        })),
      }),
    },
  );
}
