# Contrato de API — lo que el frontend necesita

> Para quien desarrolle el backend. El frontend ya está construido contra este
> contrato: si respetás estas formas exactas, se conecta sin tocar nada del lado
> del cliente.
>
> **Convención:** todo en `snake_case`, como el resto del backend. El frontend
> hace la conversión en su capa de API — no hace falta que fuerces camelCase en
> Pydantic.
>
> **Auth:** todos los endpoints requieren `Authorization: Bearer <access_token>`.
> El `student_id` / `teacher_id` sale **siempre del JWT**, nunca del body.

---

## Prioridad

| Orden | Endpoint | Por qué |
|---|---|---|
| 1 | `GET /activities/{id}/package` | Sin esto el alumno no tiene ejercicios reales |
| 2 | `POST /answers/bulk` | Sin esto la sincronización es simulada |
| 3 | `POST /rooms/join` | El botón «Unirme» está deshabilitado esperándolo |
| 4 | `GET /rooms/` rama alumno | Hoy un alumno recibe `[]` |
| 5 | `POST /activities` + generador | Para que el profesor arme la actividad |

Con **1 y 2** la demo del alumno deja de ser simulada. Eso es lo urgente.

---

## 1 · `GET /activities/{activity_id}/package`

Devuelve la actividad completa **con las claves de corrección**, para que el
alumno pueda resolverla y corregirse sin conexión.

### Respuesta `200`

```json
{
  "activity_id": "9f1c...",
  "title": "Tabla de multiplicar",
  "subject": "Matemáticas",
  "room_name": "2°B — Álgebra",
  "mode": "homework",
  "exercise_type": "multiple_choice",
  "exercises": [
    {
      "id": "3a2b...",
      "position": 1,
      "prompt": "¿Cuánto es 7 × 8?",
      "options": ["54", "56", "64", "48"],
      "points": 1,
      "correct_answer": "56",
      "explanation": "7 × 8 = 56"
    }
  ]
}
```

- `exercise_type`: **obligatorio**, sale de `activities.exercise_type`. Sin este
  campo el cliente no puede distinguir un ejercicio numérico de uno de texto
  —en ambos `options` llega en `null`— y la pantalla del alumno queda sin forma
  de responder.
- `options`: array de strings en `multiple_choice`; **`null`** en `numeric` y `text`.
- `explanation`: puede ser `null`.
- `exercises` ordenado por `position` ascendente.
- `room_name` sale de `rooms.name` vía `activities.room_id`.

### Reglas de negocio (importantes)

| Situación | Respuesta |
|---|---|
| La actividad no existe | `404` |
| El usuario no es miembro de la sala ni su profesor | `403` |
| `mode == "live"` | **`403`** |

**Por qué se bloquea `live`:** en modo en vivo las claves nunca pueden salir del
servidor, porque es una evaluación. En `homework` y `practice` sí viajan al
dispositivo, y es una decisión deliberada: sin la clave local es **imposible**
corregir sin conexión, y una guía de práctica en casa no tiene el mismo
requisito de secreto que una prueba calificada.

La defensa está en el endpoint 2: el servidor recalcula todo al sincronizar.

---

## 2 · `POST /answers/bulk`

Recibe la cola de respuestas que el alumno resolvió sin conexión.

### Body

```json
{
  "answers": [
    {
      "activity_id": "9f1c...",
      "exercise_id": "3a2b...",
      "submitted_answer": "56",
      "answered_at": "2026-08-14T18:22:03.000Z"
    }
  ]
}
```

`activity_id` viene solo para armar la clave de la respuesta y validar. La tabla
`answers` **no tiene esa columna** — se deriva por `exercises.activity_id`.

### Respuesta `200`

```json
{
  "accepted": ["9f1c...:3a2b...", "9f1c...:7d4e..."]
}
```

`accepted` es una lista de strings con el formato exacto
**`"{activity_id}:{exercise_id}"`**. El frontend usa esa cadena como clave en
IndexedDB para marcar la respuesta como enviada. Si el formato no coincide, la
respuesta queda pendiente para siempre y se reenvía en loop.

Devolvé **solo las que se guardaron bien**. Si una falla, omitila del array: el
cliente la reintenta sola en el próximo evento `online`.

### Lo que tiene que hacer el servidor por cada respuesta

```
1. student_id = current_user.id            (del JWT, nunca del body)
2. Verificar que el alumno pertenece a la sala de esa actividad -> si no, omitir
3. Leer exercise_keys.correct_answer
4. is_correct = (submitted_answer == correct_answer)   <- RECALCULAR, no confiar
5. points_awarded = exercises.points si is_correct, si no 0
6. upsert en answers   (unique(exercise_id, student_id))
7. Sumar "{activity_id}:{exercise_id}" a accepted
```

**El paso 4 es el que sostiene todo el modelo de seguridad.** El cliente manda
su corrección local, pero vos la ignorás y recalculás contra `exercise_keys`.
Así, un alumno que manipule IndexedDB solo se cambia su propio feedback
inmediato, jamás la nota registrada.

**Idempotencia:** el `unique(exercise_id, student_id)` hace que reenviar algo ya
guardado sea inofensivo. Usá `upsert`, no `insert`, porque el cliente reintenta
tras cada corte de red.

---

## 3 · `POST /rooms/join`

Ya existe el schema `RoomJoin` en `schemas/room.py`.

**Body:** `{ "code": "K7M2PQ" }` · **Respuesta `200`:** el objeto `rooms` completo.

```
1. Buscar rooms por code (normalizar a mayúsculas)
2. Si no existe -> 404 con mensaje genérico, sin revelar si el código existe
3. insert en room_members (room_id, user_id del JWT)
4. Si ya era miembro -> 200 igual, es idempotente por unique(room_id, user_id)
```

---

## 4 · `GET /rooms/` — falta la rama del alumno

El fix del commit `f7fd96a` está bien para el profesor, pero **un alumno recibe
`[]`** porque no es `teacher_id` de ninguna sala.

```python
profile = get_profile(current_user.id)   # leer profiles.role

if profile["role"] == "teacher":
    # lo que ya está: .eq("teacher_id", current_user.id)
else:
    # vía room_members:
    admin_supabase.table("room_members").select("rooms(*)").eq("user_id", current_user.id)
```

---

## 5 · `POST /activities` + generador de ejercicios

Para que el profesor arme la actividad. El frontend del profesor todavía no
existe, así que es menos urgente que 1 y 2.

**Body:**

```json
{
  "room_id": "...",
  "title": "Tabla de multiplicar",
  "subject": "Matemáticas",
  "exercise_type": "multiple_choice",
  "difficulty": "medium",
  "mode": "homework",
  "amount": 10
}
```

Genera `amount` ejercicios, guarda enunciados en `exercises` y soluciones en
`exercise_keys`, en una transacción.

### Generador — `services/exercise_service.py` (hoy vacío)

```python
def generate(topic: str, difficulty: str, exercise_type: str, amount: int)
    -> list[tuple[str, str, list[str] | None]]   # (prompt, correct_answer, options)
```

| Tema | Fácil | Media | Difícil |
|---|---|---|---|
| Multiplicación | 1×1 dígito | 2×1 dígitos | 2×2 dígitos |
| Suma / Resta | hasta 2 dígitos | hasta 3 dígitos | con decimales |
| Fracciones | mismo denominador | denominador distinto | mixtas |
| Ecuación lineal | `x + a = b` | `ax + b = c` | `ax + b = cx + d` |

**Distractores:** en `multiple_choice`, que sean errores plausibles (sumar en vez
de multiplicar, error de acarreo), no números al azar. Las 3 incorrectas deben
ser distintas entre sí y de la correcta.

**Sin duplicados** dentro de un mismo set.

> Hay una implementación de referencia en el frontend:
> `frontend/src/lib/seed.ts` — es el respaldo temporal del cliente y se borra
> cuando el endpoint 1 exista. Sirve para ver la forma esperada de los datos.

---

## Cómo probar que quedó bien

```bash
# 1. Levantar backend
cd backend && python -m uvicorn main:app --reload

# 2. Levantar frontend en produccion (el Service Worker no corre en dev)
cd frontend && pnpm build && PORT=3100 pnpm start
```

Si el endpoint 1 funciona, en `/alumno` el botón «Descargar» trae los ejercicios
reales en vez de la semilla.

Si el endpoint 2 funciona, **desaparece el cartel amarillo** que dice
«Sincronización simulada» en `/alumno/practicar`.

Ese cartel es el semáforo: mientras esté visible, la sincronización no llega a
la base y **no se puede presentar como real ante el jurado**.

---

## Recordá los problemas abiertos

`backend/ISSUES.md` tiene el detalle. Siguen sin resolver:

- **S2** — el cliente elige el código de sala (`schemas/room.py:5`)
- **S3** — cualquier alumno puede crear salas, no se valida el rol
- **S4** — `str(e)` filtra errores internos de Postgres al cliente
- **C1** — un fallo de red contra Supabase devuelve `401` en vez de `503`
- **M1** — `test.py:5` borra un usuario con solo importarlo

**C1 importa para el modo offline:** el frontend necesita distinguir «tu sesión
venció» de «no hay conexión». Con `401` en ambos casos, manda al alumno al login
justo cuando debería dejarlo trabajar sin señal.
