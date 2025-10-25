from judge.python_judge import PythonJudge
from judge.judge import Judge
from judge.result_dto import ResultDto
from problems.models import Problem
from .models import Submission, Result
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from .serializers import SubmissionSerializer


class SubmissionService:
    LANGUAGE_TO_JUDGE_MAP = {
        Problem.Language.PYTHON: PythonJudge
    }

    LANGUAGE_TIMEOUT_MAP = {
        Problem.Language.PYTHON: 30.0
    }

    def __init__(self, submission: Submission) -> None:
        self.submission: Submission = submission
        self.submission_author = self.submission.author
        self.problem: Problem = self.submission.problem
        self.judge_cls: Judge = self.LANGUAGE_TO_JUDGE_MAP[self.problem.language] # TODO think of some error mechanism
        self.timeout: float = self.LANGUAGE_TIMEOUT_MAP[self.problem.language]

    def _get_results(self) -> ResultDto:
        return self.judge_cls.run_solution(
            solution_code=self.submission.solution,
            test_code=self.problem.test_code,
            timeout=self.timeout
        )

    def _create_results_db(self, results: ResultDto):
        Result.objects.update_or_create(
            submission=self.submission,
            defaults={
                'output': results.output if results.output is not None else "",
                'outcome': results.outcome
            }
        )
        self.submission.status = Submission.Status.EVALUATED
        self.submission.save()
        self.submission.refresh_from_db()

    def _notify_consumers(self, payload):
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            f"user_{self.submission_author.id}",
            {'type': 'submission.update',
             'data': payload}
        )

    def evaluate(self) -> None:
        results = self._get_results()
        self._create_results_db(results=results)
        submission_serialized = SubmissionSerializer(self.submission).data
        self._notify_consumers(payload=submission_serialized)
