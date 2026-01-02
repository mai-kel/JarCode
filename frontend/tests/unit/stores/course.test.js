import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useCourseStore } from '../../../src/store/course';
import * as courseService from '../../../src/services/courseService';
import * as lessonService from '../../../src/services/lessonService';

vi.mock('../../../src/services/courseService');
vi.mock('../../../src/services/lessonService');

describe('course store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  describe('getAllCourses', () => {
    it('should get all courses successfully', async () => {
      const store = useCourseStore();
      const mockResponse = {
        results: [{ id: 1 }, { id: 2 }],
        next: 'cursor123',
      };
      courseService.getAllCourses.mockResolvedValue(mockResponse);

      const result = await store.getAllCourses('test', 'cursor', 1);

      expect(result).toEqual(mockResponse);
      expect(store.isLoading).toBe(false);
    });

    it('should handle error and return empty results', async () => {
      const store = useCourseStore();
      const error = { message: 'Failed', status: 500 };
      courseService.getAllCourses.mockRejectedValue(error);

      const result = await store.getAllCourses();

      expect(result).toEqual({ results: [], next: null, previous: null });
      expect(store.error).toBeDefined();
    });
  });

  describe('fetchCourse', () => {
    it('should fetch course successfully', async () => {
      const store = useCourseStore();
      const mockCourse = { id: 1, title: 'Test Course' };
      courseService.getCourseDetail.mockResolvedValue(mockCourse);

      const result = await store.fetchCourse(1);

      expect(result).toEqual(mockCourse);
      expect(store.isLoading).toBe(false);
    });

    it('should handle fetch error', async () => {
      const store = useCourseStore();
      const error = { message: 'Not found', status: 404 };
      courseService.getCourseDetail.mockRejectedValue(error);

      const result = await store.fetchCourse(1);

      expect(result).toBeNull();
      expect(store.error).toBeDefined();
    });
  });

  describe('createCourse', () => {
    it('should create course successfully', async () => {
      const store = useCourseStore();
      const formData = new FormData();
      const mockCourse = { id: 1, title: 'New Course' };
      courseService.createCourse.mockResolvedValue(mockCourse);

      const result = await store.createCourse(formData);

      expect(result).toEqual(mockCourse);
      expect(store.isLoading).toBe(false);
    });

    it('should handle create error', async () => {
      const store = useCourseStore();
      const error = { message: 'Create failed', status: 400 };
      courseService.createCourse.mockRejectedValue(error);

      const result = await store.createCourse(new FormData());

      expect(result).toBeNull();
      expect(store.error).toBeDefined();
    });
  });

  describe('updateCourse', () => {
    it('should update course successfully', async () => {
      const store = useCourseStore();
      const formData = new FormData();
      const mockCourse = { id: 1, title: 'Updated' };
      courseService.updateCourse.mockResolvedValue(mockCourse);

      const result = await store.updateCourse(1, formData);

      expect(result).toEqual(mockCourse);
    });

    it('should handle update error', async () => {
      const store = useCourseStore();
      const error = { message: 'Update failed', status: 400 };
      courseService.updateCourse.mockRejectedValue(error);

      const result = await store.updateCourse(1, new FormData());

      expect(result).toBeNull();
    });
  });

  describe('deleteCourse', () => {
    it('should delete course successfully', async () => {
      const store = useCourseStore();
      courseService.deleteCourse.mockResolvedValue(undefined);

      const result = await store.deleteCourse(1);

      expect(result).toBe(true);
      expect(store.isLoading).toBe(false);
    });

    it('should handle delete error', async () => {
      const store = useCourseStore();
      const error = { message: 'Delete failed', status: 403 };
      courseService.deleteCourse.mockRejectedValue(error);

      const result = await store.deleteCourse(1);

      expect(result).toBe(false);
      expect(store.error).toBeDefined();
    });
  });

  describe('fetchChapters', () => {
    it('should fetch chapters successfully', async () => {
      const store = useCourseStore();
      const mockChapters = { results: [{ id: 1 }] };
      courseService.getChaptersForCourse.mockResolvedValue(mockChapters);

      const result = await store.fetchChapters(1);

      expect(result).toEqual(mockChapters);
    });

    it('should handle fetch error', async () => {
      const store = useCourseStore();
      const error = { message: 'Failed', status: 500 };
      courseService.getChaptersForCourse.mockRejectedValue(error);

      const result = await store.fetchChapters(1);

      expect(result).toEqual([]);
      expect(store.error).toBeDefined();
    });
  });

  describe('fetchLessons', () => {
    it('should fetch lessons successfully', async () => {
      const store = useCourseStore();
      const mockLessons = { results: [{ id: 1 }] };
      courseService.getLessonsForChapter.mockResolvedValue(mockLessons);

      const result = await store.fetchLessons(1, 1);

      expect(result).toEqual(mockLessons);
    });

    it('should handle fetch error', async () => {
      const store = useCourseStore();
      const error = { message: 'Failed', status: 500 };
      courseService.getLessonsForChapter.mockRejectedValue(error);

      const result = await store.fetchLessons(1, 1);

      expect(result).toEqual([]);
      expect(store.error).toBeDefined();
    });
  });

  describe('uploadLessonImage', () => {
    it('should upload image successfully', async () => {
      const store = useCourseStore();
      const imageBlob = new Blob(['image'], { type: 'image/png' });
      const onProgress = vi.fn();
      lessonService.uploadLessonImage.mockResolvedValue('https://example.com/image.jpg');

      const result = await store.uploadLessonImage(1, imageBlob, 'test.png', onProgress);

      expect(result).toBe('https://example.com/image.jpg');
      expect(store.isLoading).toBe(false);
    });

    it('should handle upload error', async () => {
      const store = useCourseStore();
      const error = { message: 'Upload failed', status: 400 };
      lessonService.uploadLessonImage.mockRejectedValue(error);

      await expect(store.uploadLessonImage(1, new Blob(), 'test.png')).rejects.toThrow();

      expect(store.error).toBeDefined();
    });
  });

  describe('updateCourseMeta', () => {
    it('should update course meta successfully', async () => {
      const store = useCourseStore();
      const payload = { title: 'Updated Title' };
      const mockCourse = { id: 1, title: 'Updated Title' };
      courseService.updateCourseMeta.mockResolvedValue(mockCourse);

      const result = await store.updateCourseMeta(1, payload);

      expect(result).toEqual(mockCourse);
      expect(store.isLoading).toBe(false);
    });

    it('should handle update meta error', async () => {
      const store = useCourseStore();
      const error = { message: 'Update failed', status: 400 };
      courseService.updateCourseMeta.mockRejectedValue(error);

      const result = await store.updateCourseMeta(1, {});

      expect(result).toBeNull();
      expect(store.error).toBeDefined();
    });
  });

  describe('createChapter', () => {
    it('should create chapter successfully', async () => {
      const store = useCourseStore();
      const payload = { title: 'New Chapter' };
      const mockChapter = { id: 1, title: 'New Chapter' };
      courseService.createChapter.mockResolvedValue(mockChapter);

      const result = await store.createChapter(1, payload);

      expect(result).toEqual(mockChapter);
      expect(store.isLoading).toBe(false);
    });

    it('should handle create chapter error', async () => {
      const store = useCourseStore();
      const error = { message: 'Create failed', status: 400 };
      courseService.createChapter.mockRejectedValue(error);

      const result = await store.createChapter(1, {});

      expect(result).toBeNull();
      expect(store.error).toBeDefined();
    });
  });

  describe('updateChapter', () => {
    it('should update chapter successfully', async () => {
      const store = useCourseStore();
      const payload = { title: 'Updated Chapter' };
      const mockChapter = { id: 1, title: 'Updated Chapter' };
      courseService.updateChapter.mockResolvedValue(mockChapter);

      const result = await store.updateChapter(1, 1, payload);

      expect(result).toEqual(mockChapter);
      expect(store.isLoading).toBe(false);
    });

    it('should handle update chapter error', async () => {
      const store = useCourseStore();
      const error = { message: 'Update failed', status: 400 };
      courseService.updateChapter.mockRejectedValue(error);

      const result = await store.updateChapter(1, 1, {});

      expect(result).toBeNull();
      expect(store.error).toBeDefined();
    });
  });

  describe('createLesson', () => {
    it('should create lesson successfully', async () => {
      const store = useCourseStore();
      const payload = { title: 'New Lesson', content: 'Content' };
      const mockLesson = { id: 1, title: 'New Lesson' };
      courseService.createLesson.mockResolvedValue(mockLesson);

      const result = await store.createLesson(1, 1, payload);

      expect(result).toEqual(mockLesson);
      expect(store.isLoading).toBe(false);
    });

    it('should handle create lesson error', async () => {
      const store = useCourseStore();
      const error = { message: 'Create failed', status: 400 };
      courseService.createLesson.mockRejectedValue(error);

      const result = await store.createLesson(1, 1, {});

      expect(result).toBeNull();
      expect(store.error).toBeDefined();
    });
  });

  describe('fetchLesson', () => {
    it('should fetch lesson successfully', async () => {
      const store = useCourseStore();
      const mockLesson = { id: 1, title: 'Test Lesson' };
      courseService.getLesson.mockResolvedValue(mockLesson);

      const result = await store.fetchLesson(1, 1, 1);

      expect(result).toEqual(mockLesson);
      expect(store.isLoading).toBe(false);
    });

    it('should handle fetch lesson error', async () => {
      const store = useCourseStore();
      const error = { message: 'Not found', status: 404 };
      courseService.getLesson.mockRejectedValue(error);

      const result = await store.fetchLesson(1, 1, 1);

      expect(result).toBeNull();
      expect(store.error).toBeDefined();
    });
  });

  describe('updateLesson', () => {
    it('should update lesson successfully', async () => {
      const store = useCourseStore();
      const payload = { title: 'Updated Lesson' };
      const mockLesson = { id: 1, title: 'Updated Lesson' };
      courseService.updateLesson.mockResolvedValue(mockLesson);

      const result = await store.updateLesson(1, 1, 1, payload);

      expect(result).toEqual(mockLesson);
      expect(store.isLoading).toBe(false);
    });

    it('should handle update lesson error', async () => {
      const store = useCourseStore();
      const error = { message: 'Update failed', status: 400 };
      courseService.updateLesson.mockRejectedValue(error);

      const result = await store.updateLesson(1, 1, 1, {});

      expect(result).toBeNull();
      expect(store.error).toBeDefined();
    });
  });

  describe('fetchMyCourses', () => {
    it('should fetch my courses successfully', async () => {
      const store = useCourseStore();
      const mockResponse = {
        results: [{ id: 1 }],
        next: null,
      };
      courseService.getAllCourses.mockResolvedValue(mockResponse);

      const result = await store.fetchMyCourses(1);

      expect(result).toEqual(mockResponse);
      expect(courseService.getAllCourses).toHaveBeenCalledWith('', null, 1);
    });

    it('should handle fetch my courses error', async () => {
      const store = useCourseStore();
      const error = { message: 'Failed', status: 500 };
      courseService.getAllCourses.mockRejectedValue(error);

      const result = await store.fetchMyCourses(1);

      expect(result).toEqual({ results: [], next: null, previous: null });
      expect(store.error).toBeDefined();
    });
  });

  describe('deleteChapter', () => {
    it('should delete chapter successfully', async () => {
      const store = useCourseStore();
      courseService.deleteChapter.mockResolvedValue(undefined);

      const result = await store.deleteChapter(1, 1);

      expect(result).toBe(true);
      expect(store.isLoading).toBe(false);
    });

    it('should handle delete chapter error', async () => {
      const store = useCourseStore();
      const error = { message: 'Delete failed', status: 403 };
      courseService.deleteChapter.mockRejectedValue(error);

      const result = await store.deleteChapter(1, 1);

      expect(result).toBe(false);
      expect(store.error).toBeDefined();
    });
  });

  describe('deleteLesson', () => {
    it('should delete lesson successfully', async () => {
      const store = useCourseStore();
      courseService.deleteLesson.mockResolvedValue(undefined);

      const result = await store.deleteLesson(1, 1, 1);

      expect(result).toBe(true);
      expect(store.isLoading).toBe(false);
    });

    it('should handle delete lesson error', async () => {
      const store = useCourseStore();
      const error = { message: 'Delete failed', status: 403 };
      courseService.deleteLesson.mockRejectedValue(error);

      const result = await store.deleteLesson(1, 1, 1);

      expect(result).toBe(false);
      expect(store.error).toBeDefined();
    });
  });

  describe('clearError', () => {
    it('should clear error', () => {
      const store = useCourseStore();
      store.error = { message: 'Error' };
      store.clearError();
      expect(store.error).toBeNull();
    });
  });
});
