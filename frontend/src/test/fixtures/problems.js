export const mockProblem = {
  id: 1,
  title: 'Test Problem',
  description: 'Test Description',
  difficulty: 'EASY',
  language: 'PYTHON',
  starting_code: 'def solution():\n    pass',
  test_code: 'assert solution() == True',
  author: 1,
};

export const mockProblems = [
  mockProblem,
  {
    id: 2,
    title: 'Another Problem',
    description: 'Another Description',
    difficulty: 'MEDIUM',
    language: 'JAVA',
    starting_code: 'public class Solution {}',
    test_code: 'assert true',
    author: 1,
  },
  {
    id: 3,
    title: 'Hard Problem',
    description: 'Hard Description',
    difficulty: 'HARD',
    language: 'PYTHON',
    starting_code: 'def solution():',
    test_code: 'assert solution()',
    author: 2,
  },
];
