<template>
  <Card>
    <template #title>
      <h2>My Courses</h2>
    </template>
    <template #content>
      <div class="p-fluid">
        <div class="flex align-items-center justify-content-between mb-3">
          <div>
            <Button label="Create Course" icon="pi pi-plus" @click="goCreateCourse" />
          </div>
        </div>

        <div v-if="loading" class="flex justify-content-center py-4">
          <ProgressSpinner style="width:50px;height:50px" strokeWidth="6"/>
        </div>

        <div v-else class="grid">
          <div v-for="c in courses" :key="c.id" class="col-12 md:col-6 lg:col-4">
            <Card class="h-full">
              <template #header>
                <img :src="courseImage(c)" alt="Course thumbnail" class="w-full" style="height:180px;object-fit:cover" />
              </template>
              <template #title>
                <span class="ellipsis-1">{{ c.title }}</span>
              </template>
              <template #content>
                <p class="ellipsis-3">{{ c.description }}</p>
              </template>
              <template #footer>
                <div class="flex justify-content-end">
                  <Button label="Edit" icon="pi pi-pencil" class="p-button-text" @click="editCourse(c)" />
                </div>
              </template>
            </Card>
          </div>
          <div v-if="courses.length === 0" class="col-12 text-color-secondary p-3">You haven't created any courses yet.</div>
        </div>
      </div>
    </template>
  </Card>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useCourseStore } from '../store/course';
import { useAuthStore } from '../store/auth';
import ProgressSpinner from 'primevue/progressspinner';

const router = useRouter();
const courseStore = useCourseStore();
const authStore = useAuthStore();

const courses = ref([]);
const loading = ref(true);

onMounted(async () => {
  if (!authStore.user) {
    await authStore.fetchUser();
  }
  const ownerId = authStore.user?.id;
  loading.value = true;
  try {
    courses.value = ownerId ? (await courseStore.fetchMyCourses(ownerId)) : [];
  } finally {
    loading.value = false;
  }
});

const goCreateCourse = () => router.push({ name: 'create-course' });
const editCourse = (course) => router.push({ name: 'course-detail', params: { courseId: course.id } });

const courseImage = (course) => {
  if (course.thumbnail) {
    return course.thumbnail;
  }
  return '/img/course-placeholder.svg';
};
</script>

<style scoped>
.ellipsis-1 { display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden; line-clamp: 1; }
.ellipsis-3 { display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; line-clamp: 3; }
</style>
