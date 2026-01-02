import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useSubmissionStore } from '../../../src/store/submission';
import * as submissionService from '../../../src/services/submissionService';

vi.mock('../../../src/services/submissionService');

describe('submission store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  describe('listSubmissions', () => {
    it('should list submissions successfully', async () => {
      const store = useSubmissionStore();
      const mockResponse = {
        results: [{ id: 1 }, { id: 2 }],
        next: 'cursor123',
      };
      submissionService.listSubmissions.mockResolvedValue(mockResponse);

      const result = await store.listSubmissions(1);

      expect(result).toEqual(mockResponse);
      expect(store.isLoading).toBe(false);
      expect(store.error).toBeNull();
    });

    it('should include cursor when provided', async () => {
      const store = useSubmissionStore();
      submissionService.listSubmissions.mockResolvedValue({ results: [] });

      await store.listSubmissions(1, 'cursor123');

      expect(submissionService.listSubmissions).toHaveBeenCalledWith(1, 'cursor123');
    });

    it('should handle list error and return empty results', async () => {
      const store = useSubmissionStore();
      const error = { message: 'List failed', status: 500 };
      submissionService.listSubmissions.mockRejectedValue(error);

      const result = await store.listSubmissions(1);

      expect(result).toEqual({ results: [], next: null });
      expect(store.error).toBeDefined();
    });
  });

  describe('createSubmission', () => {
    it('should create submission successfully', async () => {
      const store = useSubmissionStore();
      const mockSubmission = {
        id: 1,
        code: 'def solution(): return True',
        status: 'PENDING',
      };
      submissionService.createSubmission.mockResolvedValue(mockSubmission);

      const result = await store.createSubmission(1, { code: 'def solution(): return True' });

      expect(result).toEqual(mockSubmission);
      expect(store.isLoading).toBe(false);
    });

    it('should handle create error', async () => {
      const store = useSubmissionStore();
      const error = { message: 'Create failed', status: 400 };
      submissionService.createSubmission.mockRejectedValue(error);

      const result = await store.createSubmission(1, {});

      expect(result).toBeNull();
      expect(store.error).toBeDefined();
    });
  });

  describe('setCurrentSubmission', () => {
    it('should set current submission', () => {
      const store = useSubmissionStore();
      const submission = { id: 1 };

      store.setCurrentSubmission(submission);

      expect(store.currentSubmission).toEqual(submission);
    });
  });

  describe('clearError', () => {
    it('should clear error', () => {
      const store = useSubmissionStore();
      store.error = { message: 'Error' };
      store.clearError();
      expect(store.error).toBeNull();
    });
  });
});
