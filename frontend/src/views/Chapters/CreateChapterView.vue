<template>
  <Card class="p-3">
    <template #title>
      <div class="flex align-items-center justify-content-between w-full">
        <h2 class="m-0">Create Chapter</h2>
        <Button class="p-button-text" label="Back to Chapters" icon="pi pi-angle-left" @click="goChapters" />
      </div>
    </template>
    <template #content>
      <form @submit.prevent="handleCreateChapter" class="p-fluid grid">
        <div class="field col-12 md:col-8">
          <label for="chapterTitle">Chapter Title</label>
          <InputText id="chapterTitle" v-model="title" :invalid="submitted && !title" placeholder="Enter chapter title"/>
          <small v-if="submitted && !title" class="p-error">Title is required.</small>
        </div>

        <div class="col-12 flex align-items-center">
          <Button type="submit" label="Create Chapter" icon="pi pi-plus" :loading="courseStore.isLoading" :disabled="!isDirty"/>
        </div>

        <div class="col-12 mt-3">
          <Message v-if="courseStore.error" severity="error" :closable="true" @close="courseStore.clearError()">
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
import { useConfirm } from 'primevue/useconfirm';
import { useCourseStore } from '../../store/course';
import { useToast } from 'primevue/usetoast';

const route = useRoute();
const router = useRouter();
const courseStore = useCourseStore();
const toast = useToast();
const confirm = useConfirm();

const submitted = ref(false);
const title = ref('');

const courseId = route.params.courseId;

const handleCreateChapter = async () => {
  submitted.value = true;
  courseStore.clearError();
  if (!title.value) return;

  const result = await courseStore.createChapter(courseId, { title: title.value });
  if (result?.id) {
    toast.add({ severity: 'success', summary: 'Chapter created', life: 2500 });
    router.push({ name: 'course-chapters', params: { courseId } });
  } else if (courseStore.error) {
    toast.add({
      severity: 'error',
      summary: 'Failed to create chapter',
      detail: courseStore.error.message || 'An error occurred',
      life: 4000
    });
  }
};
const isDirty = computed(() => !!title.value);

const goChapters = () => {
  if (!isDirty.value) {
    return router.push({ name: 'course-chapters', params: { courseId } });
  }
  confirm.require({
    header: 'Discard changes?',
    message: 'You have unsaved chapter details. Leave without creating?',
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: 'Leave',
    rejectLabel: 'Stay',
    acceptClass: 'p-button-danger',
    accept: () => router.push({ name: 'course-chapters', params: { courseId } })
  });
};
</script>

<style scoped>
</style>
