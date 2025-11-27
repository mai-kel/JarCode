from django.db import models
from users.models import User


class Problem(models.Model):
    class Language(models.TextChoices):
        PYTHON = 'PYTHON', 'Python'
        CPP = 'CPP', 'C++'
        JAVA = 'JAVA', 'Java'

    class Difficulty(models.TextChoices):
        EASY = 'EASY', 'Easy'
        MEDIUM = 'MEDIUM', 'Medium'
        HARD = 'HARD', 'Hard'

    author = models.ForeignKey(User,
                               related_name='problems',
                               on_delete=models.CASCADE)
    title = models.CharField()
    description = models.TextField()
    language = models.CharField(choices=Language.choices)
    starting_code = models.TextField()
    test_code = models.TextField()
    difficulty = models.CharField(choices=Difficulty.choices)
    created_at = models.DateTimeField(auto_now_add=True)


class ProblemReview(models.Model):
    author = models.ForeignKey(User,
                               related_name='problem_reviews',
                               on_delete=models.CASCADE)
    problem = models.ForeignKey(Problem,
                                related_name="reviews",
                                on_delete=models.CASCADE)
    value = models.PositiveSmallIntegerField()
    comment = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('author', 'problem')
