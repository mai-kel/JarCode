import { describe, it, expect } from 'vitest';
import { extractCursor, normalizePage } from '../../../src/utils/pagination';

describe('pagination', () => {
  describe('extractCursor', () => {
    it('should extract cursor from absolute URL', () => {
      const url = 'https://example.com/api/courses/?cursor=abc123';
      expect(extractCursor(url)).toBe('abc123');
    });

    it('should extract cursor from relative URL', () => {
      const url = '/api/courses/?cursor=xyz789';
      expect(extractCursor(url)).toBe('xyz789');
    });

    it('should extract cursor from URL with multiple params', () => {
      const url = '/api/courses/?search=test&cursor=abc123&page=1';
      expect(extractCursor(url)).toBe('abc123');
    });

    it('should return null for URL without cursor', () => {
      const url = '/api/courses/?search=test';
      expect(extractCursor(url)).toBeNull();
    });

    it('should return null for null/undefined', () => {
      expect(extractCursor(null)).toBeNull();
      expect(extractCursor(undefined)).toBeNull();
    });

    it('should handle malformed URL with fallback regex', () => {
      const url = 'invalid-url?cursor=test123';
      expect(extractCursor(url)).toBe('test123');
    });

    it('should decode URL-encoded cursor', () => {
      const url = '/api/courses/?cursor=test%20123';
      expect(extractCursor(url)).toBe('test 123');
    });
  });

  describe('normalizePage', () => {
    it('should normalize array response', () => {
      const response = [{ id: 1 }, { id: 2 }];
      const result = normalizePage(response);
      expect(result).toEqual({
        results: [{ id: 1 }, { id: 2 }],
        next: null
      });
    });

    it('should normalize object with results property', () => {
      const response = {
        results: [{ id: 1 }, { id: 2 }],
        next: '/api/courses/?cursor=abc123'
      };
      const result = normalizePage(response);
      expect(result.results).toEqual([{ id: 1 }, { id: 2 }]);
      expect(result.next).toBe('abc123');
    });

    it('should normalize object with data.results property', () => {
      const response = {
        data: {
          results: [{ id: 1 }],
          next: '/api/courses/?cursor=xyz789'
        }
      };
      const result = normalizePage(response);
      expect(result.results).toEqual([{ id: 1 }]);
      expect(result.next).toBe('xyz789');
    });

    it('should normalize object with data as array', () => {
      const response = {
        data: [{ id: 1 }, { id: 2 }]
      };
      const result = normalizePage(response);
      expect(result).toEqual({
        results: [{ id: 1 }, { id: 2 }],
        next: null
      });
    });

    it('should handle null/undefined response', () => {
      expect(normalizePage(null)).toEqual({ results: [], next: null });
      expect(normalizePage(undefined)).toEqual({ results: [], next: null });
    });

    it('should handle empty results', () => {
      const response = {
        results: [],
        next: null
      };
      const result = normalizePage(response);
      expect(result).toEqual({ results: [], next: null });
    });

    it('should handle response without next cursor', () => {
      const response = {
        results: [{ id: 1 }]
      };
      const result = normalizePage(response);
      expect(result.next).toBeNull();
    });

    it('should handle unknown response format', () => {
      const response = { unknown: 'format' };
      const result = normalizePage(response);
      expect(result).toEqual({ results: [], next: null });
    });
  });
});

