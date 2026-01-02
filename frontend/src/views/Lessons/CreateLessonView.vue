<template>
  <Card class="p-3">
    <template #title>
      <div class="flex align-items-center justify-content-between w-full">
        <h2 class="m-0">Create Lesson</h2>
        <Button
          class="p-button-text"
          label="Back to Lessons"
          icon="pi pi-angle-left"
          @click="goBackToLessons"
        />
      </div>
    </template>
    <template #content>
      <form class="p-fluid grid" @submit.prevent="handleCreateLesson">
        <div class="field col-12 md:col-8">
          <label for="lessonTitle">Lesson Title</label>
          <InputText
            id="lessonTitle"
            v-model="title"
            :invalid="submitted && !title"
            placeholder="Enter lesson title"
          />
          <small v-if="submitted && !title" class="p-error">Title is required.</small>
        </div>

        <div class="field col-12">
          <label for="lessonContent">Content</label>
          <LessonEditor v-model="content" />
          <small v-if="submitted && !content" class="p-error">Content is required.</small>
        </div>

        <div class="col-12 flex align-items-center">
          <Button
            type="submit"
            label="Create Lesson"
            icon="pi pi-plus"
            :loading="courseStore.isLoading"
            :disabled="!isDirty"
          />
        </div>

        <div class="col-12 mt-3">
          <Message
            v-if="courseStore.error"
            severity="error"
            :closable="true"
            @close="courseStore.clearError()"
          >
            <strong>Error:</strong> {{ courseStore.error?.message || 'An error occurred' }}
          </Message>
        </div>
      </form>
    </template>
  </Card>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useCourseStore } from '../../store/course';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';
import LessonEditor from '../../components/editors/LessonEditor.vue';

const route = useRoute();
const router = useRouter();
const courseStore = useCourseStore();
const toast = useToast();
const confirm = useConfirm();

const submitted = ref(false);
const title = ref('');
const content = ref('');

const courseId = route.params.courseId;
const chapterId = route.params.chapterId;

const handleCreateLesson = async () => {
  submitted.value = true;
  courseStore.clearError();
  if (!title.value || !content.value) return;

  const result = await courseStore.createLesson(courseId, chapterId, {
    title: title.value,
    content: content.value,
  });
  if (result?.id) {
    toast.add({ severity: 'success', summary: 'Lesson created', life: 2500 });
    router.push({ name: 'lesson-detail', params: { courseId, chapterId, lessonId: result.id } });
  } else if (courseStore.error) {
    toast.add({
      severity: 'error',
      summary: 'Failed to create lesson',
      detail: courseStore.error.message || 'An error occurred',
      life: 4000,
    });
  }
};

const isDirty = computed(() => !!title.value || !!content.value);

const goBackToLessons = () => {
  if (!isDirty.value)
    return router.push({ name: 'chapter-lessons', params: { courseId, chapterId } });
  confirm.require({
    header: 'Discard changes?',
    message: 'You have unsaved lesson details. Leave without creating?',
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: 'Leave',
    rejectLabel: 'Stay',
    acceptClass: 'p-button-danger',
    accept: () => router.push({ name: 'chapter-lessons', params: { courseId, chapterId } }),
  });
};
</script>

<style scoped></style>
