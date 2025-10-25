from django.contrib import admin
from .models import Submission, Result

class ResultInline(admin.StackedInline):
    model = Result
    readonly_fields = ('output', 'outcome')
    can_delete = False
    max_num = 1
    verbose_name_plural = 'Result'

@admin.register(Submission)
class SubmissionAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'problem',
        'author',
        'status',
        'created_at',
    )

    list_filter = ('status', 'problem', 'author__email')
    search_fields = ('author__email', 'problem__title')
    date_hierarchy = 'created_at'

    readonly_fields = (
        'author',
        'problem',
        'solution',
        'created_at',
    )

    inlines = [ResultInline]

    fieldsets = (
        (None, {
            'fields': ('problem', 'author', 'status', 'created_at')
        }),
        ('Solution Code', {
            'classes': ('collapse',),
            'fields': ('solution',)
        }),
    )

@admin.register(Result)
class ResultAdmin(admin.ModelAdmin):
    list_display = ('submission_id', 'outcome', 'get_submission_author')
    list_filter = ('outcome',)
    search_fields = ('submission__author__email', 'submission__problem__title')
    readonly_fields = ('submission', 'output', 'outcome')

    @admin.display(description='Author', ordering='submission__author')
    def get_submission_author(self, obj):
        return obj.submission.author

    @admin.display(description='Submission ID')
    def submission_id(self, obj):
        return obj.submission.id