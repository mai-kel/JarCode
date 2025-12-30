from django.contrib import admin
from .models import Problem


@admin.register(Problem)
class ProblemAdmin(admin.ModelAdmin):
    list_display = (
        'title',
        'author',
        'language',
        'difficulty',
        'created_at',
    )

    list_filter = ('difficulty', 'language', 'author__email')
    search_fields = ('title', 'author__email')
    date_hierarchy = 'created_at'

    readonly_fields = ('created_at',)
    autocomplete_fields = ('author',)

    fieldsets = (
        (None, {
            'fields': ('title', 'author', 'difficulty', 'language')
        }),
        ('Description', {
            'classes': ('collapse',),
            'fields': ('description',)
        }),
        ('Code', {
            'fields': ('starting_code', 'test_code')
        }),
    )
