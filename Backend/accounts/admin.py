from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser

@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    add_fieldsets = (
        (None, {
            "classes": ("wide",),
            "fields": ("username", "email", "password1", "password2", "first_name", "last_name", "role"),
        }),
    )
    fieldsets = (
        (None, {"fields": ("username", "email", "password")}),
        ("Profile", {"fields": ("resume", "jobs_posted")}),
        ("Permissions", {"fields": ("is_active", "is_staff", "is_superuser", "groups", "user_permissions")}),
        ("Dates", {"fields": ("date_joined",)}),
    )
    list_display = ("id", "username", "email", "is_staff", "is_active","first_name","last_name","role","date_joined")
    search_fields = ("username", "email")
