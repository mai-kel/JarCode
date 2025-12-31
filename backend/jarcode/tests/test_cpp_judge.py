import pytest
import textwrap
from judge.cpp_judge import CppJudge
from judge.result_dto import ResultDto
from submissions.models import Result


@pytest.mark.integration
class TestCppJudgeIntegration:

    def test_run_solution_success(self):
        solution_code = textwrap.dedent("""
            int add(int a, int b) {
                return a + b;
            }
        """)

        test_code = textwrap.dedent("""
            #include <catch2/catch_test_macros.hpp>
            #include "solution.cpp"

            TEST_CASE("Add function", "[add]") {
                REQUIRE(add(1, 2) == 3);
            }
        """)

        result = CppJudge.run_solution(solution_code, test_code, timeout=30.0)

        assert isinstance(result, ResultDto)
        assert result.outcome == Result.Outcome.PASSED
        assert "All tests passed" in result.output

    def test_run_solution_failure(self):
        solution_code = textwrap.dedent("""
            int add(int a, int b) {
                return a - b; // Bug
            }
        """)

        test_code = textwrap.dedent("""
            #include <catch2/catch_test_macros.hpp>
            #include "solution.cpp"

            TEST_CASE("Add function", "[add]") {
                REQUIRE(add(1, 2) == 3);
            }
        """)

        result = CppJudge.run_solution(solution_code, test_code, timeout=30.0)

        assert result.outcome == Result.Outcome.FAILED
        assert "test cases: 1 | 1 failed" in result.output

    def test_run_solution_compilation_error(self):
        solution_code = textwrap.dedent("""
            int add(int a, int b) {
                return a + b  // Missing semicolon
            }
        """)

        test_code = textwrap.dedent("""
            #include <catch2/catch_test_macros.hpp>
            #include "solution.cpp"

            TEST_CASE("Add function", "[add]") {
                REQUIRE(add(1, 2) == 3);
            }
        """)

        result = CppJudge.run_solution(solution_code, test_code, timeout=10.0)

        assert result.outcome == Result.Outcome.COMPILATION_ERROR
        assert "error: expected ';' before '}' token" in result.output

    def test_run_solution_timeout(self):
        solution_code = textwrap.dedent("""
            void loop() {
                while (true) {
                    // Infinite loop
                }
            }
        """)

        test_code = textwrap.dedent("""
            #include <catch2/catch_test_macros.hpp>
            #include "solution.cpp"

            TEST_CASE("Infinite Loop", "[loop]") {
                loop();
            }
        """)

        result = CppJudge.run_solution(solution_code, test_code, timeout=0.5)

        assert result.outcome == Result.Outcome.TIMEOUT
        assert result.output is None
