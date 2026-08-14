"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ChoiceGroup, type Choice } from "@/components/ui/ChoiceGroup";
import { Input } from "@/components/ui/Input";
import { ApiError, login } from "@/lib/api";
import { saveSession } from "@/offline/db";

type Role = "teacher" | "student";

const ROLES = [
  { value: "student", label: "Soy alumno" },
  { value: "teacher", label: "Soy profesor" },
] as const satisfies ReadonlyArray<Choice<Role>>;

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("student");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const result = await login(email, password);

      // TODO(P3): el rol deberia venir de GET /auth/me. Hoy /auth/login solo
      // devuelve el token y el email, asi que se elige aca. Es solo para saber
      // a donde navegar: el backend valida el rol real contra profiles en cada
      // accion que importa.
      await saveSession({
        accessToken: result.access_token,
        userId: result.user.id,
        name: result.user.email,
        role,
      });

      router.push(role === "teacher" ? "/profesor" : "/alumno");
    } catch (caught: unknown) {
      setError(
        caught instanceof ApiError && caught.status === 503
          ? "El servidor no responde. Revisa tu conexión."
          : "Email o contraseña incorrectos.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-6 px-4 py-10">
      <header className="flex flex-col items-center gap-3 text-center">
        {/* El logo vuelve al inicio: es la salida esperada desde una pantalla
            de acceso, y en móvil es el único camino de regreso. */}
        <Link href="/" className="rounded-card" aria-label="Ir al inicio de EduFlow">
          <Logo size="lg" />
        </Link>
        <p className="text-ink-soft">Práctica de matemáticas que funciona sin señal</p>
      </header>

      <Card featured>
        <form onSubmit={submit} className="flex flex-col gap-5">
          <ChoiceGroup
            legend="¿Cómo entrás?"
            choices={ROLES}
            value={role}
            onChange={setRole}
            direction="row"
          />

          <Input
            name="email"
            type="email"
            label="Email"
            placeholder="camila@colegio.cl"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />

          <Input
            name="password"
            type="password"
            label="Contraseña"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            error={error ?? undefined}
          />

          <Button type="submit" size="lg" fullWidth disabled={isSubmitting}>
            {isSubmitting ? "Entrando…" : "Entrar"}
          </Button>
        </form>
      </Card>
    </main>
  );
}
