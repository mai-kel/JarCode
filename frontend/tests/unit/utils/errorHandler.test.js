import { describe, it, expect } from 'vitest';
import {
  transformApiError,
  getErrorMessage,
  createError,
  isNetworkError,
  isTimeoutError
} from '../../../src/utils/errorHandler';

describe('errorHandler', () => {
  describe('transformApiError', () => {
    it('should transform axios error with detail message', () => {
      const error = {
        response: {
          status: 400,
          data: {
            detail: 'Invalid input'
          }
        }
      };

      const result = transformApiError(error);

      expect(result).toMatchObject({
        message: 'Invalid input',
        status: 400,
        details: { detail: 'Invalid input' }
      });
      expect(result.fields).toBeDefined();
    });

    it('should transform axios error with message property', () => {
      const error = {
        response: {
          status: 400,
          data: {
            message: 'Validation error'
          }
        }
      };

      const result = transformApiError(error);

      expect(result.message).toBe('Validation error');
      expect(result.status).toBe(400);
    });

    it('should transform axios error with non_field_errors', () => {
      const error = {
        response: {
          status: 400,
          data: {
            non_field_errors: ['Error 1', 'Error 2']
          }
        }
      };

      const result = transformApiError(error);

      expect(result.message).toBe('Error 1 Error 2');
    });

    it('should handle 401 status code', () => {
      const error = {
        response: {
          status: 401,
          data: {}
        }
      };

      const result = transformApiError(error);

      expect(result.message).toBe('Authentication required. Please log in.');
    });

    it('should handle 403 status code', () => {
      const error = {
        response: {
          status: 403,
          data: {}
        }
      };

      const result = transformApiError(error);

      expect(result.message).toBe('You do not have permission to perform this action.');
    });

    it('should handle 404 status code', () => {
      const error = {
        response: {
          status: 404,
          data: {}
        }
      };

      const result = transformApiError(error);

      expect(result.message).toBe('The requested resource was not found.');
    });

    it('should handle 429 status code with retry-after', () => {
      const error = {
        response: {
          status: 429,
          headers: {
            'retry-after': '60'
          },
          data: {}
        }
      };

      const result = transformApiError(error);

      expect(result.message).toBe('Too many requests. Please wait 60 seconds before trying again.');
    });

    it('should handle 500+ status codes', () => {
      const error = {
        response: {
          status: 500,
          data: {}
        }
      };

      const result = transformApiError(error);

      expect(result.message).toBe('Server error. Please try again later.');
    });

    it('should handle error without response', () => {
      const error = {
        message: 'Network error'
      };

      const result = transformApiError(error);

      expect(result.status).toBe(0);
      expect(result.message).toBe('Network error');
    });

    it('should extract field errors', () => {
      const error = {
        response: {
          status: 400,
          data: {
            email: ['Invalid email'],
            password: ['Too short']
          }
        }
      };

      const result = transformApiError(error);

      expect(result.fields.email).toContain('Invalid email');
      expect(result.fields.password).toContain('Too short');
    });
  });

  describe('getErrorMessage', () => {
    it('should return message from string', () => {
      expect(getErrorMessage('Error message')).toBe('Error message');
    });

    it('should return message from error object', () => {
      const error = { message: 'Error message' };
      expect(getErrorMessage(error)).toBe('Error message');
    });

    it('should return message from details.message', () => {
      const error = { details: { message: 'Error message' } };
      expect(getErrorMessage(error)).toBe('Error message');
    });

    it('should return message from details.detail', () => {
      const error = { details: { detail: 'Error detail' } };
      expect(getErrorMessage(error)).toBe('Error detail');
    });

    it('should return default message for null/undefined', () => {
      expect(getErrorMessage(null)).toBe('An unknown error occurred');
      expect(getErrorMessage(undefined)).toBe('An unknown error occurred');
    });

    it('should return default message for unknown format', () => {
      const error = { unknown: 'property' };
      expect(getErrorMessage(error)).toBe('An unknown error occurred');
    });
  });

  describe('createError', () => {
    it('should create standardized error object', () => {
      const error = createError('Test error', 400);

      expect(error).toMatchObject({
        message: 'Test error',
        status: 400,
        details: { message: 'Test error' },
        fields: {}
      });
    });

    it('should default status to 0', () => {
      const error = createError('Test error');

      expect(error.status).toBe(0);
    });
  });

  describe('isNetworkError', () => {
    it('should return true for network error', () => {
      const error = {
        request: {},
        response: undefined
      };

      const result = isNetworkError(error);
      expect(typeof result).toBe('boolean');
      expect(result).toBe(true);
    });

    it('should return false for error with response', () => {
      const error = {
        request: {},
        response: { status: 400 }
      };

      const result = isNetworkError(error);
      expect(typeof result).toBe('boolean');
      expect(result).toBe(false);
    });

    it('should return false for error without request', () => {
      const error = {
        message: 'Some error',
        response: undefined,
        request: undefined
      };

      const result = isNetworkError(error);
      expect(typeof result).toBe('boolean');
      expect(result).toBe(false);
    });
  });

  describe('isTimeoutError', () => {
    it('should return true for ECONNABORTED code', () => {
      const error = { code: 'ECONNABORTED' };
      expect(isTimeoutError(error)).toBe(true);
    });

    it('should return true for timeout in message', () => {
      const error = { message: 'timeout of 5000ms exceeded' };
      expect(isTimeoutError(error)).toBe(true);
    });

    it('should return false for non-timeout error', () => {
      const error = { message: 'Some other error' };
      expect(isTimeoutError(error)).toBe(false);
    });
  });
});

