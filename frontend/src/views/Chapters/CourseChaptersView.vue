<template>
  <Card>
    <template #title>
      <h2>Chapters</h2>
    </template>
    <template #content>
      <div class="p-fluid">
        <div v-if="loading" class="flex justify-content-center py-4">
          <ProgressSpinner style="width:50px;height:50px" strokeWidth="6"/>
        </div>
        <div v-else>
          <div class="flex align-items-center justify-content-between mb-3">
          <div>
            <Button label="Create Chapter" icon="pi pi-plus" @click="goCreateChapter" />
          </div>
          <div>
              <Button class="p-button-text" label="Back to Course" icon="pi pi-angle-left" @click="goBackToCourse" />
          </div>
        </div>

        <Message v-if="courseStore.error" severity="error" :closable="true" @close="courseStore.clearError()">
          <strong>Error:</strong> {{ courseStore.error?.message || 'An error occurred' }}
        </Message>

        <ul v-if="chapters.length > 0" class="list-none p-0 m-0">
          <li v-for="(ch, index) in chapters" :key="ch.id" class="p-3 border-1 border-round mb-2 flex align-items-center justify-content-between">
            <div class="flex align-items-center">
              <span class="font-bold mr-3">#{{ index + 1 }}</span>
              <div v-if="editingId !== ch.id">{{ ch.title }}</div>
              <div v-else class="flex align-items-center">
                <InputText v-model="editTitle" class="mr-2" />
                <Button label="Save" icon="pi pi-check" class="p-button-sm mr-2" @click="saveEdit(ch)" :loading="courseStore.isLoading"/>
                <Button label="Cancel" icon="pi pi-times" class="p-button-secondary p-button-sm" @click="cancelEdit"/>
              </div>
            </div>
            <div class="flex align-items-center">
              <Button v-if="editingId !== ch.id" label="Edit" icon="pi pi-pencil" class="p-button-text mr-2" @click="startEdit(ch)" />
              <Button label="Lessons" icon="pi pi-angle-right" class="p-button-text mr-2" @click="openLessons(ch)" />
              <Button label="Delete" icon="pi pi-trash" class="p-button-danger p-button-text" @click="confirmDeleteChapter(ch)" />
            </div>
          </li>
        </ul>

        <div v-else class="text-color-secondary p-3">No chapters yet. Create one to get started.</div>
        </div>
      </div>
    </template>
  </Card>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { useRoute, useRouter, onBeforeRouteLeave } from 'vue-router';
import { useConfirm } from 'primevue/useconfirm';
import { useCourseStore } from '../../store/course';
import ProgressSpinner from 'primevue/progressspinner';
import { useToast } from 'primevue/usetoast';
import { useDeleteConfirmation } from '../../composables/useDeleteConfirmation';

const route = useRoute();
const router = useRouter();
const courseStore = useCourseStore();
const confirm = useConfirm();
const toast = useToast();

const courseId = route.params.courseId;
const chapters = ref([]);
const loading = ref(true);
const editingId = ref(null);
const editTitle = ref('');

onMounted(async () => {
  loading.value = true;
  try {
    chapters.value = await courseStore.fetchChapters(courseId) || [];
  } finally {
    loading.value = false;
  }
});

const goCreateChapter = () => router.push({ name: 'create-chapter', params: { courseId } });
const openLessons = (chapter) => router.push({ name: 'chapter-lessons', params: { courseId, chapterId: chapter.id } });
const goBackToCourse = () => router.push({ name: 'course-detail', params: { courseId } });

const startEdit = (ch) => {
  editingId.value = ch.id;
  editTitle.value = ch.title;
};

const cancelEdit = () => {
  editingId.value = null;
  editTitle.value = '';
};

const saveEdit = async (ch) => {
  if (!editTitle.value || editTitle.value === ch.title) {
    cancelEdit();
    return;
  }
  const updated = await courseStore.updateChapter(courseId, ch.id, { title: editTitle.value });
  if (updated?.id) {
    chapters.value = await courseStore.fetchChapters(courseId) || [];
    cancelEdit();
  }
};

const confirmDeleteChapter = (ch) => {
  const deleteChapter = useDeleteConfirmation({
    header: 'Delete chapter',
    message: `Delete chapter "${ch.title}" and all its lessons? This cannot be undone.`,
    onConfirm: async () => {
      const ok = await courseStore.deleteChapter(courseId, ch.id);
      if (ok) {
        chapters.value = await courseStore.fetchChapters(courseId) || [];
      }
      return ok;
    },
    successMessage: 'Chapter deleted'
  });
  deleteChapter();
};

onBeforeRouteLeave((to, from, next) => {
  if (editingId.value === null) return next();
  const ChapterChanged = chapters.value.find(ch => ch.id === editingId.value).title === editTitle.value
  if (ChapterChanged) return next();

  confirm.require({
    header: 'Unsaved changes',
    message: 'You have unsaved chapter edits. Leave without saving?',
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: 'Leave',
    rejectLabel: 'Stay',
    acceptClass: 'p-button-danger',
    accept: () => next(),
    reject: () => next(false)
  });
});
</script>

<style scoped>
</style>
