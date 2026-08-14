import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "EduFlow — Práctica de matemáticas sin conexión",
    short_name: "EduFlow",
    description:
      "Descargá la tarea con señal, resolvela sin internet y se sincroniza sola.",
    // `standalone` la abre como app, sin barra del navegador: importante para
    // que en el celular se sienta una herramienta y no una pagina web.
    display: "standalone",
    start_url: "/alumno/practicar",
    lang: "es-CL",
    background_color: "#fbf9f1",
    theme_color: "#5865f2",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}
