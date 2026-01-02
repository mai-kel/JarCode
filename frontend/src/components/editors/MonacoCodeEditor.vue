<template>
  <div class="relative" :style="{ height: `${height}px`, border: '1px solid #ddd' }">
    <div
      v-if="!isEditorReady"
      class="w-full h-full flex flex-column align-items-center justify-content-center"
      style="background-color: #1e1e1e"
    >
      <ProgressSpinner
        style="width: 50px; height: 50px"
        stroke-width="4"
        animation-duration=".5s"
        aria-label="Loading"
      />
    </div>
    <div ref="editorContainer" class="w-full h-full"></div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount, nextTick } from 'vue';
import loader from '@monaco-editor/loader';
import ProgressSpinner from 'primevue/progressspinner';
import { mapToMonacoLanguage } from '../../utils/monacoLanguageMapper';

const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
  language: {
    type: String,
    default: 'PYTHON',
  },
  readOnly: {
    type: Boolean,
    default: false,
  },
  height: {
    type: Number,
    default: 600,
  },
  theme: {
    type: String,
    default: 'vs-dark',
  },
  minimap: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['update:modelValue']);

const editorContainer = ref(null);
const isEditorReady = ref(false);
let monacoEditor = null;
let monacoApi = null;

async function createEditor() {
  if (!editorContainer.value) return;

  try {
    const monaco = await loader.init();
    monacoApi = monaco;

    const monacoLang = mapToMonacoLanguage(props.language);

    monacoEditor = monaco.editor.create(editorContainer.value, {
      value: props.modelValue || '',
      language: monacoLang,
      automaticLayout: true,
      theme: props.theme,
      minimap: { enabled: props.minimap },
      readOnly: props.readOnly,
      scrollBeyondLastLine: false,
    });

    monacoEditor.onDidChangeModelContent(() => {
      if (!props.readOnly) {
        emit('update:modelValue', monacoEditor.getValue());
      }
    });

    isEditorReady.value = true;
  } catch (err) {
    console.error('Monaco editor initialization failed', err);
  }
}

watch(
  () => props.modelValue,
  (newVal) => {
    if (monacoEditor && monacoEditor.getValue() !== newVal) {
      monacoEditor.setValue(newVal || '');
    }
  }
);

watch(
  () => props.language,
  (newLang) => {
    if (!monacoApi || !monacoEditor) return;
    const monacoLang = mapToMonacoLanguage(newLang);
    if (monacoEditor.getModel()) {
      monacoApi.editor.setModelLanguage(monacoEditor.getModel(), monacoLang);
    }
  }
);

watch(
  () => props.readOnly,
  (newVal) => {
    if (monacoEditor) {
      monacoEditor.updateOptions({ readOnly: newVal });
    }
  }
);

onMounted(() => {
  nextTick(() => {
    createEditor();
  });
});

onBeforeUnmount(() => {
  if (monacoEditor) {
    monacoEditor.dispose();
    monacoEditor = null;
  }
});
</script>

<style scoped>
.monaco-editor {
  width: 100%;
}
</style>
