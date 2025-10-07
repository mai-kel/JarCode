from rest_framework import viewsets
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import serializers
from .models import Course, Chapter, Lesson
from .serializers import CourseSerializer, ChapterSerializer, LessonSerializer
from .permissions import IsOwnerOrReadOnly


class CourseViewSet(viewsets.ModelViewSet):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    permission_classes = [IsOwnerOrReadOnly]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['title', 'owner']

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)


class ChapterViewSet(viewsets.ModelViewSet):
    serializer_class = ChapterSerializer
    permission_classes = [IsOwnerOrReadOnly]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['title']

    def get_queryset(self):
        queryset = Chapter.objects.all()
        course_id = self.kwargs.get('course_pk')
        if course_id:
            queryset = queryset.filter(course_id=course_id)
        return queryset

    def perform_create(self, serializer):
        course_id = self.kwargs.get('course_pk')
        try:
            course = Course.objects.get(pk=course_id)
        except Course.DoesNotExist:
            raise serializers.ValidationError("Course does not exist")

        if course.owner != self.request.user:
            raise serializers.ValidationError("You can only add chapters to your own courses")

        serializer.save(course=course)


class LessonViewSet(viewsets.ModelViewSet):
    serializer_class = LessonSerializer
    permission_classes = [IsOwnerOrReadOnly]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['title']

    def get_queryset(self):
        queryset = Lesson.objects.all()
        chapter_id = self.kwargs.get('chapter_pk')
        if chapter_id:
            queryset = queryset.filter(chapter_id=chapter_id)
        return queryset

    def perform_create(self, serializer):
        chapter_id = self.kwargs.get('chapter_pk')
        try:
            chapter = Chapter.objects.get(pk=chapter_id)
        except Chapter.DoesNotExist:
            raise serializers.ValidationError("Chapter does not exist")

        if chapter.owner != self.request.user:
            raise serializers.ValidationError("You can only add lessons to your own chapters")

        serializer.save(chapter=chapter)
