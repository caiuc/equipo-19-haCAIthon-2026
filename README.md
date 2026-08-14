# EduFlow

**Práctica de matemáticas para colegios donde la señal no alcanza.**

Descargá la tarea cuando tengas conexión, resolvela sin internet con corrección
inmediata, y se sincroniza sola cuando la señal vuelve.

> HaCAIthon 2026 · Equipo 19 · Centro de Alumnos de Ingeniería UC
> Temática: **Educación Pública** — material de estudio en zonas con poca conectividad

---

## El problema

Las plataformas educativas que existen —Khan Academy, Google Classroom, Kahoot—
**asumen conexión permanente**. En un colegio municipal con internet intermitente
eso las vuelve inservibles, y la alumna que se lleva la tarea a su casa sin wifi
ni datos simplemente no puede practicar.

El profesor, del otro lado, no tiene forma de asignar práctica dirigida ni de ver
quién avanzó, porque el registro depende de que todos estén en línea al mismo
tiempo.

## La solución

Una aplicación web instalable (PWA) organizada en salas profesor–alumno, diseñada
para **degradarse con gracia sin conexión**:

1. El profesor crea una sala y comparte un código de 6 caracteres
2. El alumno se une con ese código
3. Descarga la tarea mientras tiene señal — **pesa unos pocos KB**
4. La resuelve **completamente offline**, con corrección inmediata
5. Las respuestas se sincronizan solas cuando la conexión vuelve

El patrón está validado en el mundo real: [Kolibri](https://learningequality.org/kolibri/)
y RACHEL lo usan hoy en escuelas rurales sin internet.

### Por qué pesa tan poco

Un ejercicio de matemáticas es texto: unos pocos cientos de bytes. Una tarea
completa de 10 ejercicios ronda los **8 KB**. Eso entra en un plan de prepago sin
que se note, y es la diferencia entre que una herramienta educativa sea usable o
no en un celular de gama baja.

---

## Cómo correrlo

Necesitás **Node 22+**, **pnpm** y **Python 3.11+**.

### Backend

```bash
cd backend
pip install -r requirements.txt
cp .env.example .env        # completá tus credenciales de Supabase
python -m uvicorn main:app --reload
```

Queda en `http://localhost:8000`, con documentación interactiva en `/docs`.

### Frontend

```bash
cd frontend
pnpm install
pnpm dev                    # http://localhost:3000
```

### Probar el modo sin conexión

El Service Worker **está desactivado en desarrollo** a propósito, así que el modo
offline solo funciona en una build de producción:

```bash
cd frontend
pnpm build && PORT=3100 pnpm start
```

Después, en el navegador:

1. Abrí `http://localhost:3100/alumno` en **ventana de incógnito**
2. Tocá **«Descargar para usar sin conexión»**
3. DevTools → Application → Service Workers → verificá que diga **activated**
4. DevTools → Network → **Offline**
5. Andá a `/alumno/practicar` y **recargá**: la app carga igual
6. Resolvé ejercicios — el feedback es inmediato
7. Volvé a **Online**: el indicador cambia solo

---

## Arquitectura

```
Navegador
├── Next.js (App Router)
├── Service Worker (Serwist)  ← cachea el shell: la app ABRE sin red
└── IndexedDB (idb)           ← guarda los datos: la app tiene CONTENIDO sin red
        │
        │  (solo cuando hay conexión)
        ▼
   FastAPI  ──►  Supabase (PostgreSQL + Auth + RLS)
```

### Decisiones que vale la pena explicar

**Una sola superficie offline.** Sin conexión, el alumno vive en una única página
cliente (`/alumno/practicar`) que lee todo de IndexedDB. En el App Router, navegar
entre rutas dispara peticiones de payloads RSC al servidor; cachearlas con un
Service Worker es frágil. Con esta separación, el Service Worker solo precachea
estáticos —que es lo que sabe hacer bien— y los datos salen de la base local.

**Dónde vive la respuesta correcta.** Las claves de corrección viajan al
dispositivo **solo** en modo tarea y práctica, nunca en una evaluación en vivo.
Sin la clave local es imposible corregir sin conexión. La defensa es que, al
sincronizar, **el servidor recalcula** el resultado contra `exercise_keys` e
ignora lo que mandó el cliente: quien manipule IndexedDB solo altera su propio
feedback inmediato, jamás la nota registrada.

**La sesión no se revalida al arrancar sin red.** Validar el token contra Supabase
sin conexión fallaría y mandaría al alumno a la pantalla de login justo cuando más
necesita entrar.

**Los ejercicios se generan con funciones paramétricas, no con IA.** Un modelo de
lenguaje necesita red, y el diferenciador del proyecto es funcionar sin ella.

Documentos de diseño: [`PRD.md`](./PRD.md) ·
[contrato de API](./backend/API_CONTRACT.md) ·
[problemas conocidos](./backend/ISSUES.md)

---

## Estructura

```
backend/            API REST en FastAPI
├── routers/        endpoints HTTP
├── schemas/        validación de entrada (Pydantic)
├── services/       lógica de negocio
└── dependencies/   autenticación y permisos

frontend/
└── src/
    ├── app/            rutas (App Router)
    ├── components/ui/  sistema de diseño
    ├── offline/        IndexedDB, cola de sincronización, estado de red
    └── lib/            cliente de API, tipos

mocks/              diseño de referencia y sistema de diseño
```

---

## Estado

| Funcionalidad | Estado |
|---|---|
| Crear sala y compartir código | ✅ |
| Unirse a una sala | ⚠️ falta `POST /rooms/join` |
| Descargar tarea para offline | ✅ |
| Resolver sin conexión con corrección inmediata | ✅ |
| La app abre sin conexión (PWA) | ✅ |
| Sincronización al recuperar la señal | ⚠️ simulada, falta `POST /answers/bulk` |
| Ejercicios generados por el profesor | ⚠️ semilla local, falta `GET /activities/{id}/package` |
| Panel de resultados del profesor | ❌ faltan los endpoints |

Lo marcado con ⚠️ está señalado con `TODO` en el código y detallado en el
[contrato de API](./backend/API_CONTRACT.md).

---

## Código de terceros

Todo se usa bajo licencias compatibles con MIT y se declara según las bases.

### Frontend

| Librería | Licencia | Para qué |
|---|---|---|
| [Next.js](https://nextjs.org) 16 | MIT | Framework y enrutado |
| [React](https://react.dev) 19 | MIT | Interfaz |
| [Tailwind CSS](https://tailwindcss.com) 4 | MIT | Estilos y tokens de diseño |
| [Serwist](https://serwist.pages.dev) 9 | MIT | Service Worker y PWA |
| [idb](https://github.com/jakearchibald/idb) 8 | ISC | Acceso a IndexedDB |
| [clsx](https://github.com/lukeed/clsx) 2 | MIT | Composición de clases |
| [tailwind-merge](https://github.com/dcastil/tailwind-merge) 3 | MIT | Resolución de clases en conflicto |
| [TypeScript](https://www.typescriptlang.org) 5 | Apache-2.0 | Tipado estático |

### Backend

| Librería | Licencia | Para qué |
|---|---|---|
| [FastAPI](https://fastapi.tiangolo.com) | MIT | Framework de la API |
| [Uvicorn](https://www.uvicorn.org) | BSD-3-Clause | Servidor ASGI |
| [supabase-py](https://github.com/supabase/supabase-py) | MIT | Cliente de Supabase |
| [python-dotenv](https://github.com/theskumar/python-dotenv) | BSD-3-Clause | Variables de entorno |
| [email-validator](https://github.com/JoshData/python-email-validator) | Unlicense | Validación de correos |

### Tipografías

[Outfit](https://fonts.google.com/specimen/Outfit) y
[Plus Jakarta Sans](https://fonts.google.com/specimen/Plus+Jakarta+Sans), ambas
bajo **SIL Open Font License 1.1**. Se sirven desde el propio dominio vía
`next/font`: enlazarlas al CDN de Google las rompería sin conexión.

### Herramientas de IA

Se usó asistencia de IA para programar, expresamente autorizada y recomendada por
las bases (sección 11). Los íconos e ilustraciones de los mocks se generaron con
IA. Todo el código se escribió durante el evento.

---

## Licencia

[MIT](./LICENSE) — como exigen las bases del HaCAIthon.

Las bases oficiales del evento están en [`BASES.md`](./BASES.md).
