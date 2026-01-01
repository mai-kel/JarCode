<template>
  <Card class="p-3">
    <template #title>
      <div class="flex align-items-center justify-content-between">
        <h2>Edit Lesson</h2>
        <Button class="p-button-text" label="Back to Lessons" icon="pi pi-angle-left" @click="goBack" />
      </div>
    </template>
    <template #content>
      <form @submit.prevent="handleSave" class="p-fluid grid">
        <div class="field col-12 md:col-8">
          <label for="lessonTitle">Lesson Title</label>
          <InputText id="lessonTitle" v-model="title" :invalid="submitted && !title" placeholder="Enter lesson title"/>
          <small v-if="submitted && !title" class="p-error">Title is required.</small>
        </div>

        <div class="field col-12">
          <label for="lessonContent">Content</label>
          <LessonEditor v-model="content" :lesson-id="lessonId" />
          <small v-if="submitted && !content" class="p-error">Content is required.</small>
        </div>

        <div class="col-12">
          <div class="flex flex-column align-items-stretch">
            <div class="mb-2">
              <Button
                type="button"
                label="Delete Lesson"
                icon="pi pi-trash"
                class="p-button-danger p-button-text"
                style="width: auto"
                @click="confirmDeleteLesson"
              />
            </div>

            <div>
              <Button type="submit" label="Save" icon="pi pi-save" :loading="courseStore.isLoading" :disabled="!isDirty" style="width: 100%;"/>
            </div>
          </div>
        </div>
      </form>
    </template>
  </Card>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useCourseStore } from '../../store/course';
import { useToast } from 'primevue/usetoast';
import LessonEditor from '../../components/editors/LessonEditor.vue';
import { useUnsavedChanges } from '../../composables/useUnsavedChanges';
import { useDeleteConfirmation } from '../../composables/useDeleteConfirmation';

const route = useRoute();
const router = useRouter();
const courseStore = useCourseStore();
const toast = useToast();
const confirm = useConfirm();

const submitted = ref(false);
const title = ref('');
const content = ref('');
const originalTitle = ref('');
const originalContent = ref('');

const courseId = route.params.courseId;
const chapterId = route.params.chapterId;
const lessonId = route.params.lessonId;

onMounted(async () => {
  const data = await courseStore.fetchLesson(courseId, chapterId, lessonId);
  if (data) {
    title.value = data.title || '';
    content.value = data.content || '';
    originalTitle.value = title.value;
    originalContent.value = content.value;
  }
});

const handleSave = async () => {
  submitted.value = true;
  courseStore.clearError();
  if (!title.value || !content.value) return;

  const updated = await courseStore.updateLesson(courseId, chapterId, lessonId, { title: title.value, content: content.value });
  if (updated?.id) {
    toast.add({ severity: 'success', summary: 'Lesson saved', life: 2500 });
    originalTitle.value = title.value;
    originalContent.value = content.value;
  } else if (courseStore.error) {
    toast.add({
      severity: 'error',
      summary: 'Failed to save lesson',
      detail: courseStore.error.message || 'An error occurred',
      life: 4000
    });
  }
};

const goBack = () => router.push({ name: 'chapter-lessons', params: { courseId, chapterId } });

const isDirty = computed(() => title.value !== originalTitle.value || content.value !== originalContent.value);

useUnsavedChanges(isDirty);

const confirmDeleteLesson = useDeleteConfirmation({
  header: 'Delete lesson',
  message: 'Are you sure you want to delete this lesson? This cannot be undone.',
  onConfirm: () => courseStore.deleteLesson(courseId, chapterId, lessonId),
  successRoute: { name: 'chapter-lessons', params: { courseId, chapterId } },
  successMessage: 'Lesson deleted',
  errorMessage: 'Failed to delete lesson'
});
</script>

<style scoped>
</style>
