import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as courseService from '../../../src/services/courseService';
import apiClient from '../../../src/services/api';

vi.mock('../../../src/services/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('courseService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAllCourses', () => {
    it('should call courses endpoint without params', async () => {
      const mockResponse = { data: { results: [] } };
      apiClient.get.mockResolvedValue(mockResponse);

      await courseService.getAllCourses();

      expect(apiClient.get).toHaveBeenCalledWith('/courses/', { params: {} });
    });

    it('should include search query in params', async () => {
      const mockResponse = { data: { results: [] } };
      apiClient.get.mockResolvedValue(mockResponse);

      await courseService.getAllCourses('test query');

      expect(apiClient.get).toHaveBeenCalledWith('/courses/', {
        params: { title: 'test query' },
      });
    });

    it('should include cursor in params', async () => {
      const mockResponse = { data: { results: [] } };
      apiClient.get.mockResolvedValue(mockResponse);

      await courseService.getAllCourses('', 'cursor123');

      expect(apiClient.get).toHaveBeenCalledWith('/courses/', {
        params: { cursor: 'cursor123' },
      });
    });

    it('should include owner in params', async () => {
      const mockResponse = { data: { results: [] } };
      apiClient.get.mockResolvedValue(mockResponse);

      await courseService.getAllCourses('', null, 1);

      expect(apiClient.get).toHaveBeenCalledWith('/courses/', {
        params: { owner: 1 },
      });
    });
  });

  describe('getCourseDetail', () => {
    it('should call course detail endpoint', async () => {
      const mockCourse = { id: 1, title: 'Test Course' };
      apiClient.get.mockResolvedValue({ data: mockCourse });

      const result = await courseService.getCourseDetail(1);

      expect(apiClient.get).toHaveBeenCalledWith('/courses/1/');
      expect(result).toEqual(mockCourse);
    });
  });

  describe('createCourse', () => {
    it('should call create endpoint with FormData', async () => {
      const formData = new FormData();
      formData.append('title', 'New Course');
      const mockResponse = { data: { id: 1, title: 'New Course' } };
      apiClient.post.mockResolvedValue(mockResponse);

      const result = await courseService.createCourse(formData);

      expect(apiClient.post).toHaveBeenCalledWith('/courses/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('updateCourse', () => {
    it('should call update endpoint with FormData', async () => {
      const formData = new FormData();
      formData.append('title', 'Updated Course');
      const mockResponse = { data: { id: 1, title: 'Updated Course' } };
      apiClient.put.mockResolvedValue(mockResponse);

      const result = await courseService.updateCourse(1, formData);

      expect(apiClient.put).toHaveBeenCalledWith('/courses/1/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('updateCourseMeta', () => {
    it('should call patch endpoint with payload', async () => {
      const payload = { title: 'Updated Title' };
      const mockResponse = { data: { id: 1, ...payload } };
      apiClient.patch.mockResolvedValue(mockResponse);

      const result = await courseService.updateCourseMeta(1, payload);

      expect(apiClient.patch).toHaveBeenCalledWith('/courses/1/', payload);
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('deleteCourse', () => {
    it('should call delete endpoint', async () => {
      apiClient.delete.mockResolvedValue({});

      await courseService.deleteCourse(1);

      expect(apiClient.delete).toHaveBeenCalledWith('/courses/1/');
    });
  });

  describe('getChaptersForCourse', () => {
    it('should call chapters endpoint', async () => {
      const mockChapters = { results: [{ id: 1 }] };
      apiClient.get.mockResolvedValue({ data: mockChapters });

      const result = await courseService.getChaptersForCourse(1);

      expect(apiClient.get).toHaveBeenCalledWith('/courses/1/chapters/');
      expect(result).toEqual(mockChapters);
    });
  });

  describe('createChapter', () => {
    it('should call create chapter endpoint', async () => {
      const payload = { title: 'New Chapter' };
      const mockResponse = { data: { id: 1, ...payload } };
      apiClient.post.mockResolvedValue(mockResponse);

      const result = await courseService.createChapter(1, payload);

      expect(apiClient.post).toHaveBeenCalledWith('/courses/1/chapters/', payload);
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('updateChapter', () => {
    it('should call update chapter endpoint', async () => {
      const payload = { title: 'Updated Chapter' };
      const mockResponse = { data: { id: 1, ...payload } };
      apiClient.patch.mockResolvedValue(mockResponse);

      const result = await courseService.updateChapter(1, 1, payload);

      expect(apiClient.patch).toHaveBeenCalledWith('/courses/1/chapters/1/', payload);
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('deleteChapter', () => {
    it('should call delete chapter endpoint', async () => {
      apiClient.delete.mockResolvedValue({});

      await courseService.deleteChapter(1, 1);

      expect(apiClient.delete).toHaveBeenCalledWith('/courses/1/chapters/1/');
    });
  });

  describe('getLessonsForChapter', () => {
    it('should call lessons endpoint', async () => {
      const mockLessons = { results: [{ id: 1 }] };
      apiClient.get.mockResolvedValue({ data: mockLessons });

      const result = await courseService.getLessonsForChapter(1, 1);

      expect(apiClient.get).toHaveBeenCalledWith('/courses/1/chapters/1/lessons/');
      expect(result).toEqual(mockLessons);
    });
  });

  describe('createLesson', () => {
    it('should call create lesson endpoint', async () => {
      const payload = { title: 'New Lesson', content: 'Content' };
      const mockResponse = { data: { id: 1, ...payload } };
      apiClient.post.mockResolvedValue(mockResponse);

      const result = await courseService.createLesson(1, 1, payload);

      expect(apiClient.post).toHaveBeenCalledWith('/courses/1/chapters/1/lessons/', payload);
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('getLesson', () => {
    it('should call lesson detail endpoint', async () => {
      const mockLesson = { id: 1, title: 'Lesson' };
      apiClient.get.mockResolvedValue({ data: mockLesson });

      const result = await courseService.getLesson(1, 1, 1);

      expect(apiClient.get).toHaveBeenCalledWith('/courses/1/chapters/1/lessons/1/');
      expect(result).toEqual(mockLesson);
    });
  });

  describe('updateLesson', () => {
    it('should call update lesson endpoint', async () => {
      const payload = { title: 'Updated Lesson' };
      const mockResponse = { data: { id: 1, ...payload } };
      apiClient.patch.mockResolvedValue(mockResponse);

      const result = await courseService.updateLesson(1, 1, 1, payload);

      expect(apiClient.patch).toHaveBeenCalledWith('/courses/1/chapters/1/lessons/1/', payload);
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('deleteLesson', () => {
    it('should call delete lesson endpoint', async () => {
      apiClient.delete.mockResolvedValue({});

      await courseService.deleteLesson(1, 1, 1);

      expect(apiClient.delete).toHaveBeenCalledWith('/courses/1/chapters/1/lessons/1/');
    });
  });
});
