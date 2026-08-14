from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import auth, rooms, activities

app = FastAPI(
    title="Education API",
    version="0.1.0"
)

# El frontend corre en otro origen que la API, asi que sin CORS el navegador
# bloquea todas sus peticiones. Se permiten los origenes locales de desarrollo
# y los despliegues del equipo en Vercel.
ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:8000",
    "https://eduflow-cai.vercel.app",
]

# Cada despliegue de Vercel estrena una URL con hash
# (eduflow-a1b2c3-sacupdev.vercel.app). Listarlas una por una obligaria a tocar
# el backend en cada deploy, asi que se aceptan por patron, acotado al equipo.
ALLOWED_ORIGIN_REGEX = r"https://[a-z0-9-]+-sacupdev\.vercel\.app"

app.add_middleware(
    CORSMiddleware,
<<<<<<< HEAD
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000"
    ],
=======
    allow_origins=ALLOWED_ORIGINS,
    allow_origin_regex=ALLOWED_ORIGIN_REGEX,
>>>>>>> eb9e079e5d4b4fafca9507450265945d99099015
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(rooms.router)
app.include_router(activities.router)

@app.get("/")
def root():
    return {"message": "API funcionando"}



#from database_secret import admin_supabase

#Agregar estudiante


#response = admin_supabase.auth.admin.create_user({
#    "email": "profesor1@test.cl",
#    "password": "password123",
#    "email_confirm": True
#})
#
#student_id = response.user.id
#
#print(student_id)
#
#admin_supabase.table("profiles").insert({
#    "id": student_id,
#    "name": "Profesor Christian",
#    "role": "teacher"
#}).execute()


# Eleminar auth.user

#admin_supabase.auth.admin.delete_user("1841e8e6-9a08-468a-aa98-34bd2a4482fa")
