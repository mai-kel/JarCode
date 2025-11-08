import apiClient from './api'

export default {
  getAllCourses (searchQuery = '') {
    return apiClient.get(`/courses/`, { params: { title: searchQuery } })
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
