<template>
  <Card>
    <template #title>
      <h2>Lessons</h2>
    </template>
    <template #content>
      <div class="p-fluid">
        <div v-if="loading" class="flex justify-content-center py-4">
          <ProgressSpinner style="width:50px;height:50px" strokeWidth="6"/>
        </div>
        <div v-else>
        <div class="flex align-items-center justify-content-between mb-3">
          <div>
            <Button label="Create Lesson" icon="pi pi-plus" @click="goCreateLesson" />
          </div>
          <div>
            <Button class="p-button-text" label="Back to Chapters" icon="pi pi-angle-left" @click="goBackToChapters" />
          </div>
        </div>

        <Message v-if="courseStore.error" severity="error" :closable="true">
          <strong>Error:</strong> {{ courseStore.error.message }}
        </Message>

          <ul v-if="lessons.length > 0" class="list-none p-0 m-0">
            <li v-for="(ls, index) in lessons" :key="ls.id" class="p-3 border-1 border-round mb-2 flex align-items-center justify-content-between">
              <div>
                <span class="font-bold mr-3">#{{ index + 1 }}</span>
                <span>{{ ls.title }}</span>
              </div>
              <div class="flex align-items-center">
                <Button label="Open" icon="pi pi-pencil" class="p-button-text mr-2" @click="openLesson(ls)" />
                <Button label="Delete" icon="pi pi-trash" class="p-button-danger p-button-text" @click="confirmDeleteLesson(ls)" />
              </div>
            </li>
          </ul>

        <div v-else class="text-color-secondary p-3">No lessons yet. Create one to get started.</div>
        </div>
      </div>
    </template>
  </Card>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useCourseStore } from '../store/course';
import ProgressSpinner from 'primevue/progressspinner';
import { useConfirm } from 'primevue/useconfirm';
import { useToast } from 'primevue/usetoast';

const route = useRoute();
const router = useRouter();
const courseStore = useCourseStore();
const confirm = useConfirm();
const toast = useToast();

const courseId = route.params.courseId;
const chapterId = route.params.chapterId;
const lessons = ref([]);
const loading = ref(true);

onMounted(async () => {
  loading.value = true;
  try {
    lessons.value = await courseStore.fetchLessons(courseId, chapterId) || [];
  } finally {
    loading.value = false;
  }
});

const goCreateLesson = () => router.push({ name: 'create-lesson', params: { courseId, chapterId } });
const goBackToChapters = () => router.push({ name: 'course-chapters', params: { courseId } });
const openLesson = (ls) => router.push({ name: 'lesson-detail', params: { courseId, chapterId, lessonId: ls.id } });

const confirmDeleteLesson = (ls) => {
  confirm.require({
    header: 'Delete lesson',
    message: `Are you sure you want to delete "${ls.title}"? This cannot be undone.`,
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: 'Delete',
    rejectLabel: 'Cancel',
    acceptClass: 'p-button-danger',
    accept: async () => {
      const ok = await courseStore.deleteLesson(courseId, chapterId, ls.id);
      if (ok) {
        lessons.value = await courseStore.fetchLessons(courseId, chapterId) || [];
        toast.add({ severity: 'success', summary: 'Lesson deleted', life: 2000 });
      } else {
        toast.add({ severity: 'error', summary: 'Failed to delete lesson', life: 2500 });
      }
    }
  });
};
</script>

<style scoped>
</style>
