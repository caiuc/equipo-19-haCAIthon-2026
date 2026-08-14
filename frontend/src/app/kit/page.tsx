"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ChoiceGroup, type Choice } from "@/components/ui/ChoiceGroup";
import { ConnectionBanner } from "@/components/ui/ConnectionBanner";
import { Input } from "@/components/ui/Input";
import { OptionCard, type OptionState } from "@/components/ui/OptionCard";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { StatCard } from "@/components/ui/StatCard";

const DIFFICULTIES = [
  { value: "easy", label: "Fácil", dotClassName: "bg-success" },
  { value: "medium", label: "Media", dotClassName: "bg-pulse" },
  { value: "hard", label: "Difícil", dotClassName: "bg-danger" },
] as const satisfies ReadonlyArray<Choice<string>>;

const FORMATS = [
  { value: "multiple_choice", label: "Opción múltiple" },
  { value: "numeric", label: "Numérico" },
  { value: "text", label: "Texto corto" },
] as const satisfies ReadonlyArray<Choice<string>>;

const ANSWERS = ["54", "56", "64", "48"];
const CORRECT_ANSWER = "56";

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="font-display text-2xl font-bold">{title}</h2>
      {children}
    </section>
  );
}

export default function KitPage() {
  const [difficulty, setDifficulty] = useState<string>("medium");
  const [format, setFormat] = useState<string>("multiple_choice");
  const [chosen, setChosen] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(false);

  function stateFor(answer: string): OptionState {
    if (chosen === null) return "idle";
    if (answer === CORRECT_ANSWER) return "correct";
    if (answer === chosen) return "wrong";
    return "idle";
  }

  return (
    <main className="mx-auto flex max-w-4xl flex-col gap-12 px-4 py-12">
      <header className="flex flex-col gap-2">
        <span className="font-display text-xs font-bold tracking-widest text-primary uppercase">
          EduFlow · Sistema de diseño
        </span>
        <h1 className="font-display text-5xl font-extrabold">Kit de componentes</h1>
        <p className="max-w-prose text-lg text-ink-soft">
          Referencia viva de los componentes. Si algo se ve mal acá, se va a ver
          mal en las siete pantallas.
        </p>
      </header>

      <Section title="Botones">
        <div className="flex flex-wrap items-center gap-4">
          <Button>Crear sala</Button>
          <Button variant="secondary">Guardar borrador</Button>
          <Button variant="ghost">Cancelar</Button>
          <Button size="lg">Unirme a la clase</Button>
          <Button disabled>Deshabilitado</Button>
        </div>
      </Section>

      <Section title="Insignias">
        <div className="flex flex-wrap items-center gap-3">
          <Badge tone="live">En vivo</Badge>
          <Badge tone="waiting">En espera</Badge>
          <Badge tone="closed">Cerrada</Badge>
          <Badge tone="done">Completada</Badge>
          <Badge tone="offline">Sin conexión</Badge>
          <Badge tone="pending">3 pendientes</Badge>
        </div>
      </Section>

      <Section title="Estado de conexión">
        <Card className="flex flex-col gap-4">
          <ConnectionBanner isOnline={isOnline} pendingCount={isOnline ? 0 : 3} />
          <Button variant="secondary" onClick={() => setIsOnline((v) => !v)}>
            Simular {isOnline ? "corte de conexión" : "vuelta de la señal"}
          </Button>
        </Card>
      </Section>

      <Section title="Campos">
        <div className="grid gap-6 md:grid-cols-2">
          <Input
            name="codigo"
            label="Código de la sala"
            placeholder="Ej: K7M2PQ"
            hint="Son 6 caracteres, te lo da tu profe."
          />
          <Input
            name="nombre"
            label="Nombre de la sala"
            placeholder="2do Medio B — Álgebra"
            error="El nombre es muy corto"
          />
        </div>
      </Section>

      <Section title="Tarjetas de dato">
        <div className="grid gap-6 md:grid-cols-3">
          <StatCard tone="primary" label="Alumnos" value={84} />
          <StatCard tone="pulse" label="Por revisar" value={12} />
          <StatCard
            tone="plain"
            label="Promedio del curso"
            value="82%"
            footer={<ProgressBar value={82} />}
          />
        </div>
      </Section>

      <Section title="Selectores">
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <ChoiceGroup
              legend="Dificultad"
              choices={DIFFICULTIES}
              value={difficulty}
              onChange={setDifficulty}
            />
          </Card>
          <Card>
            <ChoiceGroup
              legend="Formato"
              choices={FORMATS}
              value={format}
              onChange={setFormat}
              direction="row"
            />
          </Card>
        </div>
      </Section>

      <Section title="Ejercicio">
        <Card featured className="flex flex-col gap-5">
          <Badge tone="done">Multiplicación</Badge>
          <p className="font-display text-3xl font-bold">¿Cuánto es 7 × 8?</p>

          <div className="flex flex-col gap-3">
            {ANSWERS.map((answer) => (
              <OptionCard
                key={answer}
                label={answer}
                state={stateFor(answer)}
                disabled={chosen !== null}
                onSelect={() => setChosen(answer)}
              />
            ))}
          </div>

          {chosen && (
            <div className="flex items-center justify-between gap-4">
              <p className="font-display font-bold">
                {chosen === CORRECT_ANSWER ? "¡Correcto!" : "Casi. Era 56."}
              </p>
              <Button variant="secondary" onClick={() => setChosen(null)}>
                Reintentar
              </Button>
            </div>
          )}
        </Card>
      </Section>

      <Section title="Progreso">
        <Card className="flex flex-col gap-5">
          <ProgressBar value={40} label="Pregunta 4 de 10" />
          <ProgressBar value={75} label="Matemáticas" />
          <ProgressBar value={100} label="Historia" />
        </Card>
      </Section>
    </main>
  );
}
