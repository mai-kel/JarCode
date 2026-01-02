import { describe, it, expect, vi } from 'vitest';
import {
  createTinyMCEConfig,
  STANDARD_PLUGINS,
  STANDARD_TOOLBAR,
  CODESAMPLE_LANGUAGES
} from '../../../src/utils/tinymceConfig';

describe('tinymceConfig', () => {
  describe('createTinyMCEConfig', () => {
    it('should create config with default values', () => {
      const config = createTinyMCEConfig();

      expect(config.height).toBe(500);
      expect(config.menubar).toBe(false);
      expect(config.plugins).toEqual(STANDARD_PLUGINS);
      expect(config.toolbar).toBe(STANDARD_TOOLBAR);
      expect(config.codesample_languages).toEqual(CODESAMPLE_LANGUAGES);
    });

    it('should accept custom height', () => {
      const config = createTinyMCEConfig({ height: 600 });
      expect(config.height).toBe(600);
    });

    it('should include image plugin when image upload is enabled', () => {
      const imageUploadHandler = vi.fn();
      const config = createTinyMCEConfig({
        enableImageUpload: true,
        imageUploadHandler
      });

      expect(config.plugins).toContain('image');
      expect(config.automatic_uploads).toBe(true);
      expect(config.images_upload_handler).toBe(imageUploadHandler);
    });

    it('should add image to toolbar when image upload is enabled', () => {
      const config = createTinyMCEConfig({
        enableImageUpload: true,
        imageUploadHandler: vi.fn()
      });

      expect(config.toolbar).toContain('image');
    });

    it('should accept custom toolbar', () => {
      const customToolbar = 'bold italic | code';
      const config = createTinyMCEConfig({ toolbar: customToolbar });
      expect(config.toolbar).toBe(customToolbar);
    });

    it('should accept custom plugins', () => {
      const customPlugins = ['code', 'fullscreen'];
      const config = createTinyMCEConfig({ plugins: customPlugins });
      expect(config.plugins).toEqual(customPlugins);
    });

    it('should accept custom codesample languages', () => {
      const customLanguages = [
        { text: 'Python', value: 'python' },
        { text: 'JavaScript', value: 'javascript' }
      ];
      const config = createTinyMCEConfig({ codesampleLanguages: customLanguages });
      expect(config.codesample_languages).toEqual(customLanguages);
    });

    it('should set codesample_global_prismjs to true', () => {
      const config = createTinyMCEConfig();
      expect(config.codesample_global_prismjs).toBe(true);
    });

    it('should include content_css and content_style', () => {
      const config = createTinyMCEConfig();
      expect(config.content_css).toBeDefined();
      expect(Array.isArray(config.content_css)).toBe(true);
      expect(config.content_style).toBeDefined();
      expect(typeof config.content_style).toBe('string');
    });

    it('should not include image plugin when image upload is disabled', () => {
      const config = createTinyMCEConfig({ enableImageUpload: false });
      expect(config.plugins).not.toContain('image');
      expect(config.automatic_uploads).toBeUndefined();
      expect(config.images_upload_handler).toBeUndefined();
    });

    it('should not modify toolbar when image upload is disabled', () => {
      const config = createTinyMCEConfig({ enableImageUpload: false });
      expect(config.toolbar).toBe(STANDARD_TOOLBAR);
    });
  });
});

