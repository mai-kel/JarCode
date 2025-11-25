import docker
from docker.errors import APIError, ImageNotFound
from judge.judge import Judge
from requests.exceptions import ReadTimeout
from .result_dto import ResultDto
from submissions.models import Result
import shlex
import requests


class CppJudge(Judge):
    SOLUTION_FILE = 'solution.cpp'
    TEST_FILE = 'test.cpp'
    IMAGE = 'cpp_judge:latest'
    MAX_CHARS = 100_000

    @staticmethod
    def run_solution(solution_code: str,
                     test_code: str,
                     timeout: float) -> ResultDto:

        client = docker.from_env()
        command_string = (
            "export TMPDIR=/home/user && "
            f"echo {shlex.quote(solution_code)} > {CppJudge.SOLUTION_FILE} && "
            f"echo {shlex.quote(test_code)} > {CppJudge.TEST_FILE} && "

            f"g++ -std=c++20 -O2 {CppJudge.TEST_FILE} "
            f"-o tests -lCatch2Main -lCatch2 2>&1; "
            f"COMP=$?; "

            f"if [ $COMP -ne 0 ]; then exit 100; fi; "

            f"./tests"
        )

        container = None
        try:
            container = client.containers.run(
                image=CppJudge.IMAGE,
                runtime="runsc",
                network_disabled=True,
                command=["/bin/sh", "-c", command_string],
                detach=True,
                mem_limit="512m",
                memswap_limit="512m",
                nano_cpus=1 * 1_000_000_000,
                user=1000,
                tmpfs={"/home/user": "size=50m,uid=1000,exec"},
                read_only=True,
            )

            try:
                response = container.wait(timeout=timeout)
            except (ReadTimeout, requests.exceptions.ConnectionError):
                try:
                    container.kill()
                except APIError:
                    pass
                return ResultDto(None, Result.Outcome.TIMEOUT)

            except APIError:
                return ResultDto(None, Result.Outcome.INTERNAL_SERVER_ERROR)

            output = container.logs().decode("utf-8")[:CppJudge.MAX_CHARS]
            status_code = response.get("StatusCode", 1)

            if status_code == 0:
                outcome = Result.Outcome.PASSED
            elif status_code == 100:
                outcome = Result.Outcome.COMPILATION_ERROR
            else:
                outcome = Result.Outcome.RUNTIME_ERROR

            return ResultDto(output=output, outcome=outcome)

        except (APIError, ImageNotFound):
            return ResultDto(None, Result.Outcome.INTERNAL_SERVER_ERROR)

        finally:
            if container:
                try:
                    container.remove()
                except APIError:
                    pass
