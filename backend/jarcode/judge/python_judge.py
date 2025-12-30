import docker
from docker.errors import APIError, ImageNotFound
from judge.judge import Judge
from requests.exceptions import ReadTimeout
from .result_dto import ResultDto
from submissions.models import Result
import shlex
import requests


class PythonJudge(Judge):
    SOLUTION_FILE = 'solution.py'
    TEST_FILE = 'test.py'
    IMAGE = 'python_judge:latest'
    MAX_CHARS = 100_000

    @staticmethod
    def run_solution(solution_code: str,
                     test_code: str,
                     timeout: float) -> ResultDto:

        client = docker.from_env()
        command_string = (
            f"echo {shlex.quote(solution_code)} > {PythonJudge.SOLUTION_FILE} && "  # noqa: E501
            f"echo {shlex.quote(test_code)} > {PythonJudge.TEST_FILE} && "
            f"pytest -q --tb=short --disable-warnings -rA {PythonJudge.TEST_FILE}"  # noqa: E501
        )

        container = None
        try:
            container = client.containers.run(
                image=PythonJudge.IMAGE,
                runtime='runsc',
                network_disabled=True,
                command=['/bin/sh', '-c', command_string],
                detach=True,
                mem_limit='512m',
                memswap_limit='512m',
                nano_cpus=int(0.5 * 1_000_000_000),
                user=1000,
                tmpfs={'/home/user': 'size=50m,uid=1000'},
                read_only=True,
            )

            try:
                response = container.wait(timeout=timeout)
            except (ReadTimeout, requests.exceptions.ConnectionError):
                try:
                    container.kill()
                except APIError:
                    pass
                result = ResultDto(output=None,
                                   outcome=Result.Outcome.TIMEOUT)
                return result
            except APIError:
                result = ResultDto(
                    output=None,
                    outcome=Result.Outcome.INTERNAL_SERVER_ERROR)
                return result

            output = container.logs().decode('utf-8')[:PythonJudge.MAX_CHARS]
            status_code = response.get('StatusCode', 1)

            if status_code == 0:
                outcome = Result.Outcome.PASSED
            else:
                outcome = Result.Outcome.FAILED

            return ResultDto(outcome=outcome, output=output)

        except (APIError, ImageNotFound):
            result = ResultDto(None,
                               outcome=Result.Outcome.INTERNAL_SERVER_ERROR)
            return result

        finally:
            if container:
                try:
                    container.remove()
                except APIError:
                    pass
