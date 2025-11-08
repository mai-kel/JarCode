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
          <Editor id="lessonContent" v-model="content" :init="editorInit" />
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
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useRoute, useRouter, onBeforeRouteLeave } from 'vue-router';
import { useConfirm } from 'primevue/useconfirm';
import { useCourseStore } from '../store/course';
import { useToast } from 'primevue/usetoast';
import Editor from '@tinymce/tinymce-vue';
import apiClient from '../services/api';

import 'tinymce/tinymce';
import 'tinymce/models/dom/model';
import 'tinymce/themes/silver';
import 'tinymce/icons/default';
import 'tinymce/plugins/advlist';
import 'tinymce/plugins/autolink';
import 'tinymce/plugins/lists';
import 'tinymce/plugins/link';
import 'tinymce/plugins/image';
import 'tinymce/plugins/charmap';
import 'tinymce/plugins/preview';
import 'tinymce/plugins/anchor';
import 'tinymce/plugins/searchreplace';
import 'tinymce/plugins/visualblocks';
import 'tinymce/plugins/code';
import 'tinymce/plugins/fullscreen';
import 'tinymce/plugins/insertdatetime';
import 'tinymce/plugins/media';
import 'tinymce/plugins/table';
import 'tinymce/plugins/codesample';
import 'tinymce/plugins/help';
import 'tinymce/plugins/wordcount';

import editorContentCss from 'tinymce/skins/content/default/content.css?url';
import editorContentUiCss from 'tinymce/skins/ui/oxide/content.min.css?url';
import prismThemeCss from 'prismjs/themes/prism-okaidia.css?url';

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

const editorInit = computed(() => ({
  height: 800,
  menubar: false,
  plugins: [
    'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
    'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
    'insertdatetime', 'media', 'table', 'codesample', 'help', 'wordcount'
  ],
  toolbar:
    'undo redo | blocks | ' +
    'bold italic backcolor | alignleft aligncenter ' +
    'alignright alignjustify | bullist numlist outdent indent | ' +
    'removeformat | image | table | codesample | help',
  skin: false,
  content_css: [editorContentCss, editorContentUiCss, prismThemeCss],
  /* Inject editor-specific styles into the TinyMCE iframe so Prism tokens were formatted correctly */
  content_style: `
    .token, .token.operator, .token.number, .token.string, .token.function {
      background: transparent !important;
      padding: 0 !important;
      border-radius: 0 !important;
    }
    pre[class*="language-"] .token { background: transparent !important; }
  `,
  codesample_global_prismjs: true,
  automatic_uploads: true,
  images_upload_handler: function (blobInfo, success, failure, progress) {
  const form = new FormData();
  form.append('image', blobInfo.blob(), blobInfo.filename());
  form.append('lesson', lessonId);
    return apiClient.post('/lessons/upload-image/', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (e) => {
        if (e.lengthComputable && progress) {
          progress((e.loaded / e.total) * 100);
        }
      }
    }).then(res => {
      if (res && res.data && res.data.location) {
        return res.data.location;
      }
      throw new Error('No location returned');
    }).catch(err => {
      throw err;
    });
  },
  codesample_languages: [
    { text: 'HTML/XML', value: 'markup' },
    { text: 'JavaScript', value: 'javascript' },
    { text: 'CSS', value: 'css' },
    { text: 'Python', value: 'python' },
    { text: 'Java', value: 'java' },
    { text: 'C', value: 'c' },
    { text: 'C++', value: 'cpp' },
    { text: 'C#', value: 'csharp' },
    { text: 'SQL', value: 'sql' },
    { text: 'Bash/Shell', value: 'bash' }
  ]
}));

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
  courseStore.error = null;
  if (!title.value || !content.value) return;

  const updated = await courseStore.updateLesson(courseId, chapterId, lessonId, { title: title.value, content: content.value });
  if (updated?.id) {
    toast.add({ severity: 'success', summary: 'Lesson saved', life: 2500 });
    originalTitle.value = title.value;
    originalContent.value = content.value;
  }
};

const goBack = () => router.push({ name: 'chapter-lessons', params: { courseId, chapterId } });

const isDirty = computed(() => title.value !== originalTitle.value || content.value !== originalContent.value);

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
  if (isDirty.value) { e.preventDefault(); e.returnValue = ''; }
};
window.addEventListener('beforeunload', beforeUnload);
onBeforeUnmount(() => window.removeEventListener('beforeunload', beforeUnload));

const confirmDeleteLesson = () => {
  confirm.require({
    header: 'Delete lesson',
    message: 'Are you sure you want to delete this lesson? This cannot be undone.',
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: 'Delete',
    rejectLabel: 'Cancel',
    acceptClass: 'p-button-danger',
    accept: async () => {
      const ok = await courseStore.deleteLesson(courseId, chapterId, lessonId);
      if (ok) {
        toast.add({ severity: 'success', summary: 'Lesson deleted', life: 2000 });
        router.push({ name: 'chapter-lessons', params: { courseId, chapterId } });
      } else {
        toast.add({ severity: 'error', summary: 'Failed to delete lesson', life: 2500 });
      }
    }
  });
};
</script>

<style scoped>
</style>
