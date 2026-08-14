"use client";

import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { OptionCard, type OptionState } from "@/components/ui/OptionCard";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { answerKey, listAnswersForActivity, saveAnswer } from "@/offline/db";
import type { StoredActivity, StoredAnswer } from "@/lib/types";

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
  const [chosen, setChosen] = useState<string | null>(null);
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
  const hasAnswered = chosen !== null;

  function stateFor(option: string): OptionState {
    if (!hasAnswered) return "idle";
    if (option === exercise.correctAnswer) return "correct";
    if (option === chosen) return "wrong";
    return "idle";
  }

  async function choose(option: string) {
    if (hasAnswered) return;

    setChosen(option);

    // La correccion es local e inmediata: sin conexion no hay backend al que
    // preguntarle. El servidor la recalcula al sincronizar.
    const isCorrect = option === exercise.correctAnswer;

    const answer: StoredAnswer = {
      key: answerKey(activity.activityId, exercise.id),
      activityId: activity.activityId,
      exerciseId: exercise.id,
      answer: option,
      isCorrect,
      answeredAt: Date.now(),
      pendingSync: true,
    };

    await saveAnswer(answer);
    setAnswers((prev) => new Map(prev).set(exercise.id, answer));
    onAnswered();
  }

  function next() {
    setChosen(null);
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
              onSelect={() => void choose(option)}
            />
          ))}
        </div>

        {hasAnswered && (
          <div className="flex flex-col gap-4 border-t-2 border-ink pt-5">
            <p className="font-display text-lg font-bold">
              {chosen === exercise.correctAnswer
                ? "¡Correcto!"
                : `Era ${exercise.correctAnswer}`}
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
