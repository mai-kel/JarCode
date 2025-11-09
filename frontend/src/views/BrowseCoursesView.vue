<template>
  <CourseListView
    title="Browse Courses"
    :fetcher="courseService.getAllCourses"
    :itemAction="viewCourse"
    itemActionLabel="View Course"
    emptyMessage="No courses found."
  />
</template>

<script setup>
import { useRouter } from 'vue-router'
import CourseListView from '../components/CourseListView.vue'
import courseService from '../services/courseService'

const router = useRouter()

const viewCourse = (course) => {
  router.push({ name: 'course-view', params: { courseId: course.id } })
}
</script>

<style scoped>
.ellipsis-1 { display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden; line-clamp: 1; }
.ellipsis-3 { display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; line-clamp: 3; }
</style>
