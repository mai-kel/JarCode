import docker
from docker.errors import APIError, ImageNotFound
from judge.judge import Judge
from requests.exceptions import ReadTimeout
from .result_dto import ResultDto
from submissions.models import Result
import shlex
import requests


class JavaJudge(Judge):
    SOLUTION_FILE = 'Solution.java'
    TEST_FILE = 'SolutionTest.java'
    IMAGE = 'java_judge:latest'
    MAX_CHARS = 100_000
    JUNIT_JAR = "/opt/junit/junit-platform-console-standalone.jar"

    @staticmethod
    def run_solution(solution_code: str,
                     test_code: str,
                     timeout: float) -> ResultDto:

        client = docker.from_env()
        classpath = f".:{JavaJudge.JUNIT_JAR}"

        command_string = (
            "export TMPDIR=/home/user && "
            f"echo {shlex.quote(solution_code)} > {JavaJudge.SOLUTION_FILE} && "
            f"echo {shlex.quote(test_code)} > {JavaJudge.TEST_FILE} && "

            f"javac -cp {classpath} {JavaJudge.SOLUTION_FILE} {JavaJudge.TEST_FILE} 2>&1; "
            f"COMP=$?; "

            f"if [ $COMP -ne 0 ]; then exit 100; fi; "

            f"java -jar {JavaJudge.JUNIT_JAR} -cp . -c SolutionTest --disable-banner"
        )

        container = None
        try:
            container = client.containers.run(
                image=JavaJudge.IMAGE,
                runtime="runsc",
                network_disabled=True,
                command=["/bin/sh", "-c", command_string],
                detach=True,
                mem_limit="512m",
                memswap_limit="512m",
                nano_cpus=0.5 * 1_000_000_000,
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

            output = container.logs().decode("utf-8")[:JavaJudge.MAX_CHARS]
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
