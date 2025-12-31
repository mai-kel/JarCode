import textwrap
from judge.python_judge import PythonJudge
from judge.result_dto import ResultDto
from submissions.models import Result


def test_run_solution_success():
    solution_code = textwrap.dedent("""
        def add(a, b):
            return a + b
    """)

    test_code = textwrap.dedent("""
        from solution import add

        def test_add():
            assert add(1, 2) == 3
    """)

    result = PythonJudge.run_solution(solution_code, test_code, timeout=30.0)

    assert isinstance(result, ResultDto)
    assert result.outcome == Result.Outcome.PASSED
    assert "1 passed" in result.output


def test_run_solution_failure():
    solution_code = textwrap.dedent("""
        def add(a, b):
            return a - b  # Bug here
    """)

    test_code = textwrap.dedent("""
        from solution import add

        def test_add():
            assert add(1, 2) == 3
    """)

    result = PythonJudge.run_solution(solution_code, test_code, timeout=30.0)

    assert result.outcome == Result.Outcome.FAILED
    assert "assert -1 == 3" in result.output
    assert "FAILED" in result.output


def test_run_solution_timeout():
    solution_code = textwrap.dedent("""
        def loop():
            while True:
                pass
    """)

    test_code = textwrap.dedent("""
        from solution import loop

        def test_loop():
            loop()
    """)

    result = PythonJudge.run_solution(solution_code, test_code, timeout=0.5)

    assert result.outcome == Result.Outcome.TIMEOUT
    assert result.output is None


def test_run_solution_syntax_error_in_solution():
    solution_code = textwrap.dedent("""
        def invalid_syntax(
            return 1
    """)

    test_code = textwrap.dedent("""
        from solution import *

        def test_nothing():
            assert True
    """)

    result = PythonJudge.run_solution(solution_code, test_code, timeout=10.0)

    assert result.outcome == Result.Outcome.FAILED
    assert "SyntaxError" in result.output
