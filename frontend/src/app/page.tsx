import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export default function HomePage() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center gap-8 px-4 py-12">
      <header className="flex flex-col gap-4">
        <Badge tone="offline">Funciona sin internet</Badge>

        <h1 className="font-display text-5xl font-extrabold text-balance sm:text-6xl">
          EduFlow
        </h1>

        <p className="max-w-prose text-xl text-ink-soft">
          Práctica de matemáticas para colegios donde la señal no alcanza.
          Descargá la tarea cuando tengas conexión, resolvela sin internet y se
          sincroniza sola cuando la señal vuelve.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card featured className="flex flex-col gap-4">
          <p className="font-display text-xl font-bold">Soy alumno</p>
          <p className="flex-1 text-ink-soft">
            Unite con el código que te da tu profe y resolvé tus tareas aunque
            no tengas datos.
          </p>
          <Link href="/alumno/practicar">
            <Button fullWidth>Mis tareas</Button>
          </Link>
        </Card>

        <Card className="flex flex-col gap-4">
          <p className="font-display text-xl font-bold">Soy profesor</p>
          <p className="flex-1 text-ink-soft">
            Creá una sala, compartí el código y mirá quién resolvió qué.
          </p>
          <Link href="/profesor">
            <Button variant="secondary" fullWidth>
              Panel del profesor
            </Button>
          </Link>
        </Card>
      </div>

      <p className="text-center text-sm text-muted">
        ¿Ya tenés cuenta?{" "}
        <Link href="/login" className="underline underline-offset-4">
          Entrar
        </Link>
      </p>
    </main>
  );
}
