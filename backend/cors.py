"""Configuracion de CORS.

Vive en su propio modulo a proposito. Cuando estaba dentro de main.py, el mismo
bloque genero tres conflictos de merge seguidos: es la parte del archivo que mas
manos tocan, y quedo commiteado con marcadores <<<<<<< dos veces, dejando el
backend sin arrancar para todo el equipo.

Aca queda aislado: main.py solo llama a setup_cors(app) y esa linea no cambia.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# El frontend corre en un origen distinto al de la API, asi que sin CORS el
# navegador bloquea todas sus peticiones.
ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:8000",
    "https://eduflow-cai.vercel.app",
]

# Cada despliegue de Vercel estrena una URL con hash
# (eduflow-a1b2c3-sacupdev.vercel.app). Listarlas una por una obligaria a tocar
# el backend en cada deploy, asi que se aceptan por patron, acotado al equipo
# para no abrir la API a cualquier subdominio de vercel.app.
ALLOWED_ORIGIN_REGEX = r"https://[a-z0-9-]+-sacupdev\.vercel\.app"


def setup_cors(app: FastAPI) -> None:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=ALLOWED_ORIGINS,
        allow_origin_regex=ALLOWED_ORIGIN_REGEX,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
