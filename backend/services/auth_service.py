from database import supabase
from database_secret import admin_supabase


def login_user(email: str, password: str):

    response = supabase.auth.sign_in_with_password({
        "email": email,
        "password": password
    })

    return response

def register_user(email: str, password: str, name: str, role: str, email_confirm: True):

    response = admin_supabase.auth.admin.create_user({ #esta wea puede fallar por el limite de emails por hora de supabase
        "email": email,
        "password": password,
        "email_confirm": True
    })

    user = response.user

    if user is None:
        return None

    admin_supabase.table("profiles").insert({
        "id": user.id,
        "name": name,
        "role": role
    }).execute()

    return response
