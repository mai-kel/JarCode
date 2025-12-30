import factory
from factory.django import DjangoModelFactory
from .models import Submission, Result
from users.factories import UserFactory
from problems.factories import ProblemFactory


class SubmissionFactory(DjangoModelFactory):
    class Meta:
        model = Submission

    author = factory.SubFactory(UserFactory)
    problem = factory.SubFactory(ProblemFactory)
    solution = "print('solution')"
    status = Submission.Status.EVALUATING


class ResultFactory(DjangoModelFactory):
    class Meta:
        model = Result

    submission = factory.SubFactory(SubmissionFactory)
    outcome = Result.Outcome.PASSED
    output = "Execution Output"
    ai_evaluation = "Good job"
