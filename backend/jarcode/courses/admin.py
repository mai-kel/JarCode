from django.contrib import admin
from .models import Course, Chapter, Lesson, LessonImage


class LessonImageInline(admin.TabularInline):
    model = LessonImage
    extra = 1
    readonly_fields = ('owner',)


@admin.register(Lesson)
class LessonAdmin(admin.ModelAdmin):
    list_display = ('title', 'chapter', 'owner')
    search_fields = ('title', 'content', 'chapter__title')
    list_filter = ('chapter__course__owner',)
    readonly_fields = ('owner',)
    inlines = [LessonImageInline]


class LessonInline(admin.StackedInline):
    model = Lesson
    extra = 1
    show_change_link = True
    readonly_fields = ('owner',)


@admin.register(Chapter)
class ChapterAdmin(admin.ModelAdmin):
    list_display = ('title', 'course', 'owner')
    search_fields = ('title', 'course__title')
    list_filter = ('course__owner',)
    readonly_fields = ('owner',)
    inlines = [LessonInline]


class ChapterInline(admin.StackedInline):
    model = Chapter
    extra = 1
    show_change_link = True
    readonly_fields = ('owner',)


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ('title', 'owner')
    search_fields = ('title', 'description', 'owner__email')
    list_filter = ('owner',)
    inlines = [ChapterInline]


@admin.register(LessonImage)
class LessonImageAdmin(admin.ModelAdmin):
    list_display = ('id', 'lesson', 'owner', 'image')
    list_select_related = ('lesson', 'lesson__chapter__course')
    search_fields = ('lesson__title',)
    readonly_fields = ('owner',)
