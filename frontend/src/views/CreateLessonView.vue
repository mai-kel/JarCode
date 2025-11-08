<template>
  <Card class="p-3">
    <template #title>
      <h2>Create Lesson</h2>
    </template>
    <template #content>
      <form @submit.prevent="handleCreateLesson" class="p-fluid grid">
        <div class="field col-12 md:col-8">
          <label for="lessonTitle">Lesson Title</label>
          <InputText id="lessonTitle" v-model="title" :invalid="submitted && !title" placeholder="Enter lesson title"/>
          <small v-if="submitted && !title" class="p-error">Title is required.</small>
        </div>

        <div class="field col-12">
          <label for="lessonContent">Content</label>
          <Editor
            id="lessonContent"
            v-model="content"
            :init="editorInit"
          />
          <small v-if="submitted && !content" class="p-error">Content is required.</small>
        </div>

        <div class="col-12 flex align-items-center">
          <Button type="submit" label="Create Lesson" icon="pi pi-plus" :loading="courseStore.isLoading" :disabled="!isDirty"/>
          <Button class="ml-2 p-button-text" label="Back to Lessons" icon="pi pi-angle-left" @click="goBackToLessons"/>
        </div>

        <div class="col-12 mt-3">
          <Message v-if="courseStore.error" severity="error" :closable="true">
            <strong>Error:</strong> {{ courseStore.error.message }}
          </Message>
        </div>
      </form>
    </template>
  </Card>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useCourseStore } from '../store/course';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';
import Editor from '@tinymce/tinymce-vue';

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

const courseId = route.params.courseId;
const chapterId = route.params.chapterId;

const editorInit = computed(() => ({
  height: 400,
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
    'removeformat | table | codesample | help',
  skin: false,
  content_css: [editorContentCss, editorContentUiCss, prismThemeCss],
  codesample_global_prismjs: true,
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

const handleCreateLesson = async () => {
  submitted.value = true;
  courseStore.error = null;
  if (!title.value || !content.value) return;

  const result = await courseStore.createLesson(courseId, chapterId, { title: title.value, content: content.value });
  if (result?.id) {
    toast.add({ severity: 'success', summary: 'Lesson created', life: 2500 });
    router.push({ name: 'chapter-lessons', params: { courseId, chapterId } });
  }
};

const isDirty = computed(() => !!title.value || !!content.value);

const goBackToLessons = () => {
  if (!isDirty.value) return router.push({ name: 'chapter-lessons', params: { courseId, chapterId } });
  confirm.require({
    header: 'Discard changes?',
    message: 'You have unsaved lesson details. Leave without creating?',
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: 'Leave',
    rejectLabel: 'Stay',
    acceptClass: 'p-button-danger',
    accept: () => router.push({ name: 'chapter-lessons', params: { courseId, chapterId } })
  });
};

</script>

<style scoped>
</style>
