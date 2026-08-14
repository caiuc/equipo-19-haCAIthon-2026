import withSerwistInit from "@serwist/next";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Serwist inyecta configuracion de webpack incluso con `disable: true`, y
  // Next 16 corta el arranque si detecta config de webpack sin config de
  // Turbopack ("This build is using Turbopack, with a webpack config...").
  // Este objeto vacio le dice a Turbopack que no hay nada que migrar, y deja
  // que `next dev` funcione normalmente.
  turbopack: {},
};

// `revision` invalida la cache en cada build. Sin esto el navegador podria
// seguir sirviendo la version anterior de las paginas precacheadas.
const revision = crypto.randomUUID();

const withSerwist = withSerwistInit({
  swSrc: "src/app/sw.ts",
  swDest: "public/sw.js",
  // El Service Worker solo se registra en produccion: en desarrollo interfiere
  // con el hot reload y deja cache vieja dando vueltas.
  disable: process.env.NODE_ENV === "development",
  additionalPrecacheEntries: [
    // La superficie offline del alumno se precachea en la instalacion, no se
    // deja librada a que haya visitado la ruta antes de perder la senal.
    { url: "/alumno/practicar", revision },
    { url: "/sin-conexion", revision },
  ],
});

export default withSerwist(nextConfig);
