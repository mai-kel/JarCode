import { defineStore } from 'pinia';
import { ref } from 'vue';
import * as courseService from '../services/courseService';
import * as lessonService from '../services/lessonService';
import { getErrorMessage } from '../utils/errorHandler';

export const useCourseStore = defineStore('course', () => {
  const isLoading = ref(false);
  const error = ref(null);

  async function createCourse(formData) {
    isLoading.value = true;
    error.value = null;
    try {
      const data = await courseService.createCourse(formData);
      return data;
    } catch (err) {
      error.value = {
        message: getErrorMessage(err),
        details: err.details || err,
        status: err.status || 0,
      };
      return null;
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchCourse(courseId) {
    isLoading.value = true;
    error.value = null;
    try {
      const data = await courseService.getCourseDetail(courseId);
      return data;
    } catch (err) {
      error.value = {
        message: getErrorMessage(err),
        details: err.details || err,
        status: err.status || 0,
      };
      return null;
    } finally {
      isLoading.value = false;
    }
  }

  async function updateCourse(courseId, formData) {
    isLoading.value = true;
    error.value = null;
    try {
      const data = await courseService.updateCourse(courseId, formData);
      return data;
    } catch (err) {
      error.value = {
        message: getErrorMessage(err),
        details: err.details || err,
        status: err.status || 0,
      };
      return null;
    } finally {
      isLoading.value = false;
    }
  }

  async function updateCourseMeta(courseId, payload) {
    isLoading.value = true;
    error.value = null;
    try {
      const data = await courseService.updateCourseMeta(courseId, payload);
      return data;
    } catch (err) {
      error.value = {
        message: getErrorMessage(err),
        details: err.details || err,
        status: err.status || 0,
      };
      return null;
    } finally {
      isLoading.value = false;
    }
  }

  async function createChapter(courseId, payload) {
    isLoading.value = true;
    error.value = null;
    try {
      const data = await courseService.createChapter(courseId, payload);
      return data;
    } catch (err) {
      error.value = {
        message: getErrorMessage(err),
        details: err.details || err,
        status: err.status || 0,
      };
      return null;
    } finally {
      isLoading.value = false;
    }
  }

  async function updateChapter(courseId, chapterId, payload) {
    isLoading.value = true;
    error.value = null;
    try {
      const data = await courseService.updateChapter(courseId, chapterId, payload);
      return data;
    } catch (err) {
      error.value = {
        message: getErrorMessage(err),
        details: err.details || err,
        status: err.status || 0,
      };
      return null;
    } finally {
      isLoading.value = false;
    }
  }

  async function createLesson(courseId, chapterId, payload) {
    isLoading.value = true;
    error.value = null;
    try {
      const data = await courseService.createLesson(courseId, chapterId, payload);
      return data;
    } catch (err) {
      error.value = {
        message: getErrorMessage(err),
        details: err.details || err,
        status: err.status || 0,
      };
      return null;
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchLesson(courseId, chapterId, lessonId) {
    isLoading.value = true;
    error.value = null;
    try {
      const data = await courseService.getLesson(courseId, chapterId, lessonId);
      return data;
    } catch (err) {
      error.value = {
        message: getErrorMessage(err),
        details: err.details || err,
        status: err.status || 0,
      };
      return null;
    } finally {
      isLoading.value = false;
    }
  }

  async function updateLesson(courseId, chapterId, lessonId, payload) {
    isLoading.value = true;
    error.value = null;
    try {
      const data = await courseService.updateLesson(courseId, chapterId, lessonId, payload);
      return data;
    } catch (err) {
      error.value = {
        message: getErrorMessage(err),
        details: err.details || err,
        status: err.status || 0,
      };
      return null;
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchChapters(courseId) {
    isLoading.value = true;
    error.value = null;
    try {
      const data = await courseService.getChaptersForCourse(courseId);
      return data;
    } catch (err) {
      error.value = {
        message: getErrorMessage(err),
        details: err.details || err,
        status: err.status || 0,
      };
      return [];
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchLessons(courseId, chapterId) {
    isLoading.value = true;
    error.value = null;
    try {
      const data = await courseService.getLessonsForChapter(courseId, chapterId);
      return data;
    } catch (err) {
      error.value = {
        message: getErrorMessage(err),
        details: err.details || err,
        status: err.status || 0,
      };
      return [];
    } finally {
      isLoading.value = false;
    }
  }

  async function getAllCourses(searchQuery = '', cursor = null, ownerId = null) {
    isLoading.value = true;
    error.value = null;
    try {
      const data = await courseService.getAllCourses(searchQuery, cursor, ownerId);
      return data;
    } catch (err) {
      error.value = {
        message: getErrorMessage(err),
        details: err.details || err,
        status: err.status || 0,
      };
      return { results: [], next: null, previous: null };
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchMyCourses(ownerId) {
    isLoading.value = true;
    error.value = null;
    try {
      const data = await courseService.getAllCourses('', null, ownerId);
      return data;
    } catch (err) {
      error.value = {
        message: getErrorMessage(err),
        details: err.details || err,
        status: err.status || 0,
      };
      return { results: [], next: null, previous: null };
    } finally {
      isLoading.value = false;
    }
  }

  async function deleteCourse(courseId) {
    isLoading.value = true;
    error.value = null;
    try {
      await courseService.deleteCourse(courseId);
      return true;
    } catch (err) {
      error.value = {
        message: getErrorMessage(err),
        details: err.details || err,
        status: err.status || 0,
      };
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  async function deleteChapter(courseId, chapterId) {
    isLoading.value = true;
    error.value = null;
    try {
      await courseService.deleteChapter(courseId, chapterId);
      return true;
    } catch (err) {
      error.value = {
        message: getErrorMessage(err),
        details: err.details || err,
        status: err.status || 0,
      };
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  async function deleteLesson(courseId, chapterId, lessonId) {
    isLoading.value = true;
    error.value = null;
    try {
      await courseService.deleteLesson(courseId, chapterId, lessonId);
      return true;
    } catch (err) {
      error.value = {
        message: getErrorMessage(err),
        details: err.details || err,
        status: err.status || 0,
      };
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Upload image for a lesson
   * @param {number} lessonId - Lesson ID
   * @param {Blob} imageBlob - Image blob
   * @param {string} filename - Image filename
   * @param {Function} onProgress - Progress callback
   * @returns {Promise<string>} Image location URL
   */
  async function uploadLessonImage(lessonId, imageBlob, filename, onProgress) {
    isLoading.value = true;
    error.value = null;
    try {
      return await lessonService.uploadLessonImage(lessonId, imageBlob, filename, onProgress);
    } catch (err) {
      error.value = {
        message: getErrorMessage(err),
        details: err.details || err,
        status: err.status || 0,
      };
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Clear error
   */
  function clearError() {
    error.value = null;
  }

  return {
    isLoading,
    error,
    createCourse,
    fetchCourse,
    updateCourse,
    updateCourseMeta,
    createChapter,
    updateChapter,
    createLesson,
    fetchLesson,
    updateLesson,
    fetchChapters,
    fetchLessons,
    getAllCourses,
    fetchMyCourses,
    deleteCourse,
    deleteChapter,
    deleteLesson,
    uploadLessonImage,
    clearError,
  };
});
