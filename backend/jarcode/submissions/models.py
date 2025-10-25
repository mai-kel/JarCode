from django.db import models
from users.models import User
from problems.models import Problem


class Submission(models.Model):
    class Status(models.TextChoices):
        ACCEPTED = 'ACCEPTED', 'Accepted'
        EVALUATING = 'EVALUATING', 'Evaluating'
        EVALUATED = 'EVALUATED', 'Evaluated'

    author = models.ForeignKey(User,
                               related_name='user_submissions',
                               on_delete=models.CASCADE)
    problem = models.ForeignKey(Problem,
                                related_name='problem_sumbissions',
                                on_delete=models.CASCADE)
    solution = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(choices=Status.choices)


class Result(models.Model):
    class Outcome(models.TextChoices):
        PASSED = 'PASSED', 'Passed'
        RUNTIME_ERROR = 'RUN_ERR', 'Runtime error'
        COMPILATION_ERROR = 'COMP_ERR', 'Compilation error'
        TIMEOUT = 'TIMEOUT', 'Timeout'
        INTERNAL_SERVER_ERROR = 'INT_SERV_ERR', 'Internal server error'

    submission = models.OneToOneField(
        Submission,
        related_name='result',
        on_delete=models.CASCADE
    )
    output = models.TextField(blank=True)
    outcome = models.CharField(choices=Outcome.choices)
