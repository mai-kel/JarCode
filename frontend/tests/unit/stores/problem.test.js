import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useProblemStore } from '../../../src/store/problem';
import * as problemService from '../../../src/services/problemService';

vi.mock('../../../src/services/problemService');

describe('problem store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  describe('createProblem', () => {
    it('should create problem successfully', async () => {
      const store = useProblemStore();
      const mockProblem = { id: 1, title: 'New Problem' };
      problemService.createProblem.mockResolvedValue(mockProblem);

      const result = await store.createProblem({ title: 'New Problem' });

      expect(result).toEqual(mockProblem);
      expect(store.currentProblem).toEqual(mockProblem);
      expect(store.isLoading).toBe(false);
      expect(store.error).toBeNull();
    });

    it('should handle create error', async () => {
      const store = useProblemStore();
      const error = { message: 'Create failed', status: 400 };
      problemService.createProblem.mockRejectedValue(error);

      const result = await store.createProblem({});

      expect(result).toBeNull();
      expect(store.error).toBeDefined();
      expect(store.isLoading).toBe(false);
    });
  });

  describe('getProblem', () => {
    it('should fetch problem successfully', async () => {
      const store = useProblemStore();
      const mockProblem = { id: 1, title: 'Test Problem' };
      problemService.getProblem.mockResolvedValue(mockProblem);

      const result = await store.getProblem(1);

      expect(result).toEqual(mockProblem);
      expect(store.currentProblem).toEqual(mockProblem);
    });

    it('should handle fetch error', async () => {
      const store = useProblemStore();
      const error = { message: 'Not found', status: 404 };
      problemService.getProblem.mockRejectedValue(error);

      const result = await store.getProblem(1);

      expect(result).toBeNull();
      expect(store.error).toBeDefined();
    });
  });

  describe('updateProblem', () => {
    it('should update problem successfully', async () => {
      const store = useProblemStore();
      store.currentProblem = { id: 1, title: 'Old' };
      const updatedProblem = { id: 1, title: 'Updated' };
      problemService.updateProblem.mockResolvedValue(updatedProblem);

      const result = await store.updateProblem(1, { title: 'Updated' });

      expect(result).toEqual(updatedProblem);
      expect(store.currentProblem).toEqual(updatedProblem);
    });

    it('should not update currentProblem if IDs do not match', async () => {
      const store = useProblemStore();
      store.currentProblem = { id: 1, title: 'Old' };
      const updatedProblem = { id: 2, title: 'Updated' };
      problemService.updateProblem.mockResolvedValue(updatedProblem);

      await store.updateProblem(2, { title: 'Updated' });

      expect(store.currentProblem).toEqual({ id: 1, title: 'Old' });
    });

    it('should handle update error', async () => {
      const store = useProblemStore();
      const error = { message: 'Update failed', status: 400 };
      problemService.updateProblem.mockRejectedValue(error);

      const result = await store.updateProblem(1, {});

      expect(result).toBeNull();
      expect(store.error).toBeDefined();
    });
  });

  describe('deleteProblem', () => {
    it('should delete problem successfully', async () => {
      const store = useProblemStore();
      store.currentProblem = { id: 1 };
      problemService.deleteProblem.mockResolvedValue(undefined);

      const result = await store.deleteProblem(1);

      expect(result).toBe(true);
      expect(store.currentProblem).toBeNull();
    });

    it('should not clear currentProblem if IDs do not match', async () => {
      const store = useProblemStore();
      store.currentProblem = { id: 1 };
      problemService.deleteProblem.mockResolvedValue(undefined);

      await store.deleteProblem(2);

      expect(store.currentProblem).toEqual({ id: 1 });
    });

    it('should handle delete error', async () => {
      const store = useProblemStore();
      const error = { message: 'Delete failed', status: 403 };
      problemService.deleteProblem.mockRejectedValue(error);

      const result = await store.deleteProblem(1);

      expect(result).toBe(false);
      expect(store.error).toBeDefined();
    });
  });

  describe('listProblems', () => {
    it('should list problems successfully', async () => {
      const store = useProblemStore();
      const mockResponse = {
        results: [{ id: 1 }, { id: 2 }],
        next: 'cursor123'
      };
      problemService.listProblems.mockResolvedValue(mockResponse);

      const result = await store.listProblems({ search: 'test' });

      expect(result).toEqual(mockResponse);
      expect(store.isLoading).toBe(false);
    });

    it('should handle list error and return empty results', async () => {
      const store = useProblemStore();
      const error = { message: 'List failed', status: 500 };
      problemService.listProblems.mockRejectedValue(error);

      const result = await store.listProblems();

      expect(result).toEqual({ results: [], next: null, previous: null });
      expect(store.error).toBeDefined();
    });
  });

  describe('clearProblem', () => {
    it('should clear current problem and error', () => {
      const store = useProblemStore();
      store.currentProblem = { id: 1 };
      store.error = { message: 'Error' };

      store.clearProblem();

      expect(store.currentProblem).toBeNull();
      expect(store.error).toBeNull();
    });
  });

  describe('clearError', () => {
    it('should clear error', () => {
      const store = useProblemStore();
      store.error = { message: 'Error' };
      store.clearError();
      expect(store.error).toBeNull();
    });
  });
});

