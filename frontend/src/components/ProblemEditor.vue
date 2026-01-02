<template>
  <div>
    <div class="field">
      <label for="description">Description</label>
      <Editor id="description" v-model="localDescription" :init="editorInit" />
    </div>

    <div class="field mt-3">
      <label>Starting Code</label>
      <MonacoCodeEditor v-model="localStartingCode" :language="language" :height="600" />
    </div>

    <div class="field mt-3">
      <label>Test Code</label>
      <MonacoCodeEditor v-model="localTestCode" :language="language" :height="600" />
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import Editor from '@tinymce/tinymce-vue';
import '../utils/tinymceImports';
import { createTinyMCEConfig } from '../utils/tinymceConfig';
import MonacoCodeEditor from './editors/MonacoCodeEditor.vue';

const props = defineProps({
  description: { type: String, default: '' },
  startingCode: { type: String, default: '' },
  testCode: { type: String, default: '' },
  language: { type: String, default: 'PYTHON' },
});

const emit = defineEmits(['update:description', 'update:startingCode', 'update:testCode']);

const localDescription = ref(props.description);
const localStartingCode = ref(props.startingCode);
const localTestCode = ref(props.testCode);

const editorInit = createTinyMCEConfig({
  height: 500,
  codesampleLanguages: [{ text: 'Python', value: 'python' }],
});

watch(
  () => props.description,
  (v) => {
    if (v !== localDescription.value) localDescription.value = v;
  }
);

watch(localDescription, (v) => emit('update:description', v));

watch(
  () => props.startingCode,
  (v) => {
    if (v !== localStartingCode.value) localStartingCode.value = v;
  }
);

watch(localStartingCode, (v) => emit('update:startingCode', v));

watch(
  () => props.testCode,
  (v) => {
    if (v !== localTestCode.value) localTestCode.value = v;
  }
);

watch(localTestCode, (v) => emit('update:testCode', v));
</script>

<style scoped>
.monaco-editor {
  width: 100%;
}
</style>
