import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import auth, rooms

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s [%(name)s] %(message)s",
)

app = FastAPI(
    title="Education API",
    version="0.1.0"
)

# El frontend Next.js corre en el puerto 3000 y la API en el 8000: son origenes
# distintos, asi que sin CORS el navegador bloquea toda peticion del frontend.
ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(rooms.router)

# TODO(P3): activities y answers todavia no existen.
# Descomentar cuando routers/activities.py y routers/answers.py tengan su router.
# from routers import activities, answers
# app.include_router(activities.router)
# app.include_router(answers.router)


@app.get("/")
def root():
    return {"message": "API funcionando"}
