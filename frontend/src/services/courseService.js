import apiClient from './api';

const BASE = '/courses/';

/**
 * Get all courses with optional filters
 * @param {string} searchQuery - Search query for course title
 * @param {string} cursor - Pagination cursor
 * @param {number} owner - Owner user ID filter
 * @returns {Promise<Object>} Response with courses data
 */
export async function getAllCourses(searchQuery = '', cursor = null, owner = null) {
  const params = {};
  if (searchQuery) params.title = searchQuery;
  if (cursor) params.cursor = cursor;
  if (owner) params.owner = owner;
  const response = await apiClient.get(BASE, { params });
  return response.data;
}

/**
 * Get course details by ID
 * @param {number} courseId - Course ID
 * @returns {Promise<Object>} Course data
 */
export async function getCourseDetail(courseId) {
  const response = await apiClient.get(`${BASE}${courseId}/`);
  return response.data;
}

/**
 * Create a new course
 * @param {FormData} formData - Course form data (includes title, description, thumbnail)
 * @returns {Promise<Object>} Created course data
 */
export async function createCourse(formData) {
  const response = await apiClient.post(BASE, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
}

/**
 * Update course
 * @param {number} courseId - Course ID
 * @param {FormData} formData - Course form data
 * @returns {Promise<Object>} Updated course data
 */
export async function updateCourse(courseId, formData) {
  const response = await apiClient.put(`${BASE}${courseId}/`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
}

/**
 * Update course metadata (partial update)
 * @param {number} courseId - Course ID
 * @param {Object} payload - Course metadata
 * @returns {Promise<Object>} Updated course data
 */
export async function updateCourseMeta(courseId, payload) {
  const response = await apiClient.patch(`${BASE}${courseId}/`, payload);
  return response.data;
}

/**
 * Delete course
 * @param {number} courseId - Course ID
 * @returns {Promise<void>}
 */
export async function deleteCourse(courseId) {
  await apiClient.delete(`${BASE}${courseId}/`);
}

/**
 * Get chapters for a course
 * @param {number} courseId - Course ID
 * @returns {Promise<Array>} List of chapters
 */
export async function getChaptersForCourse(courseId) {
  const response = await apiClient.get(`${BASE}${courseId}/chapters/`);
  return response.data;
}

/**
 * Create a new chapter
 * @param {number} courseId - Course ID
 * @param {Object} payload - Chapter data
 * @returns {Promise<Object>} Created chapter data
 */
export async function createChapter(courseId, payload) {
  const response = await apiClient.post(`${BASE}${courseId}/chapters/`, payload);
  return response.data;
}

/**
 * Update chapter
 * @param {number} courseId - Course ID
 * @param {number} chapterId - Chapter ID
 * @param {Object} payload - Chapter data
 * @returns {Promise<Object>} Updated chapter data
 */
export async function updateChapter(courseId, chapterId, payload) {
  const response = await apiClient.patch(`${BASE}${courseId}/chapters/${chapterId}/`, payload);
  return response.data;
}

/**
 * Delete chapter
 * @param {number} courseId - Course ID
 * @param {number} chapterId - Chapter ID
 * @returns {Promise<void>}
 */
export async function deleteChapter(courseId, chapterId) {
  await apiClient.delete(`${BASE}${courseId}/chapters/${chapterId}/`);
}

/**
 * Get lessons for a chapter
 * @param {number} courseId - Course ID
 * @param {number} chapterId - Chapter ID
 * @returns {Promise<Array>} List of lessons
 */
export async function getLessonsForChapter(courseId, chapterId) {
  const response = await apiClient.get(`${BASE}${courseId}/chapters/${chapterId}/lessons/`);
  return response.data;
}

/**
 * Create a new lesson
 * @param {number} courseId - Course ID
 * @param {number} chapterId - Chapter ID
 * @param {Object} payload - Lesson data
 * @returns {Promise<Object>} Created lesson data
 */
export async function createLesson(courseId, chapterId, payload) {
  const response = await apiClient.post(
    `${BASE}${courseId}/chapters/${chapterId}/lessons/`,
    payload
  );
  return response.data;
}

/**
 * Get lesson details
 * @param {number} courseId - Course ID
 * @param {number} chapterId - Chapter ID
 * @param {number} lessonId - Lesson ID
 * @returns {Promise<Object>} Lesson data
 */
export async function getLesson(courseId, chapterId, lessonId) {
  const response = await apiClient.get(
    `${BASE}${courseId}/chapters/${chapterId}/lessons/${lessonId}/`
  );
  return response.data;
}

/**
 * Update lesson
 * @param {number} courseId - Course ID
 * @param {number} chapterId - Chapter ID
 * @param {number} lessonId - Lesson ID
 * @param {Object} payload - Lesson data
 * @returns {Promise<Object>} Updated lesson data
 */
export async function updateLesson(courseId, chapterId, lessonId, payload) {
  const response = await apiClient.patch(
    `${BASE}${courseId}/chapters/${chapterId}/lessons/${lessonId}/`,
    payload
  );
  return response.data;
}

/**
 * Delete lesson
 * @param {number} courseId - Course ID
 * @param {number} chapterId - Chapter ID
 * @param {number} lessonId - Lesson ID
 * @returns {Promise<void>}
 */
export async function deleteLesson(courseId, chapterId, lessonId) {
  await apiClient.delete(`${BASE}${courseId}/chapters/${chapterId}/lessons/${lessonId}/`);
}

export default {
  getAllCourses,
  getCourseDetail,
  createCourse,
  updateCourse,
  updateCourseMeta,
  deleteCourse,
  getChaptersForCourse,
  createChapter,
  updateChapter,
  deleteChapter,
  getLessonsForChapter,
  createLesson,
  getLesson,
  updateLesson,
  deleteLesson,
};
