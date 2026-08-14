#Eleminar auth.user

from database_secret import admin_supabase

admin_supabase.auth.admin.delete_user("ce3591e2-bc41-4e4d-8deb-e2e6b40db8e3")
