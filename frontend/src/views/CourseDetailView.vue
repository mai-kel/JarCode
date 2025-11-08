<template>
  <Card>
    <template #title>
      <div class="flex align-items-center justify-content-between w-full">
        <h2 class="m-0">Edit Course</h2>
        <Button class="p-button-text" label="Go back to my courses" icon="pi pi-angle-left" @click="goMyCourses" />
      </div>
    </template>
    <template #content>
      <form @submit.prevent="handleSave" class="p-fluid grid">
        <div class="field col-12">
          <label for="courseTitle">Course Title</label>
          <InputText id="courseTitle" v-model="title" :invalid="submitted && !title" />
          <small v-if="submitted && !title" class="p-error">Title is required.</small>
        </div>

        <div class="field col-12">
          <label for="courseThumbnail">Thumbnail Image</label>
          <FileUpload
            id="courseThumbnail"
            name="thumbnail"
            mode="advanced"
            accept="image/*"
            :maxFileSize="MAX_THUMBNAIL_BYTES"
            :auto="true"
            :customUpload="true"
            @uploader="handleThumbnailUpload"
            @remove="handleThumbnailClear"
          >
            <template #header="{ chooseCallback }">
              <div class="flex align-items-center gap-2 p-2 w-full">
                <Button label="Upload" icon="pi pi-upload" @click="chooseCallback()" />
                <Button label="Clear" icon="pi pi-times" class="p-button-text" @click="handleThumbnailClear" :disabled="!hasPreview" />
                <Button label="Remove" icon="pi pi-trash" class="p-button-danger p-button-text" @click="handleThumbnailRemoveCompletely" :disabled="!canRemove" />
              </div>
            </template>
            <template #empty>
              <p>Drag and drop image file here.</p>
            </template>
          </FileUpload>
          <small class="p-muted">Leave empty to keep current thumbnail. Max size: {{ MAX_THUMBNAIL_LABEL }}.</small>

          <div class="mt-3">
            <img :src="currentImageToShow" alt="Thumbnail" style="max-height:180px;object-fit:cover" />
          </div>
        </div>

        <div class="field col-12">
          <label for="courseDescription">Description</label>
          <Textarea id="courseDescription" v-model="description" rows="5" autoResize :invalid="submitted && !description"/>
          <small v-if="submitted && !description" class="p-error">Description is required.</small>
        </div>

        <div class="col-12 mt-3">
          <Message v-if="courseStore.error" severity="error" :closable="true">
            <strong>Error:</strong> {{ courseStore.error.message }}
          </Message>
        </div>

        <div class="col-12 mt-3 flex justify-content-between align-items-center">
          <Button type="button" label="Delete Course" icon="pi pi-trash" class="p-button-danger" @click="confirmDeleteCourse" />
          <Button class="p-button-text" label="Go to Chapters" icon="pi pi-angle-right" @click="goChapters" />
        </div>

        <div class="col-12 mt-2">
          <Button type="submit" label="Save" icon="pi pi-save" :loading="courseStore.isLoading" :disabled="!isDirty" class="p-button-success" />
        </div>
      </form>
    </template>
  </Card>
</template>

<script setup>
import { ref, onMounted, watch, computed, onBeforeUnmount } from 'vue';
import { useRoute, useRouter, onBeforeRouteLeave } from 'vue-router';
import { useConfirm } from 'primevue/useconfirm';
import { useCourseStore } from '../store/course';
import { useToast } from 'primevue/usetoast';
import { useAuthStore } from '../store/auth';
import { MAX_THUMBNAIL_BYTES, MAX_THUMBNAIL_LABEL } from '../constants/upload';

const route = useRoute();
const router = useRouter();
const courseStore = useCourseStore();
const toast = useToast();
const confirm = useConfirm();
const authStore = useAuthStore();

const courseId = route.params.courseId;

const title = ref('');
const description = ref('');
const originalTitle = ref('');
const originalDescription = ref('');
const newThumbnail = ref(null);
const previewUrl = ref('');
const originalImageUrl = ref('');
const currentImage = ref('/img/course-placeholder.svg');
const placeholder = '/img/course-placeholder.svg';
const removeThumbnail = ref(false);
const submitted = ref(false);

onMounted(async () => {
  const data = await courseStore.fetchCourse(courseId);
  if (data) {
    title.value = data.title || '';
    description.value = data.description || '';
    originalTitle.value = title.value;
    originalDescription.value = description.value;
    originalImageUrl.value = data.thumbnail || '';
    currentImage.value = originalImageUrl.value || placeholder;
  }
});

watch(newThumbnail, (file) => {
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value);
  previewUrl.value = file ? URL.createObjectURL(file) : '';
  currentImage.value = previewUrl.value || (originalImageUrl.value || placeholder);
  if (file) removeThumbnail.value = false;
});

const handleThumbnailUpload = (event) => {
  newThumbnail.value = event.files[0] || null;
};

const handleThumbnailClear = () => {
  newThumbnail.value = null;
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value);
  previewUrl.value = '';
  currentImage.value = originalImageUrl.value || placeholder;
};

const handleThumbnailRemoveCompletely = () => {
  removeThumbnail.value = true;
  newThumbnail.value = null;
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value);
  previewUrl.value = '';
  currentImage.value = placeholder;
};

const handleSave = async () => {
  submitted.value = true;
  courseStore.error = null;
  if (!title.value || !description.value) return;

  let updated = null;
  if (newThumbnail.value) {
    const form = new FormData();
    form.append('title', title.value);
    form.append('description', description.value);
    form.append('thumbnail', newThumbnail.value);
    updated = await courseStore.updateCourse(courseId, form);
  } else {
    const payload = { title: title.value, description: description.value };
    if (removeThumbnail.value) payload.thumbnail = null;
    updated = await courseStore.updateCourseMeta(courseId, payload);
  }
  if (updated?.id) {
    toast.add({ severity: 'success', summary: 'Course saved', life: 2500 });
    originalTitle.value = title.value;
    originalDescription.value = description.value;
    if (newThumbnail.value) {
      originalImageUrl.value = currentImage.value;
      newThumbnail.value = null;
      if (previewUrl.value) URL.revokeObjectURL(previewUrl.value);
      previewUrl.value = '';
    } else if (removeThumbnail.value) {
      originalImageUrl.value = '';
      currentImage.value = placeholder;
      removeThumbnail.value = false;
    }
  }
};

const goChapters = () => router.push({ name: 'course-chapters', params: { courseId } });
const goMyCourses = () => router.push({ name: 'my-courses' });

const confirmDeleteCourse = () => {
  confirm.require({
    header: 'Delete course',
    message: 'Are you sure you want to delete this course and all its chapters and lessons? This cannot be undone.',
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: 'Delete',
    rejectLabel: 'Cancel',
    acceptClass: 'p-button-danger',
    accept: async () => {
      const ok = await courseStore.deleteCourse(courseId);
      if (ok) {
        toast.add({ severity: 'success', summary: 'Course deleted', life: 2000 });
        router.push({ name: 'my-courses' });
      }
    }
  });
};

const hasPreview = computed(() => !!previewUrl.value);
const canRemove = computed(() => !!originalImageUrl.value || !!previewUrl.value);
const currentImageToShow = computed(() => currentImage.value || placeholder);

const isDirty = computed(() => {
  const titleChanged = title.value !== originalTitle.value;
  const descChanged = description.value !== originalDescription.value;
  return titleChanged || descChanged || !!newThumbnail.value || removeThumbnail.value;
});

onBeforeRouteLeave((to, from, next) => {
  if (!isDirty.value) return next();
  confirm.require({
    header: 'Unsaved changes',
    message: 'You have unsaved changes. Leave without saving?',
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: 'Leave',
    rejectLabel: 'Stay',
    acceptClass: 'p-button-danger',
    accept: () => next(),
    reject: () => next(false)
  });
});

const beforeUnload = (e) => {
  if (isDirty.value) {
    e.preventDefault();
    e.returnValue = '';
  }
};

window.addEventListener('beforeunload', beforeUnload);
onBeforeUnmount(() => window.removeEventListener('beforeunload', beforeUnload));
</script>

<style scoped>
</style>
