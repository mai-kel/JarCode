import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useProblemStore } from '../../src/store/problem';
import { useCourseStore } from '../../src/store/course';
import * as problemService from '../../src/services/problemService';
import * as courseService from '../../src/services/courseService';

vi.mock('../../src/services/problemService');
vi.mock('../../src/services/courseService');
vi.mock('../../src/services/lessonService', () => ({
  uploadLessonImage: vi.fn()
}));

describe('CRUD Operations Integration', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  describe('Problem CRUD Flow', () => {
    it('should complete create-read-update-delete flow', async () => {
      const store = useProblemStore();
      const mockProblem = {
        id: 1,
        title: 'Test Problem',
        description: 'Test Description',
        difficulty: 'EASY',
        language: 'PYTHON'
      };

      // Create
      problemService.createProblem.mockResolvedValue(mockProblem);
      const created = await store.createProblem({
        title: 'Test Problem',
        description: 'Test Description',
        difficulty: 'EASY',
        language: 'PYTHON'
      });

      expect(created).toEqual(mockProblem);
      expect(store.currentProblem).toEqual(mockProblem);

      // Read
      problemService.getProblem.mockResolvedValue(mockProblem);
      const fetched = await store.getProblem(1);
      expect(fetched).toEqual(mockProblem);

      // Update
      const updatedProblem = { ...mockProblem, title: 'Updated Problem' };
      problemService.updateProblem.mockResolvedValue(updatedProblem);
      const updated = await store.updateProblem(1, { title: 'Updated Problem' });
      expect(updated).toEqual(updatedProblem);
      expect(store.currentProblem).toEqual(updatedProblem);

      // Delete
      problemService.deleteProblem.mockResolvedValue(undefined);
      const deleted = await store.deleteProblem(1);
      expect(deleted).toBe(true);
      expect(store.currentProblem).toBeNull();
    });
  });

  describe('Course CRUD Flow', () => {
    it('should complete create-read-update-delete flow', async () => {
      const store = useCourseStore();
      const formData = new FormData();
      formData.append('title', 'Test Course');
      const mockCourse = {
        id: 1,
        title: 'Test Course',
        description: 'Test Description'
      };

      // Create
      courseService.createCourse.mockResolvedValue(mockCourse);
      const created = await store.createCourse(formData);
      expect(created).toEqual(mockCourse);

      // Read
      courseService.getCourseDetail.mockResolvedValue(mockCourse);
      const fetched = await store.fetchCourse(1);
      expect(fetched).toEqual(mockCourse);

      // Update
      const updatedCourse = { ...mockCourse, title: 'Updated Course' };
      courseService.updateCourse.mockResolvedValue(updatedCourse);
      const updated = await store.updateCourse(1, formData);
      expect(updated).toEqual(updatedCourse);

      // Delete
      courseService.deleteCourse.mockResolvedValue(undefined);
      const deleted = await store.deleteCourse(1);
      expect(deleted).toBe(true);
    });
  });
});

