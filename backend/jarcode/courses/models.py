from django.db import models
from users.models import User


def get_lesson_image_path(instance, filename):
    return f'courses/images/{instance.id}/{filename}'


class Course(models.Model):
    title = models.CharField(blank=False, null=False)
    description = models.TextField(blank=False, null=False)
    owner = models.ForeignKey(User,
                              on_delete=models.CASCADE,
                              related_name='owned_courses')
    thumbnail = models.ImageField(blank=True, null=True,
                                  upload_to=get_lesson_image_path)

    class Meta:
        ordering = ['title']

    def __str__(self):
        return self.title


class Chapter(models.Model):
    title = models.CharField(blank=False, null=False)
    course = models.ForeignKey(Course,
                               on_delete=models.CASCADE,
                               related_name='chapters')
    position = models.IntegerField(default=0)

    class Meta:
        ordering = ['position']
        unique_together = [['course', 'position']]

    @property
    def owner(self):
        return self.course.owner

    def __str__(self):
        return f"{self.position}. {self.title}"


class Lesson(models.Model):
    title = models.CharField(blank=False, null=False)
    chapter = models.ForeignKey(Chapter,
                                on_delete=models.CASCADE,
                                related_name='lessons')
    content = models.TextField(blank=False, null=False)
    position = models.IntegerField(default=0)

    class Meta:
        ordering = ['position']
        unique_together = [['chapter', 'position']]

    @property
    def owner(self):
        return self.chapter.owner

    def __str__(self):
        return f"{self.position}. {self.title}"


class LessonImage(models.Model):
    lesson = models.ForeignKey(Lesson,
                               on_delete=models.CASCADE,
                               related_name='images')
    image = models.ImageField()

    @property
    def owner(self):
        return self.lesson.owner
