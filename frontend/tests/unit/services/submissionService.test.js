import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as submissionService from '../../../src/services/submissionService';
import apiClient from '../../../src/services/api';

vi.mock('../../../src/services/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn()
  }
}));

describe('submissionService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('listSubmissions', () => {
    it('should call submissions endpoint without cursor', async () => {
      const mockResponse = { data: { results: [] } };
      apiClient.get.mockResolvedValue(mockResponse);

      const result = await submissionService.listSubmissions(1);

      expect(apiClient.get).toHaveBeenCalledWith('/problems/1/submissions/');
      expect(result).toEqual(mockResponse.data);
    });

    it('should include cursor in URL when provided', async () => {
      const mockResponse = { data: { results: [] } };
      apiClient.get.mockResolvedValue(mockResponse);

      await submissionService.listSubmissions(1, 'cursor123');

      expect(apiClient.get).toHaveBeenCalledWith('/problems/1/submissions/?cursor=cursor123');
    });

    it('should encode cursor in URL', async () => {
      const mockResponse = { data: { results: [] } };
      apiClient.get.mockResolvedValue(mockResponse);

      await submissionService.listSubmissions(1, 'cursor with spaces');

      expect(apiClient.get).toHaveBeenCalledWith('/problems/1/submissions/?cursor=cursor%20with%20spaces');
    });
  });

  describe('createSubmission', () => {
    it('should call create submission endpoint with payload', async () => {
      const payload = {
        code: 'def solution(): return True',
        language: 'PYTHON'
      };
      const mockResponse = { data: { id: 1, ...payload, status: 'PENDING' } };
      apiClient.post.mockResolvedValue(mockResponse);

      const result = await submissionService.createSubmission(1, payload);

      expect(apiClient.post).toHaveBeenCalledWith('/problems/1/submissions/', payload);
      expect(result).toEqual(mockResponse.data);
    });
  });
});

