from django.db import models
from users.models import User


class Course(models.Model):
    title = models.CharField(blank=False, null=False)
    description = models.TextField(blank=False, null=False)
    owner = models.ForeignKey(User,
                              on_delete=models.CASCADE,
                              related_name='owned_courses')
    thumbnail = models.ImageField(blank=True, null=False)


class Chapter(models.Model):
    title = models.CharField(blank=False, null=False)
    course = models.ForeignKey(Course,
                               on_delete=models.CASCADE,
                               related_name='chapters')

    @property
    def owner(self):
        return self.course.owner


class Lesson(models.Model):
    title = models.CharField(blank=False, null=False)
    chapter = models.ForeignKey(Chapter,
                                on_delete=models.CASCADE,
                                related_name='lessons')
    content = models.TextField(blank=False, null=False)

    @property
    def owner(self):
        return self.chapter.owner


class LessonImage(models.Model):
    lesson = models.ForeignKey(Lesson,
                               on_delete=models.CASCADE,
                               related_name='images')
    image = models.ImageField()

    @property
    def owner(self):
        return self.lesson.owner
