import { describe, it, expect } from 'vitest';
import {
  mapToMonacoLanguage,
  mapFromMonacoLanguage,
} from '../../../src/utils/monacoLanguageMapper';

describe('monacoLanguageMapper', () => {
  describe('mapToMonacoLanguage', () => {
    it('should map JAVA to java', () => {
      expect(mapToMonacoLanguage('JAVA')).toBe('java');
    });

    it('should map PYTHON to python', () => {
      expect(mapToMonacoLanguage('PYTHON')).toBe('python');
    });

    it('should map CPP to cpp', () => {
      expect(mapToMonacoLanguage('CPP')).toBe('cpp');
      expect(mapToMonacoLanguage('C++')).toBe('cpp');
    });

    it('should map C to c', () => {
      expect(mapToMonacoLanguage('C')).toBe('c');
    });

    it('should map CSHARP to csharp', () => {
      expect(mapToMonacoLanguage('CSHARP')).toBe('csharp');
      expect(mapToMonacoLanguage('C#')).toBe('csharp');
    });

    it('should map JAVASCRIPT to javascript', () => {
      expect(mapToMonacoLanguage('JAVASCRIPT')).toBe('javascript');
      expect(mapToMonacoLanguage('JS')).toBe('javascript');
    });

    it('should map TYPESCRIPT to typescript', () => {
      expect(mapToMonacoLanguage('TYPESCRIPT')).toBe('typescript');
      expect(mapToMonacoLanguage('TS')).toBe('typescript');
    });

    it('should map RUST to rust', () => {
      expect(mapToMonacoLanguage('RUST')).toBe('rust');
    });

    it('should map GO to go', () => {
      expect(mapToMonacoLanguage('GO')).toBe('go');
    });

    it('should default to python for unknown language', () => {
      expect(mapToMonacoLanguage('UNKNOWN')).toBe('python');
      expect(mapToMonacoLanguage('')).toBe('python');
      expect(mapToMonacoLanguage(null)).toBe('python');
      expect(mapToMonacoLanguage(undefined)).toBe('python');
    });

    it('should handle case-insensitive input', () => {
      expect(mapToMonacoLanguage('java')).toBe('java');
      expect(mapToMonacoLanguage('Python')).toBe('python');
    });
  });

  describe('mapFromMonacoLanguage', () => {
    it('should map java to JAVA', () => {
      expect(mapFromMonacoLanguage('java')).toBe('JAVA');
    });

    it('should map python to PYTHON', () => {
      expect(mapFromMonacoLanguage('python')).toBe('PYTHON');
    });

    it('should map cpp to CPP', () => {
      expect(mapFromMonacoLanguage('cpp')).toBe('CPP');
    });

    it('should map c to C', () => {
      expect(mapFromMonacoLanguage('c')).toBe('C');
    });

    it('should map csharp to CSHARP', () => {
      expect(mapFromMonacoLanguage('csharp')).toBe('CSHARP');
    });

    it('should map javascript to JAVASCRIPT', () => {
      expect(mapFromMonacoLanguage('javascript')).toBe('JAVASCRIPT');
    });

    it('should map typescript to TYPESCRIPT', () => {
      expect(mapFromMonacoLanguage('typescript')).toBe('TYPESCRIPT');
    });

    it('should map rust to RUST', () => {
      expect(mapFromMonacoLanguage('rust')).toBe('RUST');
    });

    it('should map go to GO', () => {
      expect(mapFromMonacoLanguage('go')).toBe('GO');
    });

    it('should default to PYTHON for unknown language', () => {
      expect(mapFromMonacoLanguage('unknown')).toBe('PYTHON');
      expect(mapFromMonacoLanguage('')).toBe('PYTHON');
      expect(mapFromMonacoLanguage(null)).toBe('PYTHON');
      expect(mapFromMonacoLanguage(undefined)).toBe('PYTHON');
    });

    it('should handle case-insensitive input', () => {
      expect(mapFromMonacoLanguage('JAVA')).toBe('JAVA');
      expect(mapFromMonacoLanguage('Python')).toBe('PYTHON');
    });
  });
});
