import factory
from factory.django import DjangoModelFactory
from .models import Course, Chapter, Lesson, LessonImage
from users.factories import UserFactory


class CourseFactory(DjangoModelFactory):
    class Meta:
        model = Course

    title = factory.Faker('sentence', nb_words=4)
    description = factory.Faker('paragraph')
    owner = factory.SubFactory(UserFactory)
    thumbnail = factory.django.ImageField(color='blue')


class ChapterFactory(DjangoModelFactory):
    class Meta:
        model = Chapter

    title = factory.Faker('sentence', nb_words=3)
    course = factory.SubFactory(CourseFactory)
    position = factory.Sequence(lambda n: n + 1)


class LessonFactory(DjangoModelFactory):
    class Meta:
        model = Lesson

    title = factory.Faker('sentence', nb_words=5)
    chapter = factory.SubFactory(ChapterFactory)
    content = "<p>Valid HTML content for lesson.</p>"
    position = factory.Sequence(lambda n: n + 1)


class LessonImageFactory(DjangoModelFactory):
    class Meta:
        model = LessonImage

    lesson = factory.SubFactory(LessonFactory)
    image = factory.django.ImageField(color='red')
