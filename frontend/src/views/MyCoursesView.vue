<template>
  <CourseListView
    title="My Courses"
    :fetcher="fetchMyCourses"
    :itemAction="editCourse"
    itemActionLabel="Edit"
    itemActionIcon="pi pi-pencil"
    :showCreate="true"
    emptyMessage="You haven't created any courses yet."
    @create="goCreateCourse"
  >
  </CourseListView>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useCourseStore } from '../store/course'
import { useAuthStore } from '../store/auth'
import CourseListView from '../components/CourseListView.vue'
import courseService from '../services/courseService'

const router = useRouter()
  const courseStore = useCourseStore()
const authStore = useAuthStore()

const goCreateCourse = () => router.push({ name: 'create-course' })
const editCourse = (course) => router.push({ name: 'course-detail', params: { courseId: course.id } })

const fetchMyCourses = async (searchQuery = '', cursor = null) => {
  if (!authStore.user) {
    await authStore.fetchUser()
  }
  const ownerId = authStore.user?.id
  if (!ownerId) return { next: null, previous: null, results: [] }
  return await courseService.getAllCourses(searchQuery, cursor, ownerId)
}
</script>