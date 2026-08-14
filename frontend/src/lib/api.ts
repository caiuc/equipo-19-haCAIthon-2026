import type { ActivityPackage, Room, StoredAnswer } from "@/lib/types";
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

export function joinRoom(token: string, code: string) {
  return request<Room>("/rooms/join", {
    method: "POST",
    token,
    body: JSON.stringify({ code }),
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
