import { describe, it, expect } from 'vitest';
import { parseApiErrorFields } from '../../../src/utils/parseApiError';

describe('parseApiError', () => {
  describe('parseApiErrorFields', () => {
    it('should return empty object for null/undefined', () => {
      expect(parseApiErrorFields(null)).toEqual({});
      expect(parseApiErrorFields(undefined)).toEqual({});
    });

    it('should parse string error', () => {
      const result = parseApiErrorFields('Error message');
      expect(result).toEqual({ _non_field: ['Error message'] });
    });

    it('should parse array error', () => {
      const result = parseApiErrorFields(['Error 1', 'Error 2']);
      expect(result).toEqual({ _non_field: ['Error 1', 'Error 2'] });
    });

    it('should parse object with field errors', () => {
      const error = {
        email: ['Invalid email'],
        password: ['Too short']
      };
      const result = parseApiErrorFields(error);
      expect(result.email).toEqual(['Invalid email']);
      expect(result.password).toEqual(['Too short']);
    });

    it('should parse non_field_errors', () => {
      const error = {
        non_field_errors: ['General error']
      };
      const result = parseApiErrorFields(error);
      expect(result._non_field).toEqual(['General error']);
    });

    it('should parse detail as _non_field', () => {
      const error = {
        detail: 'Detail error'
      };
      const result = parseApiErrorFields(error);
      expect(result._non_field).toEqual(['Detail error']);
    });

    it('should parse stringified list arrays', () => {
      const error = {
        field: ["['Error 1', 'Error 2']"]
      };
      const result = parseApiErrorFields(error);
      expect(result.field).toEqual(['Error 1', 'Error 2']);
    });

    it('should parse stringified list strings', () => {
      const error = {
        field: "['Error 1', 'Error 2']"
      };
      const result = parseApiErrorFields(error);
      expect(result.field).toEqual(['Error 1', 'Error 2']);
    });

    it('should handle mixed array and string values', () => {
      const error = {
        field: ['Error 1', "['Error 2', 'Error 3']", 'Error 4']
      };
      const result = parseApiErrorFields(error);
      expect(result.field).toContain('Error 1');
      expect(result.field).toContain('Error 2');
      expect(result.field).toContain('Error 3');
      expect(result.field).toContain('Error 4');
    });

    it('should convert non-string values to strings', () => {
      const error = {
        field: [123, true, null]
      };
      const result = parseApiErrorFields(error);
      expect(result.field).toEqual(['123', 'true', 'null']);
    });

    it('should handle empty arrays', () => {
      const error = {
        field: []
      };
      const result = parseApiErrorFields(error);
      expect(result.field).toEqual([]);
    });
  });
});

