from fastapi import FastAPI

from routers import auth, rooms, activities, answers

app = FastAPI(
    title="Education API",
    version="0.1.0"
)

app.include_router(auth.router)
app.include_router(rooms.router)
#app.include_router(activities.router)
#app.include_router(answers.router)


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
