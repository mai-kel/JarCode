from rest_framework import serializers
from users.serializers import UserGenericInfoSerializer
from .models import Course, Chapter, Lesson, LessonImage


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
        read_only_fields = ['position']


class LessonSerializer(serializers.ModelSerializer):
    chapter = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = Lesson
        fields = '__all__'
        read_only_fields = ['position']


class LessonImageSerializer(serializers.ModelSerializer):
    lesson = serializers.PrimaryKeyRelatedField(queryset=Lesson.objects.all())
    image = serializers.ImageField()

    class Meta:
        model = LessonImage
        fields = ['id', 'lesson', 'image']
        read_only_fields = ['id']

    def validate(self, attrs):
        request = self.context.get('request')
        lesson = attrs.get('lesson')

        if lesson.owner != request.user:
            msg = 'You do not have permission to add images to this lesson.'
            raise serializers.ValidationError({'lesson': msg})

        return attrs
