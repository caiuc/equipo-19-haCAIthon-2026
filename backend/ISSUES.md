# Problemas detectados en el backend

> Revisión del 14/08/2026. **Todos estos problemas están presentes en el código actual**
> (se revirtió el endurecimiento porque tumbó la API — ver nota al final).
> Las referencias `archivo:linea` apuntan al estado actual de `main`.

---

## 🔴 Bloqueantes — frenan al equipo de frontend

### B1 · No hay CORS configurado
**Dónde:** `main.py` (ausente)

El frontend Next.js corre en `localhost:3000` y la API en `localhost:8000`. Son
orígenes distintos, así que **el navegador va a bloquear toda petición del frontend**.
No falla en el backend: falla en el navegador, con un mensaje que no es obvio de leer.

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### B2 · No existe `requirements.txt`
**Dónde:** `backend/` (ausente)

Nadie más puede levantar el backend en su máquina. Además las bases del HaCAIthon
piden declarar las librerías de terceros.

```
fastapi
uvicorn[standard]
supabase
python-dotenv
email-validator
```

---

## 🔴 Seguridad

### S1 · `GET /rooms/` no filtra por usuario
**Dónde:** `routers/rooms.py:19`

```python
response = (supabase.table("rooms").select("*").execute())
```

Está roto en las dos direcciones:

- **Hoy:** usa el cliente anónimo sin sesión, RLS lo bloquea y **devuelve `[]` siempre**.
  Es el mismo problema de RLS que ya habían diagnosticado.
- **Si se "arregla"** cambiando a `admin_supabase` sin filtrar: pasa a devolver **todas
  las salas de todos los profesores, con sus códigos**. Cualquier alumno podría unirse
  a cualquier clase del sistema.

**Fix:** leer el rol desde `profiles` y ramificar — profesor ve `rooms where teacher_id = él`,
alumno ve las suyas vía `room_members`.

### S2 · El código de sala lo elige el cliente
**Dónde:** `schemas/room.py:5` y `routers/rooms.py:33`

```python
class RoomCreate(BaseModel):
    code: str          # <- viene del cliente
    name: str
    status: str = "active"
```

El cliente puede elegir el código, colisionar con salas existentes u ocupar códigos a
propósito. Además saltea el generador que ya está en el `default` de la tabla.

**Fix:** sacar `code` (y `status`) de `RoomCreate` y generarlo en el servidor. Conviene
un alfabeto sin caracteres ambiguos (`0/O`, `1/I/L`) porque el código se dicta en voz
alta en la sala, y usar `secrets` en vez de `random` porque es la única credencial para
entrar. Reintentar si el `unique(code)` rechaza el insert.

### S3 · Cualquier alumno puede crear salas
**Dónde:** `routers/rooms.py:27`

```python
current_user=Depends(get_current_user)
```

El JWT prueba **quién sos**, no **qué podés hacer**. No se valida `profiles.role == 'teacher'`
en ningún lado.

**Fix:** una dependencia `require_teacher` que lea el perfil y devuelva 403 si no es profesor.

### S4 · Se filtran errores internos al cliente
**Dónde:** `routers/rooms.py:40,43` y `routers/auth.py:63`

```python
print("ERROR AL CREAR ROOM:", repr(e))
raise HTTPException(status_code=400, detail=str(e))
```

`str(e)` devuelve el error crudo de Postgres/Supabase, que expone nombres de tablas y
restricciones. En `/auth/register` es peor: revela si un email ya está registrado, lo
que permite **enumerar usuarios**.

**Fix:** `logger.exception(...)` para el detalle y un mensaje genérico al cliente.
Reemplazar `print()` por `logging`.

---

## 🟠 Mina antipersona

### M1 · `test.py` borra un usuario con solo importarlo
**Dónde:** `test.py:5`

```python
admin_supabase.auth.admin.delete_user("ce3591e2-bc41-4e4d-8deb-e2e6b40db8e3")
```

Está a nivel de módulo, sin guarda. Cualquiera que abra o corra el archivo por
curiosidad borra ese usuario — y con `on delete cascade` se lleva puesto todo lo que
cuelgue de él.

**Fix:** ponerlo bajo `if __name__ == "__main__"` y recibir el UUID por argumento.
Renombrarlo a algo que no sugiera "correme" (`delete_user.py`).

---

## 🟡 Calidad

### C1 · El `except` se traga tu propio `HTTPException`
**Dónde:** `dependencies/auth.py:15-30`

```python
try:
    response = supabase.auth.get_user(token)
    if response.user is None:
        raise HTTPException(401, "Token inválido")   # <- lo captura...
    return response.user
except Exception:                                     # <- ...este except
    raise HTTPException(401, "No autorizado")
```

El `raise` de la línea 19 nunca llega al cliente: lo atrapa el `except Exception` de
abajo. En este caso ambos devuelven 401, así que no se nota, pero el patrón es una
trampa.

Más grave: **si Supabase no responde por falta de red, devuelve 401 "No autorizado"**.
Para la funcionalidad offline eso es un problema real — el frontend no puede distinguir
"tu sesión venció" (hay que volver a loguearse) de "no hay conexión" (hay que entrar en
modo offline), y termina mandando al alumno a la pantalla de login cuando debería
dejarlo trabajar.

**Fix:** sacar los `raise` propios fuera del `try`, y separar la excepción de token
inválido (→ 401) de un fallo de red (→ 503).

> ⚠️ **OJO ACÁ:** el intento anterior de arreglar esto usó
> `from supabase import AuthApiError`, y **esa es la causa más probable de que la API
> dejara de arrancar**. Ese símbolo existe en supabase 2.31.0, pero puede no estar en
> versiones anteriores. Antes de usarlo, verificar con:
> ```bash
> python -c "import supabase; print(supabase.__version__)"
> python -c "from supabase import AuthApiError; print('ok')"
> ```
> Si falla, capturar por nombre de clase sin importar el símbolo:
> ```python
> except Exception as error:
>     if type(error).__name__ == "AuthApiError":
>         ...  # 401
>     ...      # 503
> ```

### C2 · Anotación de tipo inválida
**Dónde:** `services/auth_service.py:14`

```python
def register_user(..., email_confirm: True):
```

`True` es un **valor**, no un tipo. Debería ser `email_confirm: bool = True`. Además el
parámetro no se usa: adentro está hardcodeado `"email_confirm": True`.

### C3 · `register_user` deja usuarios huérfanos
**Dónde:** `services/auth_service.py:27-31`

Si el insert en `profiles` falla, el usuario ya quedó creado en `auth.users`. Resultado:
una cuenta que puede loguearse pero **sin fila en `profiles`**, así que ninguna ruta sabe
qué rol tiene. Difícil de detectar y de depurar.

**Fix:** envolver el insert en `try/except` y hacer `admin_supabase.auth.admin.delete_user(user.id)`
si falla, antes de re-lanzar.

### C4 · Ruido y config
- `main.py` tiene ~25 líneas comentadas de scripts para crear y borrar usuarios.
- `main.py:3` importa `activities, answers`, que son módulos vacíos.
- `routers/rooms.py:8` importa `supabase` y `HTTPException` sin usarlos del todo.
- `__pycache__` no estaba en `.gitignore` (ya corregido).

---

## ✅ Lo que está bien y no hay que tocar

- **`.env` correctamente ignorado** — la Secret Key nunca sale del backend.
- **La separación cliente normal / cliente admin** está bien pensada.
- **`teacher_id` se deriva del JWT y no del body** (`routers/rooms.py:30`) — este es
  justo el error que comete todo el mundo, y acá está bien resuelto.
- Estructura `routers/schemas/services/dependencies` limpia.

---

## Estado pendiente

Vacíos y sin implementar: `routers/activities.py`, `routers/answers.py`,
`schemas/activity.py`, `schemas/answer.py`, `services/exercise_service.py`.
Los routers de activities y answers están comentados en `main.py:12-13`.

## Nota sobre el revert

El commit `787b66f` corregía B1, B2, S1–S4, M1 y C1–C4, con smoke test en verde
(7/7, incluida la verificación de CORS). Se revirtió en `37d8cc5` porque la API dejó de
funcionar en la máquina de desarrollo. **La causa no está confirmada**; la sospecha
principal es el import de `AuthApiError` descrito en C1. El diff completo de las
correcciones está en `git show 787b66f`.
