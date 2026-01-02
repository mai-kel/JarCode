import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as problemService from '../../../src/services/problemService';
import apiClient from '../../../src/services/api';

vi.mock('../../../src/services/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('problemService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createProblem', () => {
    it('should call create endpoint with payload', async () => {
      const payload = {
        title: 'New Problem',
        description: 'Description',
        difficulty: 'EASY',
        language: 'PYTHON',
      };
      const mockResponse = { data: { id: 1, ...payload } };
      apiClient.post.mockResolvedValue(mockResponse);

      const result = await problemService.createProblem(payload);

      expect(apiClient.post).toHaveBeenCalledWith('/problems/', payload);
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('getProblem', () => {
    it('should call problem detail endpoint', async () => {
      const mockProblem = { id: 1, title: 'Test Problem' };
      apiClient.get.mockResolvedValue({ data: mockProblem });

      const result = await problemService.getProblem(1);

      expect(apiClient.get).toHaveBeenCalledWith('/problems/1/');
      expect(result).toEqual(mockProblem);
    });
  });

  describe('updateProblem', () => {
    it('should call update endpoint with payload', async () => {
      const payload = { title: 'Updated Problem' };
      const mockResponse = { data: { id: 1, ...payload } };
      apiClient.put.mockResolvedValue(mockResponse);

      const result = await problemService.updateProblem(1, payload);

      expect(apiClient.put).toHaveBeenCalledWith('/problems/1/', payload);
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('deleteProblem', () => {
    it('should call delete endpoint', async () => {
      apiClient.delete.mockResolvedValue({});

      await problemService.deleteProblem(1);

      expect(apiClient.delete).toHaveBeenCalledWith('/problems/1/');
    });
  });

  describe('listProblems', () => {
    it('should call list endpoint without params', async () => {
      const mockResponse = { data: { results: [] } };
      apiClient.get.mockResolvedValue(mockResponse);

      await problemService.listProblems();

      expect(apiClient.get).toHaveBeenCalledWith('/problems/', { params: {} });
    });

    it('should include search in params', async () => {
      const mockResponse = { data: { results: [] } };
      apiClient.get.mockResolvedValue(mockResponse);

      await problemService.listProblems({ search: 'test' });

      expect(apiClient.get).toHaveBeenCalledWith('/problems/', {
        params: { title: 'test' },
      });
    });

    it('should include language in params', async () => {
      const mockResponse = { data: { results: [] } };
      apiClient.get.mockResolvedValue(mockResponse);

      await problemService.listProblems({ language: 'PYTHON' });

      expect(apiClient.get).toHaveBeenCalledWith('/problems/', {
        params: { language: 'PYTHON' },
      });
    });

    it('should include difficulty in params', async () => {
      const mockResponse = { data: { results: [] } };
      apiClient.get.mockResolvedValue(mockResponse);

      await problemService.listProblems({ difficulty: 'EASY' });

      expect(apiClient.get).toHaveBeenCalledWith('/problems/', {
        params: { difficulty: 'EASY' },
      });
    });

    it('should include author in params', async () => {
      const mockResponse = { data: { results: [] } };
      apiClient.get.mockResolvedValue(mockResponse);

      await problemService.listProblems({ author: 1 });

      expect(apiClient.get).toHaveBeenCalledWith('/problems/', {
        params: { author: 1 },
      });
    });

    it('should include cursor in params', async () => {
      const mockResponse = { data: { results: [] } };
      apiClient.get.mockResolvedValue(mockResponse);

      await problemService.listProblems({ cursor: 'cursor123' });

      expect(apiClient.get).toHaveBeenCalledWith('/problems/', {
        params: { cursor: 'cursor123' },
      });
    });

    it('should include is_solved in params when provided', async () => {
      const mockResponse = { data: { results: [] } };
      apiClient.get.mockResolvedValue(mockResponse);

      await problemService.listProblems({ is_solved: true });

      expect(apiClient.get).toHaveBeenCalledWith('/problems/', {
        params: { is_solved: true },
      });
    });

    it('should not include is_solved when null', async () => {
      const mockResponse = { data: { results: [] } };
      apiClient.get.mockResolvedValue(mockResponse);

      await problemService.listProblems({ is_solved: null });

      expect(apiClient.get).toHaveBeenCalledWith('/problems/', {
        params: {},
      });
    });
  });
});
