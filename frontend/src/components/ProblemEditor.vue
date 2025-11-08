<template>
  <div>
    <div class="field">
      <label for="description">Description</label>
      <Editor id="description" v-model="localDescription" :init="editorInit" />
    </div>

    <div class="field mt-3">
      <label>Starting Code</label>
      <div ref="startingEditor" class="monaco-editor" style="height:320px;border:1px solid #ddd" />
    </div>

    <div class="field mt-3">
      <label>Test Code</label>
      <div ref="testEditor" class="monaco-editor" style="height:320px;border:1px solid #ddd" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';
import Editor from '@tinymce/tinymce-vue';

import 'tinymce/tinymce';
import 'tinymce/models/dom/model';
import 'tinymce/themes/silver';
import 'tinymce/icons/default';
import 'tinymce/plugins/advlist';
import 'tinymce/plugins/autolink';
import 'tinymce/plugins/lists';
import 'tinymce/plugins/link';
import 'tinymce/plugins/charmap';
import 'tinymce/plugins/preview';
import 'tinymce/plugins/anchor';
import 'tinymce/plugins/searchreplace';
import 'tinymce/plugins/visualblocks';
import 'tinymce/plugins/code';
import 'tinymce/plugins/fullscreen';
import 'tinymce/plugins/insertdatetime';
import 'tinymce/plugins/table';
import 'tinymce/plugins/codesample';
import 'tinymce/plugins/help';
import 'tinymce/plugins/wordcount';

import editorContentCss from 'tinymce/skins/content/default/content.css?url';
import editorContentUiCss from 'tinymce/skins/ui/oxide/content.min.css?url';
import prismThemeCss from 'prismjs/themes/prism-okaidia.css?url';

import loader from '@monaco-editor/loader';

const props = defineProps({
  description: { type: String, default: '' },
  startingCode: { type: String, default: '' },
  testCode: { type: String, default: '' },
  language: { type: String, default: 'PYTHON' }
});

const emit = defineEmits(['update:description', 'update:startingCode', 'update:testCode']);

const startingEditor = ref(null);
const testEditor = ref(null);

let startingMonacoEditor = null;
let testMonacoEditor = null;
let monacoApi = null;

const localDescription = ref(props.description);

const editorInit = {
  height: 300,
  menubar: false,
  plugins: [
    'advlist', 'autolink', 'lists', 'link', 'charmap', 'preview',
    'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
    'insertdatetime', 'table', 'codesample', 'help', 'wordcount'
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
    { text: 'Python', value: 'python' },
  ]
};

onMounted(async () => {
  try {
    const monaco = await loader.init();

    startingMonacoEditor = monaco.editor.create(startingEditor.value, {
      value: props.startingCode || '',
      language: mapToMonacoLanguage(props.language),
      automaticLayout: true,
      theme: 'vs-dark',
      minimap: { enabled: false }
    });

    testMonacoEditor = monaco.editor.create(testEditor.value, {
      value: props.testCode || '',
      language: mapToMonacoLanguage(props.language),
      automaticLayout: true,
      theme: 'vs-dark',
      minimap: { enabled: false }
    });

    monacoApi = monaco;

    startingMonacoEditor.onDidChangeModelContent(() => {
      emit('update:startingCode', startingMonacoEditor.getValue());
    });

    testMonacoEditor.onDidChangeModelContent(() => {
      emit('update:testCode', testMonacoEditor.getValue());
    });

  } catch (err) {
    console.error('Error initializing Monaco editor', err);
  }
});

onBeforeUnmount(() => {
  if (startingMonacoEditor) startingMonacoEditor.dispose();
  if (testMonacoEditor) testMonacoEditor.dispose();
});

watch(() => props.description, (v) => {
  if (v !== localDescription.value) localDescription.value = v;
});

watch(localDescription, (v) => emit('update:description', v));

watch(() => props.startingCode, (v) => {
  if (startingMonacoEditor && startingMonacoEditor.getValue() !== v) {
    startingMonacoEditor.setValue(v || '');
  }
});

watch(() => props.testCode, (v) => {
  if (testMonacoEditor && testMonacoEditor.getValue() !== v) {
    testMonacoEditor.setValue(v || '');
  }
});

watch(() => props.language, (newLang) => {
  if (!monacoApi) return;
  const monacoLang = mapToMonacoLanguage(newLang);
  if (startingMonacoEditor && startingMonacoEditor.getModel()) {
    monacoApi.editor.setModelLanguage(startingMonacoEditor.getModel(), monacoLang);
  }
  if (testMonacoEditor && testMonacoEditor.getModel()) {
    monacoApi.editor.setModelLanguage(testMonacoEditor.getModel(), monacoLang);
  }
});

function mapToMonacoLanguage(value) {
  switch ((value || '').toUpperCase()) {
    case 'JAVA':
      return 'java';
    case 'PYTHON':
    default:
      return 'python';
  }
}

</script>

<style scoped>
.monaco-editor {
  width: 100%;
}
</style>
