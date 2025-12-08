from abc import ABC, abstractmethod
from problems.models import Problem
from submissions.models import Result


class AiEvaluator(ABC):

    @staticmethod
    @abstractmethod
    def get_evaluation(problem_title: str,
                       problem_description: str,
                       problem_language: Problem.Language,
                       solution_code: str,
                       test_code: str,
                       outcome: Result.Outcome,
                       output: str) -> str:
        ...
