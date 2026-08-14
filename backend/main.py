from fastapi import FastAPI

from cors import setup_cors
from routers import auth, rooms, activities, answers

app = FastAPI(
    title="Education API",
    version="0.1.0"
)

# Los origenes permitidos viven en cors.py: ese bloque genero tres conflictos
# de merge seguidos cuando estaba aca.
setup_cors(app)

app.include_router(auth.router)
app.include_router(rooms.router)
app.include_router(activities.router)
app.include_router(answers.router)


@app.get("/")
def root():
    return {"message": "API funcionando"}
