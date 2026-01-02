<template>
  <Card>
    <template #title>
      <div class="flex align-items-center justify-content-between w-full">
        <h2 class="m-0">Create a New Course</h2>
        <Button
          class="p-button-text"
          label="Back to My Courses"
          icon="pi pi-angle-left"
          @click="goBackToMyCourses"
        />
      </div>
    </template>
    <template #content>
      <form @submit.prevent="handleCreateCourse">
        <div class="p-fluid grid">
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
              :max-file-size="MAX_THUMBNAIL_BYTES"
              :auto="true"
              :custom-upload="true"
              @uploader="handleThumbnailUpload"
              @remove="handleThumbnailRemove"
            >
              <template #header="{ chooseCallback }">
                <div class="flex align-items-center gap-2 p-2 w-full">
                  <Button label="Upload" icon="pi pi-upload" @click="chooseCallback()" />
                  <Button
                    label="Clear"
                    icon="pi pi-times"
                    class="p-button-text"
                    :disabled="!previewUrl"
                    @click="handleThumbnailRemove"
                  />
                </div>
              </template>
              <template #empty>
                <p>Drag and drop image file here.</p>
              </template>
            </FileUpload>
            <small class="p-muted"
              >Thumbnail is optional. Max size: {{ MAX_THUMBNAIL_LABEL }}.</small
            >

            <div v-if="previewUrl" class="mt-3">
              <img
                :src="previewUrl"
                alt="Thumbnail preview"
                style="max-height: 180px; object-fit: cover"
              />
            </div>
          </div>

          <div class="field col-12">
            <label for="courseDescription">Description</label>
            <Textarea
              id="courseDescription"
              v-model="description"
              rows="5"
              auto-resize
              :invalid="submitted && !description"
            />
            <small v-if="submitted && !description" class="p-error">Description is required.</small>
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

          <div class="col-12 flex align-items-center">
            <Button
              type="submit"
              label="Create Course"
              icon="pi pi-save"
              :loading="courseStore.isLoading"
            />
          </div>
        </div>
      </form>
    </template>
  </Card>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useCourseStore } from '../../store/course';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';
import { MAX_THUMBNAIL_BYTES, MAX_THUMBNAIL_LABEL } from '../../constants/upload';

const title = ref('');
const description = ref('');
const thumbnail = ref(null);
const submitted = ref(false);
const previewUrl = ref('');

const courseStore = useCourseStore();
const router = useRouter();
const toast = useToast();
const confirm = useConfirm();

const handleThumbnailUpload = (event) => {
  thumbnail.value = event.files[0] || null;
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value);
  previewUrl.value = thumbnail.value ? URL.createObjectURL(thumbnail.value) : '';
};

const handleThumbnailRemove = () => {
  thumbnail.value = null;
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value);
  previewUrl.value = '';
};

const handleCreateCourse = async () => {
  submitted.value = true;
  courseStore.clearError();

  if (!title.value || !description.value) {
    return;
  }

  const form = new FormData();
  form.append('title', title.value);
  form.append('description', description.value);
  if (thumbnail.value) {
    form.append('thumbnail', thumbnail.value);
  }

  const created = await courseStore.createCourse(form);
  if (created?.id) {
    toast.add({ severity: 'success', summary: 'Course created', life: 2500 });
    router.push({ name: 'course-detail', params: { courseId: created.id } });
  } else if (courseStore.error) {
    toast.add({
      severity: 'error',
      summary: 'Failed to create course',
      detail: courseStore.error.message || 'An error occurred',
      life: 4000,
    });
  }
};

const isDirty = computed(() => !!title.value || !!description.value || !!thumbnail.value);

const goBackToMyCourses = () => {
  if (!isDirty.value) {
    return router.push({ name: 'my-courses' });
  }
  confirm.require({
    header: 'Discard changes?',
    message: 'You have unsaved course details. Leave without creating?',
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: 'Leave',
    rejectLabel: 'Stay',
    acceptClass: 'p-button-danger',
    accept: () => router.push({ name: 'my-courses' }),
  });
};
</script>

<style scoped></style>
