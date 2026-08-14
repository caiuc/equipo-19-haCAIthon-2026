"use client";

import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { OptionCard, type OptionState } from "@/components/ui/OptionCard";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { isAnswerCorrect, isFreeInput } from "@/lib/answer";
import { EXERCISE_TYPE, type StoredActivity, type StoredAnswer } from "@/lib/types";
import { answerKey, listAnswersForActivity, saveAnswer } from "@/offline/db";

interface ExerciseRunnerProps {
  activity: StoredActivity;
  onAnswered: () => void;
  onExit: () => void;
}

export function ExerciseRunner({
  activity,
  onAnswered,
  onExit,
}: ExerciseRunnerProps) {
  const [answers, setAnswers] = useState<Map<string, StoredAnswer>>(new Map());
  const [index, setIndex] = useState(0);
  const [submitted, setSubmitted] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);

  const exercises = useMemo(
    () => [...activity.exercises].sort((a, b) => a.position - b.position),
    [activity.exercises],
  );

  // Al abrir, se recuperan las respuestas ya dadas y se salta al primer
  // ejercicio sin responder: cerrar la app no debe costar el progreso.
  useEffect(() => {
    async function restore() {
      const stored = await listAnswersForActivity(activity.activityId);
      const map = new Map(stored.map((answer) => [answer.exerciseId, answer]));
      setAnswers(map);

      const firstUnanswered = exercises.findIndex((ex) => !map.has(ex.id));
      setIndex(firstUnanswered === -1 ? exercises.length : firstUnanswered);
      setIsLoaded(true);
    }

    void restore();
  }, [activity.activityId, exercises]);

  if (!isLoaded) {
    return <p className="text-muted">Cargando tu progreso…</p>;
  }

  const isFinished = index >= exercises.length;
  const correctCount = [...answers.values()].filter((a) => a.isCorrect).length;

  if (isFinished) {
    const total = exercises.length;
    const percent = total === 0 ? 0 : Math.round((correctCount / total) * 100);

    return (
      <Card featured className="flex flex-col gap-5 text-center">
        <span className="font-display text-6xl font-extrabold tabular-nums">
          {percent}%
        </span>
        <p className="font-display text-xl font-bold">
          {correctCount} de {total} correctas
        </p>
        <p className="text-ink-soft">
          Tus respuestas quedaron guardadas en este dispositivo. Se envían solas
          cuando vuelva la conexión.
        </p>
        <Button onClick={onExit} fullWidth>
          Volver a mis tareas
        </Button>
      </Card>
    );
  }

  const exercise = exercises[index];
  const hasAnswered = submitted !== null;
  const freeInput = isFreeInput(activity.exerciseType);
  const wasCorrect =
    hasAnswered &&
    isAnswerCorrect(submitted, exercise.correctAnswer, activity.exerciseType);

  function stateFor(option: string): OptionState {
    if (!hasAnswered) return "idle";
    if (option === exercise.correctAnswer) return "correct";
    if (option === submitted) return "wrong";
    return "idle";
  }

  async function record(value: string) {
    if (hasAnswered) return;

    setSubmitted(value);

    // La correccion es local e inmediata: sin conexion no hay backend al que
    // preguntarle. El servidor la recalcula al sincronizar.
    const isCorrect = isAnswerCorrect(
      value,
      exercise.correctAnswer,
      activity.exerciseType,
    );

    const answer: StoredAnswer = {
      key: answerKey(activity.activityId, exercise.id),
      activityId: activity.activityId,
      exerciseId: exercise.id,
      answer: value,
      isCorrect,
      answeredAt: Date.now(),
      pendingSync: true,
    };

    await saveAnswer(answer);
    setAnswers((prev) => new Map(prev).set(exercise.id, answer));
    onAnswered();
  }

  function next() {
    setSubmitted(null);
    setDraft("");
    setIndex((current) => current + 1);
  }

  return (
    <div className="flex flex-col gap-5">
      <ProgressBar
        value={Math.round((index / exercises.length) * 100)}
        label={`Pregunta ${index + 1} de ${exercises.length}`}
      />

      <Card featured className="flex flex-col gap-5">
        <Badge tone="done">{activity.subject}</Badge>

        <p className="font-display text-3xl font-bold text-balance">
          {exercise.prompt}
        </p>

        {freeInput ? (
          <form
            onSubmit={(event) => {
              event.preventDefault();
              if (draft.trim() !== "") void record(draft);
            }}
            className="flex flex-col gap-3"
          >
            <label htmlFor="respuesta" className="sr-only">
              Tu respuesta
            </label>
            <input
              id="respuesta"
              name="respuesta"
              autoComplete="off"
              autoFocus
              disabled={hasAnswered}
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder={
                activity.exerciseType === EXERCISE_TYPE.NUMERIC
                  ? "Escribe el número"
                  : "Escribe tu respuesta"
              }
              // inputMode decimal abre el teclado numerico en el celular, que
              // es donde la alumna resuelve la tarea de noche.
              inputMode={
                activity.exerciseType === EXERCISE_TYPE.NUMERIC
                  ? "decimal"
                  : "text"
              }
              className="h-15 rounded-full border-2 border-ink bg-surface px-6 text-center font-display text-2xl font-bold text-ink placeholder:font-body placeholder:text-base placeholder:font-normal placeholder:text-muted focus:shadow-pulse focus:outline-none disabled:opacity-60"
            />

            {!hasAnswered && (
              <Button type="submit" size="lg" fullWidth disabled={draft.trim() === ""}>
                Responder
              </Button>
            )}
          </form>
        ) : (
          <div
            role="radiogroup"
            aria-label="Opciones de respuesta"
            className="flex flex-col gap-3"
          >
            {(exercise.options ?? []).map((option) => (
              <OptionCard
                key={option}
                label={option}
                state={stateFor(option)}
                disabled={hasAnswered}
                onSelect={() => void record(option)}
              />
            ))}
          </div>
        )}

        {hasAnswered && (
          <div className="flex flex-col gap-4 border-t-2 border-ink pt-5">
            <p className="font-display text-lg font-bold">
              {wasCorrect ? "¡Correcto!" : `Era ${exercise.correctAnswer}`}
            </p>
            {exercise.explanation && (
              <p className="text-ink-soft">{exercise.explanation}</p>
            )}
            <Button onClick={next} fullWidth size="lg">
              {index + 1 === exercises.length ? "Ver resultado" : "Siguiente"}
            </Button>
          </div>
        )}
      </Card>

      <Button variant="ghost" onClick={onExit}>
        Guardar y salir
      </Button>
    </div>
  );
}
