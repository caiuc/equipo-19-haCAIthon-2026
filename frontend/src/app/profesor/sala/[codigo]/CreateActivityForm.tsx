"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ChoiceGroup, type Choice } from "@/components/ui/ChoiceGroup";
import { Input } from "@/components/ui/Input";
import { createActivity } from "@/lib/api";
import { generateExercises } from "@/lib/seed";
import type { Difficulty, ExerciseType } from "@/lib/types";

const DIFFICULTIES = [
  { value: "easy", label: "Fácil", dotClassName: "bg-success" },
  { value: "medium", label: "Media", dotClassName: "bg-pulse" },
  { value: "hard", label: "Difícil", dotClassName: "bg-danger" },
] as const satisfies ReadonlyArray<Choice<Difficulty>>;

const TYPES = [
  { value: "multiple_choice", label: "Opción múltiple" },
  { value: "numeric", label: "Numérico" },
] as const satisfies ReadonlyArray<Choice<ExerciseType>>;

const MODES = [
  { value: "homework", label: "Tarea" },
  { value: "practice", label: "Práctica" },
  { value: "live", label: "En vivo" },
] as const satisfies ReadonlyArray<Choice<string>>;

interface Props {
  token: string;
  roomId: string;
  onCreated: () => void;
}

export function CreateActivityForm({ token, roomId, onCreated }: Props) {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState(5);
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [type, setType] = useState<ExerciseType>("multiple_choice");
  const [mode, setMode] = useState<string>("homework");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setIsSaving(true);

    try {
      // Los ejercicios se generan en el cliente porque POST /activities/ los
      // exige en el body: el generador del backend todavia esta vacio.
      const exercises = generateExercises(type, difficulty, amount);

      await createActivity(token, {
        roomId,
        title,
        subject: "Matemáticas",
        exerciseType: type,
        difficulty,
        mode,
        exercises: exercises.map((e) => ({
          position: e.position,
          prompt: e.prompt,
          options: e.options,
          points: e.points,
          correctAnswer: e.correctAnswer,
          explanation: e.explanation,
        })),
      });

      setTitle("");
      onCreated();
    } catch {
      setError("No se pudo crear la actividad.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Card className="flex flex-col gap-5">
      <form onSubmit={submit} className="flex flex-col gap-5">
        <Input
          name="titulo"
          label="Nombre de la actividad"
          placeholder="Tabla de multiplicar"
          required
          minLength={3}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          error={error ?? undefined}
        />

        <ChoiceGroup
          legend="Formato"
          choices={TYPES}
          value={type}
          onChange={setType}
          direction="row"
        />

        <ChoiceGroup
          legend="Dificultad"
          choices={DIFFICULTIES}
          value={difficulty}
          onChange={setDifficulty}
        />

        <ChoiceGroup
          legend="Modalidad"
          choices={MODES}
          value={mode}
          onChange={setMode}
          direction="row"
        />

        {mode === "live" && (
          <p className="rounded-xl border-2 border-dashed border-muted p-3 text-sm text-muted">
            En vivo no se puede descargar: las respuestas correctas nunca salen
            del servidor. Usa Tarea o Práctica para que funcione sin conexión.
          </p>
        )}

        <Input
          name="cantidad"
          type="number"
          label="Cantidad de ejercicios"
          min={1}
          max={20}
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
        />

        <Button type="submit" size="lg" disabled={isSaving || title.length < 3}>
          {isSaving ? "Creando…" : `Crear actividad con ${amount} ejercicios`}
        </Button>
      </form>
    </Card>
  );
}
