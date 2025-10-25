from abc import ABC, abstractmethod
from .result_dto import ResultDto


class Judge(ABC):

    @staticmethod
    @abstractmethod
    def run_solution(solution_code: str,
                     test_code: str,
                     timeout: float) -> ResultDto:
        ...
