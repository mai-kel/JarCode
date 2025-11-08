from django.urls import path, include
from rest_framework_nested import routers
from .views import CourseViewSet, ChapterViewSet, LessonViewSet, upload_lesson_image

router = routers.DefaultRouter()
router.register(r'courses', CourseViewSet, basename='course')

# Chapters nested under courses
courses_router = routers.NestedDefaultRouter(router, r'courses', lookup='course')
courses_router.register(r'chapters', ChapterViewSet, basename='course-chapters')

# Lessons nested under chapters
chapters_router = routers.NestedDefaultRouter(courses_router, r'chapters', lookup='chapter')
chapters_router.register(r'lessons', LessonViewSet, basename='chapter-lessons')

urlpatterns = [
    path('', include(router.urls)),
    path('', include(courses_router.urls)),
    path('', include(chapters_router.urls)),
    path('lessons/upload-image/', upload_lesson_image, name='upload-image'),
]
