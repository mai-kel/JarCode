from rest_framework import serializers
from users.serializers import UserGenericInfoSerializer
from .models import Course, Chapter, Lesson


class CourseSerializer(serializers.ModelSerializer):
    owner = UserGenericInfoSerializer(read_only=True)

    class Meta:
        model = Course
        fields = '__all__'
        read_only_fields = ['owner']


class ChapterSerializer(serializers.ModelSerializer):
    course = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = Chapter
        fields = '__all__'


class LessonSerializer(serializers.ModelSerializer):
    chapter = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = Lesson
        fields = '__all__'
