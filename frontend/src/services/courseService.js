import apiClient from './api'

export default {
  getAllCourses (searchQuery = '', cursor = null, owner = null) {
    const params = {}
    if (searchQuery) params.title = searchQuery
    if (cursor) params.cursor = cursor
    if (owner) params.owner = owner
    return apiClient.get(`/courses/`, { params })
  },

  getCourseDetail (courseId) {
    return apiClient.get(`/courses/${courseId}/`)
  },

  getChaptersForCourse (courseId) {
    return apiClient.get(`/courses/${courseId}/chapters/`)
  },

  getLessonsForChapter (courseId, chapterId) {
    return apiClient.get(`/courses/${courseId}/chapters/${chapterId}/lessons/`)
  }
}
