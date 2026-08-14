import type { Metadata } from "next";
import { Outfit, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

// next/font descarga y sirve las fuentes desde nuestro propio dominio.
// Enlazarlas al CDN de Google las rompería sin conexión, que es justo el
// escenario que la aplicación tiene que soportar.
const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["400", "700", "800"],
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "EduFlow — Práctica de matemáticas sin conexión",
  description:
    "Salas de práctica de matemáticas que funcionan sin internet: descarga la tarea, resuélvela sin señal y se sincroniza sola.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${outfit.variable} ${jakarta.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
