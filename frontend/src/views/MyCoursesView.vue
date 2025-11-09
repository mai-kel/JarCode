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

const router = useRouter()
const courseStore = useCourseStore()
const authStore = useAuthStore()

const goCreateCourse = () => router.push({ name: 'create-course' })
const editCourse = (course) => router.push({ name: 'course-detail', params: { courseId: course.id } })

const fetchMyCourses = async (searchQuery = '') => {
  if (!authStore.user) {
    await authStore.fetchUser()
  }
  const ownerId = authStore.user?.id
  const list = ownerId ? await courseStore.fetchMyCourses(ownerId) : []
  if (!searchQuery) return list
  const q = String(searchQuery).toLowerCase()
  return list.filter(c => (c.title || '').toLowerCase().includes(q))
}
</script>

<style scoped>
.ellipsis-1 { display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden; line-clamp: 1; }
.ellipsis-3 { display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; line-clamp: 3; }
</style>
