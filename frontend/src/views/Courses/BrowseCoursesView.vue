<template>
  <CourseListView
    title="Browse Courses"
    :fetcher="fetcher"
    :item-action="viewCourse"
    item-action-label="View Course"
    empty-message="No courses found."
  />
</template>

<script setup>
import { useRouter } from 'vue-router';
import CourseListView from '../../components/CourseListView.vue';
import { useCourseStore } from '../../store/course';

const router = useRouter();
const courseStore = useCourseStore();

const viewCourse = (course) => {
  router.push({ name: 'course-view', params: { courseId: course.id } });
};

const fetcher = async (searchQuery = '', cursor = null) => {
  return await courseStore.getAllCourses(searchQuery, cursor, null);
};
</script>
