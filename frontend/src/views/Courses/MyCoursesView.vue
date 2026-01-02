<template>
  <CourseListView
    title="My Courses"
    :fetcher="fetchMyCourses"
    :item-action="editCourse"
    item-action-label="Edit"
    item-action-icon="pi pi-pencil"
    :show-create="true"
    empty-message="You haven't created any courses yet."
    @create="goCreateCourse"
  >
  </CourseListView>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { useCourseStore } from '../../store/course';
import { useAuthStore } from '../../store/auth';
import CourseListView from '../../components/CourseListView.vue';

const router = useRouter();
const courseStore = useCourseStore();
const authStore = useAuthStore();

const goCreateCourse = () => router.push({ name: 'create-course' });
const editCourse = (course) =>
  router.push({ name: 'course-detail', params: { courseId: course.id } });

const fetchMyCourses = async (searchQuery = '', cursor = null) => {
  if (!authStore.user) {
    await authStore.fetchUser();
  }
  const ownerId = authStore.user?.id;
  if (!ownerId) {
    return { next: null, previous: null, results: [] };
  }
  return await courseStore.getAllCourses(searchQuery, cursor, ownerId);
};
</script>
