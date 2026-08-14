import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

/**
 * Pantalla de respaldo cuando se pide una ruta que no esta cacheada y no hay
 * red. No es un error: el trabajo del alumno sigue intacto en el dispositivo,
 * y eso es lo primero que tiene que leer.
 */
export default function SinConexionPage() {
  return (
    <main className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center gap-6 px-4 py-8">
      <Card featured className="flex flex-col gap-5 text-center">
        <span className="font-display text-5xl font-extrabold">Sin conexión</span>

        <p className="text-lg text-ink-soft">
          Esta parte de EduFlow necesita internet, pero{" "}
          <strong>tus tareas descargadas siguen aquí</strong> y puedes seguir
          resolviéndolas.
        </p>

        <Link href="/alumno/practicar">
          <Button fullWidth size="lg">
            Ir a mis tareas
          </Button>
        </Link>

        <p className="text-sm text-muted">
          Lo que respondas se guarda en el dispositivo y se envía solo cuando
          vuelva la señal.
        </p>
      </Card>
    </main>
  );
}
