import { openDB, type DBSchema, type IDBPDatabase } from "idb";
import type {
  ActivityPackage,
  StoredActivity,
  StoredAnswer,
  StoredSession,
} from "@/lib/types";

const DB_NAME = "eduflow";
const DB_VERSION = 1;

const STORE = {
  SESSION: "session",
  ACTIVITIES: "activities",
  ANSWERS: "answers",
} as const;

const SESSION_KEY = "current";

interface EduFlowDB extends DBSchema {
  session: {
    key: string;
    value: StoredSession;
  };
  activities: {
    key: string;
    value: StoredActivity;
  };
  answers: {
    key: string;
    value: StoredAnswer;
    indexes: { "by-activity": string; "by-pending": string };
  };
}

let dbPromise: Promise<IDBPDatabase<EduFlowDB>> | null = null;

function getDB() {
  if (typeof window === "undefined") {
    throw new Error("IndexedDB solo esta disponible en el navegador");
  }

  dbPromise ??= openDB<EduFlowDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      db.createObjectStore(STORE.SESSION);
      db.createObjectStore(STORE.ACTIVITIES, { keyPath: "activityId" });

      const answers = db.createObjectStore(STORE.ANSWERS, { keyPath: "key" });
      answers.createIndex("by-activity", "activityId");
      // pendingSync es booleano, pero IndexedDB no indexa booleanos. Se guarda
      // como "1"/"0" en un campo espejo para poder consultar la cola.
      answers.createIndex("by-pending", "pendingFlag");
    },
  });

  return dbPromise;
}

/* ------------------------------ sesion ------------------------------ */

export async function saveSession(session: StoredSession): Promise<void> {
  const db = await getDB();
  await db.put(STORE.SESSION, session, SESSION_KEY);
}

export async function loadSession(): Promise<StoredSession | undefined> {
  const db = await getDB();
  return db.get(STORE.SESSION, SESSION_KEY);
}

export async function clearSession(): Promise<void> {
  const db = await getDB();
  await db.delete(STORE.SESSION, SESSION_KEY);
}

/* ---------------------------- actividades --------------------------- */

export async function saveActivity(
  pkg: ActivityPackage,
): Promise<StoredActivity> {
  const sizeBytes = new Blob([JSON.stringify(pkg)]).size;

  const stored: StoredActivity = {
    ...pkg,
    downloadedAt: Date.now(),
    sizeBytes,
  };

  const db = await getDB();
  await db.put(STORE.ACTIVITIES, stored);

  return stored;
}

export async function listActivities(): Promise<StoredActivity[]> {
  const db = await getDB();
  const all = await db.getAll(STORE.ACTIVITIES);
  return all.sort((a, b) => b.downloadedAt - a.downloadedAt);
}

export async function getActivity(
  activityId: string,
): Promise<StoredActivity | undefined> {
  const db = await getDB();
  return db.get(STORE.ACTIVITIES, activityId);
}

export async function deleteActivity(activityId: string): Promise<void> {
  const db = await getDB();
  const tx = db.transaction([STORE.ACTIVITIES, STORE.ANSWERS], "readwrite");

  await tx.objectStore(STORE.ACTIVITIES).delete(activityId);

  const answers = tx.objectStore(STORE.ANSWERS);
  const keys = await answers.index("by-activity").getAllKeys(activityId);
  await Promise.all(keys.map((key) => answers.delete(key)));

  await tx.done;
}

/* ----------------------------- respuestas --------------------------- */

interface AnswerRecord extends StoredAnswer {
  /** Espejo de pendingSync para poder indexarlo. */
  pendingFlag: string;
}

function toRecord(answer: StoredAnswer): AnswerRecord {
  return { ...answer, pendingFlag: answer.pendingSync ? "1" : "0" };
}

export function answerKey(activityId: string, exerciseId: string): string {
  return `${activityId}:${exerciseId}`;
}

export async function saveAnswer(answer: StoredAnswer): Promise<void> {
  const db = await getDB();
  await db.put(STORE.ANSWERS, toRecord(answer));
}

export async function listAnswersForActivity(
  activityId: string,
): Promise<StoredAnswer[]> {
  const db = await getDB();
  return db.getAllFromIndex(STORE.ANSWERS, "by-activity", activityId);
}

export async function listPendingAnswers(): Promise<StoredAnswer[]> {
  const db = await getDB();
  return db.getAllFromIndex(STORE.ANSWERS, "by-pending", "1");
}

export async function countPendingAnswers(): Promise<number> {
  const db = await getDB();
  return db.countFromIndex(STORE.ANSWERS, "by-pending", "1");
}

/** Marca como sincronizadas las respuestas que el servidor ya acepto. */
export async function markAnswersSynced(keys: string[]): Promise<void> {
  if (keys.length === 0) return;

  const db = await getDB();
  const tx = db.transaction(STORE.ANSWERS, "readwrite");

  await Promise.all(
    keys.map(async (key) => {
      const existing = await tx.store.get(key);
      if (!existing) return;
      await tx.store.put(toRecord({ ...existing, pendingSync: false }));
    }),
  );

  await tx.done;
}
