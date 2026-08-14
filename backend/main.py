from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import auth, rooms, activities

app = FastAPI(
    title="Education API",
    version="0.1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000"
    ],
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
