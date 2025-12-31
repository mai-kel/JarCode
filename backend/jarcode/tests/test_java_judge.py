import pytest
import textwrap
from judge.java_judge import JavaJudge
from judge.result_dto import ResultDto
from submissions.models import Result


@pytest.mark.integration
class TestJavaJudgeIntegration:

    def test_run_solution_success(self):
        solution_code = textwrap.dedent("""
            public class Solution {
                public int add(int a, int b) {
                    return a + b;
                }
            }
        """)

        test_code = textwrap.dedent("""
            import org.junit.jupiter.api.Test;
            import static org.junit.jupiter.api.Assertions.assertEquals;

            public class SolutionTest {
                @Test
                public void testAdd() {
                    Solution s = new Solution();
                    assertEquals(3, s.add(1, 2));
                }
            }
        """)

        result = JavaJudge.run_solution(solution_code, test_code, timeout=30.0)

        assert isinstance(result, ResultDto)
        assert result.outcome == Result.Outcome.PASSED

    def test_run_solution_failure(self):
        solution_code = textwrap.dedent("""
            public class Solution {
                public int add(int a, int b) {
                    return a - b;
                }
            }
        """)

        test_code = textwrap.dedent("""
            import org.junit.jupiter.api.Test;
            import static org.junit.jupiter.api.Assertions.assertEquals;

            public class SolutionTest {
                @Test
                public void testAdd() {
                    Solution s = new Solution();
                    assertEquals(3, s.add(1, 2));
                }
            }
        """)

        result = JavaJudge.run_solution(solution_code, test_code, timeout=30.0)

        assert result.outcome == Result.Outcome.FAILED

    def test_run_solution_compilation_error(self):
        solution_code = textwrap.dedent("""
            public class Solution {
                public int add(int a, int b) {
                    return a + b  // Missing semicolon
                }
            }
        """)

        test_code = textwrap.dedent("""
            public class SolutionTest {
                // Empty test
            }
        """)

        result = JavaJudge.run_solution(solution_code, test_code, timeout=10.0)

        assert result.outcome == Result.Outcome.COMPILATION_ERROR
        assert "error: ';' expected" in result.output

    def test_run_solution_timeout(self):
        solution_code = textwrap.dedent("""
            public class Solution {
                public void loop() {
                    while (true) {
                        // Infinite loop
                    }
                }
            }
        """)

        test_code = textwrap.dedent("""
            import org.junit.jupiter.api.Test;

            public class SolutionTest {
                @Test
                public void testLoop() {
                    Solution s = new Solution();
                    s.loop();
                }
            }
        """)

        result = JavaJudge.run_solution(solution_code, test_code, timeout=0.5)

        assert result.outcome == Result.Outcome.TIMEOUT
        assert result.output is None
