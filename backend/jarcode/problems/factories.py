import factory
from factory.django import DjangoModelFactory
from .models import Problem
from users.factories import UserFactory


class ProblemFactory(DjangoModelFactory):
    class Meta:
        model = Problem

    title = factory.Faker('sentence', nb_words=4)
    description = factory.Faker('paragraph')
    language = factory.Iterator(Problem.Language.values)
    difficulty = factory.Iterator(Problem.Difficulty.values)
    starting_code = "print('Hello World')"
    test_code = "assert True"
    author = factory.SubFactory(UserFactory)
