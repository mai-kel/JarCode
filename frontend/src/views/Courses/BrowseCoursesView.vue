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
import CourseListView from '../../components/CourseListView.vue'
import courseService from '../../services/courseService'

const router = useRouter()

const viewCourse = (course) => {
  router.push({ name: 'course-view', params: { courseId: course.id } })
}
</script>
