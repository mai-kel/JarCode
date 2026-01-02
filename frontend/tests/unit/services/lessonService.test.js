import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as lessonService from '../../../src/services/lessonService';
import apiClient from '../../../src/services/api';

vi.mock('../../../src/services/api', () => ({
  default: {
    post: vi.fn()
  }
}));

describe('lessonService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('uploadLessonImage', () => {
    it('should upload image with FormData', async () => {
      const imageBlob = new Blob(['image data'], { type: 'image/png' });
      const filename = 'test.png';
      const onProgress = vi.fn();
      const mockResponse = { data: { location: 'https://example.com/image.jpg' } };

      apiClient.post.mockResolvedValue(mockResponse);

      const result = await lessonService.uploadLessonImage(1, imageBlob, filename, onProgress);

      expect(apiClient.post).toHaveBeenCalledWith(
        '/lessons/upload-image/',
        expect.any(FormData),
        expect.objectContaining({
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: expect.any(Function)
        })
      );
      expect(result).toBe('https://example.com/image.jpg');
    });

    it('should call onProgress callback', async () => {
      const imageBlob = new Blob(['image data'], { type: 'image/png' });
      const filename = 'test.png';
      const onProgress = vi.fn();
      const mockResponse = { data: { location: 'https://example.com/image.jpg' } };

      apiClient.post.mockImplementation((url, data, config) => {
        if (config.onUploadProgress) {
          config.onUploadProgress({
            lengthComputable: true,
            loaded: 50,
            total: 100
          });
        }
        return Promise.resolve(mockResponse);
      });

      await lessonService.uploadLessonImage(1, imageBlob, filename, onProgress);

      expect(onProgress).toHaveBeenCalledWith(50);
    });

    it('should throw error when no location returned', async () => {
      const imageBlob = new Blob(['image data'], { type: 'image/png' });
      const filename = 'test.png';
      const mockResponse = { data: {} };

      apiClient.post.mockResolvedValue(mockResponse);

      await expect(
        lessonService.uploadLessonImage(1, imageBlob, filename)
      ).rejects.toThrow('No location returned from server');
    });

    it('should not call onProgress when not provided', async () => {
      const imageBlob = new Blob(['image data'], { type: 'image/png' });
      const filename = 'test.png';
      const mockResponse = { data: { location: 'https://example.com/image.jpg' } };

      apiClient.post.mockResolvedValue(mockResponse);

      await lessonService.uploadLessonImage(1, imageBlob, filename);

      expect(apiClient.post).toHaveBeenCalled();
    });
  });
});

