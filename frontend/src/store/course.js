import { defineStore, acceptHMRUpdate } from 'pinia';
import { ref } from 'vue';
import apiClient from '../services/api';

export const useCourseStore = defineStore('course', () => {
  const isLoading = ref(false);
  const error = ref(null);

  async function createCourse(formData) {
    isLoading.value = true;
    error.value = null;
    try {
      const res = await apiClient.post('/courses/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return res.data;
    } catch (e) {
      if (e.response?.data) {
        const errorDetails = Object.entries(e.response.data)
          .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`)
          .join('; ');
        error.value = { message: `Failed to create course. ${errorDetails}`, details: e.response.data };
      } else {
        error.value = { message: 'Failed to create course.' };
      }
      return null;
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchCourse(courseId) {
    isLoading.value = true;
    error.value = null;
    try {
      const res = await apiClient.get(`/courses/${courseId}/`);
      return res.data;
    } catch (e) {
      error.value = { message: 'Failed to fetch course.' };
      return null;
    } finally {
      isLoading.value = false;
    }
  }

  async function updateCourse(courseId, formData) {
    isLoading.value = true;
    error.value = null;
    try {
      const res = await apiClient.put(`/courses/${courseId}/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return res.data;
    } catch (e) {
      if (e.response?.data) {
        const errorDetails = Object.entries(e.response.data)
          .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`)
          .join('; ');
        error.value = { message: `Failed to update course. ${errorDetails}`, details: e.response.data };
      } else {
        error.value = { message: 'Failed to update course.' };
      }
      return null;
    } finally {
      isLoading.value = false;
    }
  }

  async function updateCourseMeta(courseId, payload) {
    isLoading.value = true;
    error.value = null;
    try {
      const res = await apiClient.patch(`/courses/${courseId}/`, payload);
      return res.data;
    } catch (e) {
      if (e.response?.data) {
        const errorDetails = Object.entries(e.response.data)
          .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`)
          .join('; ');
        error.value = { message: `Failed to update course. ${errorDetails}`, details: e.response.data };
      } else {
        error.value = { message: 'Failed to update course.' };
      }
      return null;
    } finally {
      isLoading.value = false;
    }
  }

  async function createChapter(courseId, payload) {
    isLoading.value = true;
    error.value = null;
    try {
      const res = await apiClient.post(`/courses/${courseId}/chapters/`, payload);
      return res.data;
    } catch (e) {
      if (e.response?.data) {
        const errorDetails = Object.entries(e.response.data)
          .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`)
          .join('; ');
        error.value = { message: `Failed to create chapter. ${errorDetails}`, details: e.response.data };
      } else {
        error.value = { message: 'Failed to create chapter.' };
      }
      return null;
    } finally {
      isLoading.value = false;
    }
  }

  async function updateChapter(courseId, chapterId, payload) {
    isLoading.value = true;
    error.value = null;
    try {
      const res = await apiClient.patch(`/courses/${courseId}/chapters/${chapterId}/`, payload);
      return res.data;
    } catch (e) {
      if (e.response?.data) {
        const errorDetails = Object.entries(e.response.data)
          .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`)
          .join('; ');
        error.value = { message: `Failed to update chapter. ${errorDetails}`, details: e.response.data };
      } else {
        error.value = { message: 'Failed to update chapter.' };
      }
      return null;
    } finally {
      isLoading.value = false;
    }
  }

  async function createLesson(courseId, chapterId, payload) {
    isLoading.value = true;
    error.value = null;
    try {
      const res = await apiClient.post(`/courses/${courseId}/chapters/${chapterId}/lessons/`, payload);
      return res.data;
    } catch (e) {
      if (e.response?.data) {
        const errorDetails = Object.entries(e.response.data)
          .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`)
          .join('; ');
        error.value = { message: `Failed to create lesson. ${errorDetails}`, details: e.response.data };
      } else {
        error.value = { message: 'Failed to create lesson.' };
      }
      return null;
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchLesson(courseId, chapterId, lessonId) {
    isLoading.value = true;
    error.value = null;
    try {
      const res = await apiClient.get(`/courses/${courseId}/chapters/${chapterId}/lessons/${lessonId}/`);
      return res.data;
    } catch (e) {
      error.value = { message: 'Failed to fetch lesson.' };
      return null;
    } finally {
      isLoading.value = false;
    }
  }

  async function updateLesson(courseId, chapterId, lessonId, payload) {
    isLoading.value = true;
    error.value = null;
    try {
      const res = await apiClient.patch(`/courses/${courseId}/chapters/${chapterId}/lessons/${lessonId}/`, payload);
      return res.data;
    } catch (e) {
      if (e.response?.data) {
        const errorDetails = Object.entries(e.response.data)
          .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`)
          .join('; ');
        error.value = { message: `Failed to update lesson. ${errorDetails}`, details: e.response.data };
      } else {
        error.value = { message: 'Failed to update lesson.' };
      }
      return null;
    } finally {
      isLoading.value = false;
    }
  }

  // Lists
  async function fetchChapters(courseId) {
    isLoading.value = true;
    error.value = null;
    try {
      const res = await apiClient.get(`/courses/${courseId}/chapters/`);
      return res.data;
    } catch (e) {
      error.value = { message: 'Failed to fetch chapters.' };
      return [];
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchLessons(courseId, chapterId) {
    isLoading.value = true;
    error.value = null;
    try {
      const res = await apiClient.get(`/courses/${courseId}/chapters/${chapterId}/lessons/`);
      return res.data;
    } catch (e) {
      error.value = { message: 'Failed to fetch lessons.' };
      return [];
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchMyCourses(ownerId) {
    isLoading.value = true;
    error.value = null;
    try {
      const res = await apiClient.get(`/courses/`, { params: { owner: ownerId } });
      return res.data;
    } catch (e) {
      error.value = { message: 'Failed to fetch your courses.' };
      return [];
    } finally {
      isLoading.value = false;
    }
  }

  // Deletes
  async function deleteCourse(courseId) {
    isLoading.value = true;
    error.value = null;
    try {
      await apiClient.delete(`/courses/${courseId}/`);
      return true;
    } catch (e) {
      error.value = { message: 'Failed to delete course.' };
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  async function deleteChapter(courseId, chapterId) {
    isLoading.value = true;
    error.value = null;
    try {
      await apiClient.delete(`/courses/${courseId}/chapters/${chapterId}/`);
      return true;
    } catch (e) {
      error.value = { message: 'Failed to delete chapter.' };
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  async function deleteLesson(courseId, chapterId, lessonId) {
    isLoading.value = true;
    error.value = null;
    try {
      await apiClient.delete(`/courses/${courseId}/chapters/${chapterId}/lessons/${lessonId}/`);
      return true;
    } catch (e) {
      error.value = { message: 'Failed to delete lesson.' };
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  return { isLoading, error, createCourse, fetchCourse, updateCourse, updateCourseMeta, createChapter, updateChapter, createLesson, fetchLesson, updateLesson, fetchChapters, fetchLessons, fetchMyCourses, deleteCourse, deleteChapter, deleteLesson };
});
