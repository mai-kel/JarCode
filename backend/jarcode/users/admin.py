from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = (
        'email',
        'first_name',
        'last_name',
        'is_content_creator',
        'is_staff',
        'is_active',
    )

    list_filter = (
        'is_active',
        'is_staff',
        'is_superuser',
        'is_content_creator',
    )

    search_fields = ('email', 'first_name', 'last_name')
    ordering = ('email',)

    fieldsets = (
        (None, {
            'fields': ('email', 'password')
        }),
        ('Informacje osobiste', {
            'fields': ('first_name', 'last_name')
        }),
        ('Uprawnienia', {
            'fields': (
                'is_active',
                'is_staff',
                'is_superuser',
                'is_content_creator',
                'groups',
                'user_permissions'
            )
        }),
        ('Ważne daty', {
            'fields': ('last_login', 'date_joined', 'uuid')
        }),
    )

    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': (
                'email',
                'password',
                'password2',
                'first_name',
                'last_name',
                'is_content_creator'
            ),
        }),
    )

    readonly_fields = ('last_login', 'date_joined', 'uuid')
    filter_horizontal = ('groups', 'user_permissions',)