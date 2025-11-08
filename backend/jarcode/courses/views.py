from rest_framework import viewsets
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import serializers
from django.db.models import Max
from django.db import transaction
from .models import Course, Chapter, Lesson
from .serializers import CourseSerializer, ChapterSerializer, LessonSerializer
from .permissions import IsOwnerOrReadOnly
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .serializers import LessonImageSerializer


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

        with transaction.atomic():
            try:
                course = Course.objects.select_for_update().get(pk=course_id)
            except Course.DoesNotExist:
                raise serializers.ValidationError("Course does not exist")

            if course.owner != self.request.user:
                raise serializers.ValidationError(
                    "You can only add chapters to your own courses"
                )

            max_position = Chapter.objects.filter(
                course=course).aggregate(Max('position'))['position__max']
            next_position = (max_position or 0) + 1

            serializer.save(course=course, position=next_position)


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

        with transaction.atomic():
            try:
                chapter = Chapter.objects.select_for_update().get(
                    pk=chapter_id
                )
            except Chapter.DoesNotExist:
                raise serializers.ValidationError("Chapter does not exist")

            if chapter.owner != self.request.user:
                raise serializers.ValidationError(
                    "You can only add lessons to your own chapters"
                )

            max_position = Lesson.objects.filter(
                chapter=chapter).aggregate(Max('position'))['position__max']
            next_position = (max_position or 0) + 1

            serializer.save(chapter=chapter, position=next_position)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def upload_lesson_image(request):
    serializer = LessonImageSerializer(data=request.data,
                                       context={'request': request})
    serializer.is_valid(raise_exception=True)
    serializer.save()

    image_url = serializer.data.get('image')
    return Response({'location': image_url}, status=status.HTTP_201_CREATED)
