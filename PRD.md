# PRD — Plataforma de práctica de matemáticas offline-first

> **HaCAIthon 2026 · Equipo 19 · Temática: Educación Pública**
> Sub-problema atacado: *"material de estudio en zonas con poca conectividad"*
>
> **Ventana de desarrollo:** 12:40 – 17:10 hrs · **Documento escrito:** ~13:30 hrs
> **Nombre del proyecto:** `TBD` — propuestas: *Aula Sin Red*, *Nodo*, *Pizarra Offline*

---

## 1. Resumen ejecutivo

### Problema

Los colegios públicos en zonas con conectividad intermitente no pueden usar las plataformas
educativas existentes (Khan Academy, Google Classroom, Kahoot): **todas asumen conexión
permanente**. El alumno que se lleva la tarea a la casa y no tiene wifi ni datos, simplemente
no puede practicar. El profesor, en paralelo, no tiene forma de asignar práctica dirigida ni
de ver quién avanzó, porque el registro depende de que todos estén online al mismo tiempo.

### Solución

Una aplicación web instalable (PWA) de práctica de matemáticas organizada en salas
profesor–alumno, diseñada para **degradarse con gracia sin conexión**: el alumno descarga la
tarea cuando tiene señal (en el colegio o en un rato de wifi), la resuelve completamente
offline con corrección inmediata, y las respuestas se sincronizan solas cuando la conexión
vuelve. El profesor ve los resultados consolidados en su panel.

### Criterios de éxito (medibles, verificables en la Feria)

| # | Criterio | Meta | Cómo se verifica |
|---|----------|------|------------------|
| E1 | Flujo completo profesor → alumno → resultado | 100% sin tocar la DB a mano | Demo en vivo de punta a punta |
| E2 | Resolución sin conexión | ≥ 5 ejercicios en modo avión, 0 errores en consola | Se apaga el wifi delante del jurado |
| E3 | Sincronización al reconectar | < 5 s desde que vuelve la red | Cronómetro en la demo |
| E4 | Carga de la app sin red (2.ª visita) | < 2 s desde caché del Service Worker | DevTools → Network: Offline |
| E5 | Motor de ejercicios | ≥ 4 tipos × 3 dificultades, 0 duplicados en un set de 10 | Test unitario del generador |

---

## 2. Experiencia de usuario y funcionalidad

### Personas

**Marta — Profesora de matemáticas, 45 años.** Colegio municipal, 32 alumnos por curso.
Conexión inestable en la sala. No es técnica: si la herramienta requiere instalar algo o
configurar servidores, no la usa. Hoy fotocopia guías y corrige a mano los domingos.

**Camila — Alumna, 14 años.** Celular Android de gama baja, plan de prepago con datos
limitados. En su casa no hay wifi. Puede bajar cosas en el colegio, pero en la noche —
cuando hace la tarea — está completamente sin conexión.

### Historias de usuario (INVEST) y criterios de aceptación

**HU-1 · Profesor crea una sala**
> Como profesora, quiero crear una sala y obtener un código corto, para que mis alumnos se
> unan sin que yo tenga que cargar sus datos uno por uno.

- [ ] Al crear la sala se genera un código único de 6 caracteres, legible en voz alta (sin `0/O`, `1/I/L`)
- [ ] La sala queda asociada al `teacher_id` del JWT, nunca a un id enviado por el cliente
- [ ] El código se muestra en pantalla en tamaño grande, proyectable

**HU-2 · Alumno se une con el código**
> Como alumna, quiero unirme con un código para que la clase quede guardada en mi cuenta y
> no tenga que buscarla de nuevo.

- [ ] Ingresar el código válido crea el registro en `room_members`
- [ ] Un código inválido muestra error claro, sin exponer si la sala existe o no
- [ ] Unirse dos veces a la misma sala no duplica el registro (`unique(room_id, user_id)`)
- [ ] La sala aparece en "Mis clases" en visitas posteriores

**HU-3 · Profesor crea una actividad**
> Como profesora, quiero generar un set de ejercicios eligiendo tema, tipo, dificultad y
> cantidad, para no tener que escribirlos a mano.

- [ ] Selector de: materia, tipo (`multiple_choice` / `numeric`), dificultad, cantidad, modalidad
- [ ] El backend genera N ejercicios y guarda enunciados en `exercises` y soluciones en `exercise_keys`
- [ ] La actividad queda en estado `draft` hasta que la profesora la activa

**HU-4 · Alumno descarga la tarea para hacerla sin conexión** ⭐ *diferenciador*
> Como alumna, quiero descargar la tarea mientras tengo señal, para poder resolverla de
> noche en mi casa donde no hay wifi.

- [ ] Botón explícito "Descargar para usar sin conexión" en actividades de modo `homework`/`practice`
- [ ] Al tocarlo, los ejercicios se persisten en IndexedDB y el Service Worker cachea el shell de la app
- [ ] Un indicador visible muestra "Disponible sin conexión ✓" una vez descargada
- [ ] Cerrando la app y sin red, la tarea sigue accesible

**HU-5 · Alumno resuelve offline con feedback inmediato** ⭐ *diferenciador*
> Como alumna, quiero saber al instante si respondí bien, aunque no tenga internet, para
> poder aprender del error en el momento.

- [ ] Sin conexión, responder marca correcto/incorrecto de inmediato (corrección local)
- [ ] La respuesta se guarda en IndexedDB con `pendingSync: true`
- [ ] La app nunca muestra pantalla de error de red durante el flujo offline
- [ ] El progreso sobrevive a cerrar y reabrir el navegador

**HU-6 · Sincronización automática al reconectar** ⭐ *diferenciador*
> Como alumna, quiero que mis respuestas se envíen solas cuando vuelva a tener señal, para
> no tener que acordarme de hacer nada.

- [ ] Al dispararse el evento `online`, la cola pendiente se envía al backend
- [ ] Cada respuesta sincronizada pasa a `pendingSync: false`
- [ ] Un fallo de red durante el envío reintenta sin perder datos ni duplicar (idempotencia por `unique(exercise_id, student_id)`)
- [ ] Indicador visible: "N respuestas pendientes de enviar"

**HU-7 · Profesor ve resultados**
> Como profesora, quiero ver quién resolvió qué y con qué porcentaje de acierto, para saber
> a quién reforzar sin corregir a mano.

- [ ] Tabla alumnos × actividad con % de acierto y cantidad respondida
- [ ] Se distingue visualmente "aún no sincronizado" de "no respondió"

### No-objetivos (fuera de alcance HOY — protegen el reloj)

- ❌ **Realtime** (Supabase Realtime, WebSockets, dashboard en vivo)
- ❌ **Generación de ejercicios con IA** — ver §3
- ❌ **Servidor LAN en el PC del profesor** — el offline-first ya cubre el caso del aula sin señal (mismo `navigator.onLine === false`)
- ❌ **Aplicación de escritorio** (Electron/Tauri)
- ❌ **Subida de archivos/material propio del profesor**
- ❌ Recuperación de contraseña, verificación de email, perfiles editables
- ❌ Resolución de conflictos de sincronización complejos (actividad cerrada mientras el alumno estaba offline)

---

## 3. Motor de ejercicios (decisión: sin IA)

**Se descarta la generación con LLM para hoy.** No es una limitación técnica sino una
decisión de arquitectura alineada con el problema:

1. **Un LLM requiere red.** El diferenciador del proyecto es funcionar sin red. Un generador
   que exige conexión contradice la tesis central del pitch.
2. **Latencia y no-determinismo en la demo.** Una llamada que tarda o alucina un enunciado
   mal formado frente al jurado cuesta más de lo que suma.
3. **Costo cero y offline nativo.** Funciones paramétricas en Python generan sets infinitos
   sin API key ni latencia.

### Diseño del generador

```
generate(topic, difficulty, exercise_type, amount) -> [(prompt, correct_answer, options?)]
```

| Tema | Fácil | Media | Difícil |
|------|-------|-------|---------|
| Multiplicación | 1 dígito × 1 dígito | 2 × 1 dígitos | 2 × 2 dígitos |
| Suma/Resta | hasta 2 dígitos | hasta 3 dígitos | con decimales |
| Fracciones | mismo denominador | denominador distinto | mixtas |
| Ecuación lineal | `x + a = b` | `ax + b = c` | `ax + b = cx + d` |

### Estrategia de evaluación de calidad

- **Test unitario:** un set de 10 ejercicios no contiene duplicados (E5)
- **Test de correctitud:** la solución declarada se re-verifica calculándola independientemente
- **Test de distractores:** en `multiple_choice`, las 3 opciones incorrectas son distintas entre sí y de la correcta
- **Test de rango:** los operandos generados respetan el rango declarado por dificultad

---

## 4. Especificación técnica

### Stack (confirmado)

| Capa | Tecnología | Estado |
|------|-----------|--------|
| Frontend | **Next.js 16 (App Router) + TypeScript** | ⚠️ A construir desde cero |
| Offline | `@serwist/next@9.5.12` (Service Worker) + `idb@8.0.3` (IndexedDB) | A construir |
| Backend | **Python + FastAPI** | ✅ Auth, JWT, rooms parciales funcionando |
| Base de datos / Auth | **Supabase** (PostgreSQL + Auth + RLS) | ✅ Tablas, usuarios y RLS operativos |

### Arquitectura

```
┌─────────────────────────────────────────┐
│  Navegador del alumno                   │
│  ┌───────────────────────────────────┐  │
│  │ Next.js (App Router, client-side) │  │
│  └───────────────┬───────────────────┘  │
│                  │                       │
│  ┌───────────────▼───────────────────┐  │
│  │ Service Worker (Serwist)          │  │  ← cachea el shell de la app
│  └───────────────┬───────────────────┘  │
│                  │                       │
│  ┌───────────────▼───────────────────┐  │
│  │ IndexedDB (idb)                   │  │  ← ejercicios + cola de respuestas
│  │  · exercises_cache                │  │
│  │  · pending_answers                │  │
│  └───────────────┬───────────────────┘  │
└──────────────────┼──────────────────────┘
                   │ (solo cuando hay red)
                   ▼
        ┌──────────────────────┐
        │ FastAPI              │  ← corrección oficial, permisos, generación
        └──────────┬───────────┘
                   ▼
        ┌──────────────────────┐
        │ Supabase             │  ← Postgres + Auth + RLS
        └──────────────────────┘
```

### ⚠️ Decisión crítica: ¿dónde vive la respuesta correcta?

El diseño original (`idea.txt` §10) separa `exercise_keys` de `exercises` justamente para que
la solución **nunca** llegue al navegador. Es correcto para un examen — y es **incompatible
con la corrección offline**: sin backend alcanzable, nadie puede corregir.

**Resolución: la modalidad de la actividad determina el modelo de confianza.**

| Modalidad | ¿Viajan las claves al dispositivo? | Corrección | ¿Funciona offline? |
|-----------|-----------------------------------|-----------|-------------------|
| `live` (en vivo) | **No**, server-only | Backend | No |
| `homework` (tarea) | Sí, en el paquete de descarga | Local, inmediata | **Sí** |
| `practice` (práctica) | Sí, en el paquete de descarga | Local, inmediata | **Sí** |

**Defensa en profundidad:** al sincronizar, el backend **recalcula** `is_correct` contra
`exercise_keys` y **sobrescribe** lo que envió el cliente. El campo `points_awarded` oficial
siempre lo calcula el servidor. Un alumno que manipule IndexedDB solo altera su propio
feedback inmediato, nunca la nota registrada.

El razonamiento es de modelo de amenaza, no de descuido: una guía de práctica en casa no
tiene el mismo requisito de secreto que una evaluación calificada.

### Puntos de integración

- `POST /auth/login` · `POST /auth/register` · `GET /auth/me`
- `POST /rooms` · `GET /rooms/mine` · `POST /rooms/join` · `GET /rooms/{id}/students`
- `POST /activities` (genera ejercicios) · `PATCH /activities/{id}/start`
- `GET /activities/{id}/package` ⭐ **nuevo** — devuelve ejercicios + claves para descarga offline
- `POST /answers/bulk` ⭐ **nuevo** — recibe la cola pendiente, revalida y persiste (idempotente)
- `GET /activities/{id}/results`

### Seguridad y privacidad

- La **Secret Key de Supabase vive solo en el backend**, nunca en el bundle de Next.js
- `.env` en `.gitignore` — el repositorio es público (requisito de las bases)
- El `teacher_id`/`student_id` siempre se deriva del JWT, jamás del body de la petición
- `GET /activities/{id}/package` verifica que el solicitante sea miembro de la sala y que la modalidad no sea `live`
- Datos de menores de edad: solo nombre y correo institucional; sin datos sensibles

---

## 5. Riesgos y hoja de ruta

### Riesgos técnicos

| # | Riesgo | Prob. | Impacto | Mitigación |
|---|--------|-------|---------|-----------|
| R1 | **Serwist no corre con Turbopack** (default en Next 16) | Alta | Media | Levantar dev con `next dev --webpack`. El build de producción sí funciona. Existe `@serwist/turbopack` como alternativa |
| R2 | **Auth de Supabase exige red** → el alumno offline no puede ni entrar | Alta | **Crítico** | La sesión se persiste en `localStorage`; la app arranca confiando en la sesión cacheada sin revalidar contra Supabase cuando `navigator.onLine === false` |
| R3 | **Frontend completo desde cero** en el tiempo restante | Alta | **Crítico** | Priorización MoSCoW estricta + freeze a las 16:40 (ver §6) |
| R4 | Service Worker cachea una versión vieja y la demo muestra algo obsoleto | Media | Alta | `skipWaiting` + `clientsClaim`; probar SIEMPRE en ventana de incógnito |
| R5 | RLS bloquea consultas (ya les pasó) | Media | Media | El backend usa el cliente admin; el frontend nunca consulta Supabase directo |
| R6 | Dos servidores corriendo (Next + FastAPI) complican el demo | Media | Media | Script único de arranque; CORS configurado desde el minuto 0 |

### Hoja de ruta por fases

**MVP (hoy, 17:10)** — Salas + actividades + resolución offline + sincronización

**v1.1 (post-hackathon)** — Realtime para modo `live`; racha y gamificación estilo Duolingo;
estadísticas por tema para detectar debilidades del curso

**v2.0** — Generación adaptativa (la dificultad se ajusta al rendimiento); material propio
del profesor (subida de archivos); modo servidor LAN para el aula sin WAN

---

## 6. Análisis de viabilidad

### Presupuesto de tiempo — el dato duro

```
13:30 (ahora)  ────────────────────────────────►  17:10 (entrega)
                    3 h 40 min restantes
                              │
                   menos 30 min de demo/README/deploy
                              ▼
                    ≈ 3 h 10 min de código real
```

### Punto de partida

| Componente | Estado | Trabajo restante |
|-----------|--------|-----------------|
| Supabase (tablas, RLS, usuarios) | ✅ Operativo | — |
| FastAPI (auth, JWT, rooms) | ✅ Parcial | Endpoints de activities/exercises/answers |
| Motor de ejercicios | ❌ | ~40 min |
| **Frontend completo** | ❌ **Cero** | **El cuello de botella** |
| Capa offline (SW + IndexedDB + cola) | ❌ | ~90 min |

### Priorización MoSCoW

**MUST — sin esto no hay demo (meta: 15:30)**
- M1 · Scaffold Next.js 16 + TS + rutas base
- M2 · Login/registro funcional (profesor y alumno)
- M3 · Profesor crea sala y ve el código
- M4 · Alumno se une con el código
- M5 · Profesor crea actividad (con generador)
- M6 · Alumno resuelve online y ve resultado
- M7 · Profesor ve la tabla de resultados

**SHOULD — el diferenciador del pitch (meta: 16:40)**
- S1 · Service Worker cachea el shell (app abre sin red)
- S2 · Descargar tarea a IndexedDB
- S3 · Resolver offline con corrección local
- S4 · Cola de sincronización al reconectar

**COULD — solo si sobra**
- C1 · Indicador visual online/offline · C2 · Instalable como PWA (manifest + iconos)

**WON'T — hoy no** → todo lo listado en §2 No-objetivos

### Reparto del equipo (4 personas)

> **Minutos 0–15: una sola persona scaffoldea Next.js y lo pushea.** Los otros 3 leen este
> PRD y preparan su parte. Si los 4 scaffoldean en paralelo, se pisan y pierden 30 minutos.

| | Bloque 1 (→15:30) — MUST | Bloque 2 (→16:40) — SHOULD |
|---|---|---|
| **P1** | Scaffold + login/registro + UI profesor (crear sala, dashboard) | Tabla de resultados + pulido visual |
| **P2** | UI alumno (unirse, mis clases, resolver ejercicios) | Integrar UI con la capa offline |
| **P3** | Backend: activities, exercises, answers, join, results | `GET /package` + `POST /answers/bulk` con revalidación |
| **P4** | Motor de ejercicios (Python puro, sin dependencias) | **Capa offline**: `db.ts`, `sync.ts`, `useOnline.ts` |

**Módulos profundos aislables** (se construyen y prueban sin esperar a nadie):
`offline/db.ts` (wrapper de IndexedDB), `offline/sync.ts` (cola), `services/exercise_service.py`
(generador). P4 puede trabajar las 3h sin bloquearse contra el frontend.

### Camino crítico y riesgo de serialización

```
Scaffold ──► UI base ──► UI resolver ejercicios ──► integrar offline ──► DEMO
   15min       45min            60min                    45min
```

La capa offline **depende** de que exista la UI de resolver ejercicios. Ese es el riesgo
número uno del día: si M6 no está listo a las 15:30, **S1–S4 no entran** y el proyecto pierde
su diferenciador. Por eso P4 construye la capa offline como módulo aislado en paralelo y solo
la conecta al final.

### Veredicto honesto

| Alcance | ¿Entra en 3 h 10 min? | Comentario |
|---------|----------------------|------------|
| Solo MUST | **Sí, con holgura** | Backend ya avanzado; 4 personas alcanzan de sobra |
| MUST + SHOULD | **Sí, pero ajustado** | Es la apuesta correcta: SHOULD *es* el proyecto |
| MUST + SHOULD + COULD | Improbable | Solo si el Bloque 1 cierra antes de las 15:00 |
| Todo lo que se habló (LAN + escritorio + IA + archivos) | **No. Descartado** | Serían 3 arquitecturas de red en paralelo |

**Recomendación:** comprometerse con MUST + SHOULD y **congelar a las 16:40**. Media hora de
preparación de demo vale más que una feature a medio terminar: *Ejecución y funcionamiento*
pesa 20% y una demo que se cae anula el 25% de *Viabilidad técnica*.

### Cobertura de los criterios de evaluación

| Criterio | Peso | Cómo lo cubre este plan |
|----------|------|------------------------|
| Impacto y relevancia social | 25% | Ataca un problema real y verificable: práctica sin conectividad en colegios públicos. Patrón validado por Kolibri y RACHEL en escuelas rurales |
| Viabilidad técnica | 25% | Stack ya operativo; decisiones documentadas (claves por modalidad, revalidación server-side); dependencias verificadas y vigentes |
| Ejecución y funcionamiento | 20% | MoSCoW + freeze a las 16:40 protegen que lo mostrado funcione |
| Innovación y creatividad | 15% | Offline-first real con corrección local y cola de sincronización — no es lo que hacen las plataformas existentes |
| Comunicación | 15% | La demo es física y contundente: se apaga el wifi en vivo, la app sigue andando, se prende y sincroniza sola |

---

## 7. Cumplimiento de las bases

- [x] Licencia OSI (MIT) con archivo `LICENSE` en la raíz
- [ ] Repositorio público en GitHub con todo el proyecto
- [ ] Nombre del proyecto definido e indicado en el repositorio
- [ ] Librerías de terceros declaradas (Next.js, Serwist, idb, FastAPI, Supabase)
- [x] Uso de IA para programar (autorizado y recomendado por las bases)
- [ ] Entrega antes de las 17:10
