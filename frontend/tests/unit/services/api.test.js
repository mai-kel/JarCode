import { describe, it, expect, beforeEach, vi } from 'vitest';
import apiClient, { initCSRF } from '../../../src/services/api';
import { transformApiError } from '../../../src/utils/errorHandler';

vi.mock('../../../src/utils/errorHandler', () => ({
  transformApiError: vi.fn((error) => ({
    message: error.message || 'Error',
    status: error.response?.status || 0,
    details: error.response?.data || error,
  })),
}));

describe('api', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    document.cookie = '';
  });

  describe('CSRF token', () => {
    it('should get CSRF token from cookies', () => {
      document.cookie = 'csrftoken=test-token-123';
      const config = { method: 'post', headers: {} };
      const interceptor = apiClient.interceptors.request.handlers[0].fulfilled;
      const result = interceptor(config);

      expect(result.headers['X-CSRFToken']).toBe('test-token-123');
    });

    it('should not add CSRF token if not in cookies', () => {
      document.cookie = 'csrftoken=';
      const config = { method: 'post', headers: {} };
      const interceptor = apiClient.interceptors.request.handlers[0].fulfilled;
      const result = interceptor(config);

      expect(result.headers['X-CSRFToken']).toBeUndefined();
    });

    it('should add CSRF token for POST requests', () => {
      document.cookie = 'csrftoken=test-token';
      const config = { method: 'post', headers: {} };
      const interceptor = apiClient.interceptors.request.handlers[0].fulfilled;
      const result = interceptor(config);

      expect(result.headers['X-CSRFToken']).toBe('test-token');
    });

    it('should add CSRF token for PUT requests', () => {
      document.cookie = 'csrftoken=test-token';
      const config = { method: 'put', headers: {} };
      const interceptor = apiClient.interceptors.request.handlers[0].fulfilled;
      const result = interceptor(config);

      expect(result.headers['X-CSRFToken']).toBe('test-token');
    });

    it('should add CSRF token for PATCH requests', () => {
      document.cookie = 'csrftoken=test-token';
      const config = { method: 'patch', headers: {} };
      const interceptor = apiClient.interceptors.request.handlers[0].fulfilled;
      const result = interceptor(config);

      expect(result.headers['X-CSRFToken']).toBe('test-token');
    });

    it('should add CSRF token for DELETE requests', () => {
      document.cookie = 'csrftoken=test-token';
      const config = { method: 'delete', headers: {} };
      const interceptor = apiClient.interceptors.request.handlers[0].fulfilled;
      const result = interceptor(config);

      expect(result.headers['X-CSRFToken']).toBe('test-token');
    });

    it('should not add CSRF token for GET requests', () => {
      document.cookie = 'csrftoken=test-token';
      const config = { method: 'get', headers: {} };
      const interceptor = apiClient.interceptors.request.handlers[0].fulfilled;
      const result = interceptor(config);

      expect(result.headers['X-CSRFToken']).toBeUndefined();
    });

    it('should handle request interceptor error', () => {
      const error = new Error('Request error');
      const interceptor = apiClient.interceptors.request.handlers[0].rejected;
      const result = interceptor(error);

      expect(result).rejects.toThrow('Request error');
    });
  });

  describe('response interceptor', () => {
    it('should return response on success', () => {
      const response = { data: { id: 1 }, status: 200 };
      const interceptor = apiClient.interceptors.response.handlers[0].fulfilled;
      const result = interceptor(response);

      expect(result).toBe(response);
    });

    it('should transform error on failure', async () => {
      const error = {
        response: {
          status: 404,
          data: { message: 'Not found' },
        },
        message: 'Request failed',
      };
      const interceptor = apiClient.interceptors.response.handlers[0].rejected;

      try {
        await interceptor(error);
      } catch (transformedError) {
        expect(transformApiError).toHaveBeenCalledWith(error);
        expect(transformedError).toBeDefined();
      }
    });

    it('should log error details', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const error = {
        response: {
          status: 500,
          data: { message: 'Server error' },
        },
        message: 'Request failed',
      };
      const interceptor = apiClient.interceptors.response.handlers[0].rejected;

      try {
        await interceptor(error);
      } catch (_e) {
        expect(consoleErrorSpy).toHaveBeenCalled();
      }

      consoleErrorSpy.mockRestore();
    });
  });

  describe('initCSRF', () => {
    it('should initialize CSRF token', async () => {
      const axiosGet = vi.spyOn(apiClient, 'get').mockResolvedValue({});

      await initCSRF();

      expect(axiosGet).toHaveBeenCalledWith('/users/csrf-init/');
    });

    it('should handle CSRF initialization error', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      vi.spyOn(apiClient, 'get').mockRejectedValue(new Error('CSRF init failed'));

      await initCSRF();

      expect(consoleErrorSpy).toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
    });
  });

  describe('apiClient configuration', () => {
    it('should have correct base URL', () => {
      expect(apiClient.defaults.baseURL).toBe('/api');
    });

    it('should have withCredentials enabled', () => {
      expect(apiClient.defaults.withCredentials).toBe(true);
    });

    it('should have correct headers', () => {
      expect(apiClient.defaults.headers['Content-Type']).toBe('application/json');
      expect(apiClient.defaults.headers['Accept']).toBe('application/json');
    });
  });
});
