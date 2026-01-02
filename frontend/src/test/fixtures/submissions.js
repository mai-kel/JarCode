export const mockSubmission = {
  id: 1,
  problem: 1,
  code: 'def solution():\n    return True',
  status: 'ACCEPTED',
  test_results: [],
  created_at: '2024-01-01T00:00:00Z',
};

export const mockSubmissions = [
  mockSubmission,
  {
    id: 2,
    problem: 1,
    code: 'def solution():\n    return False',
    status: 'REJECTED',
    test_results: [],
    created_at: '2024-01-02T00:00:00Z',
  },
  {
    id: 3,
    problem: 2,
    code: 'public class Solution {}',
    status: 'PENDING',
    test_results: [],
    created_at: '2024-01-03T00:00:00Z',
  },
];
