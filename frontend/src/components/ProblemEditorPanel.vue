<template #content>
    <div class="w-full">
        <div v-if="!problem" class="text-center p-3">
            <ProgressSpinner></ProgressSpinner>
        </div>

        <div v-else class="p-fluid grid">
            <div class="col-12 lg:col-5">
                <Card>
                <template #title>
                    <h4 class="m-0">Description</h4>
                </template>
                <template #content>
                    <div class="prose left-panel-scroll" v-html="sanitizedDescription"></div>
                </template>
                </Card>
            </div>

            <div class="col-12 lg:col-7">
                <Card>
                <template #title>
                    <h4 class="m-0">Editor</h4>
                </template>
                <template #content>
                    <div ref="editorContainer" class="monaco-editor" style="height:520px;border:1px solid #ddd;margin-bottom:1rem"></div>

                    <div class="flex gap-2">
                    <Button label="Submit" icon="pi pi-play" @click="submit" :loading="isSubmitting" :disabled="!isEditorReady"></Button>
                    </div>

                    <div v-if="submitError" class="mt-3 text-red-600">Error: {{ submitError.message || submitError }}</div>
                </template>
                </Card>
            </div>
        </div>
    </div>
</template>


<script setup>
import { ref, computed, nextTick, onMounted, onBeforeUnmount } from 'vue';
import DOMPurify from 'dompurify';
import loader from '@monaco-editor/loader';
import Card from 'primevue/card';
import Button from 'primevue/button';
import ProgressSpinner from 'primevue/progressspinner';

const props = defineProps({ problem: Object });
const emits = defineEmits(['submit', 'back']);

const editorContainer = ref(null);
let monacoEditor = null;
let monacoApi = null;

const isSubmitting = ref(false);
const submitError = ref(null);
const isEditorReady = ref(false);

const sanitizedDescription = computed(() => {
  return props.problem?.description ? DOMPurify.sanitize(props.problem.description) : '';
});

async function createEditor() {
  try {
    const monaco = await loader.init();
    monacoApi = monaco;
    if (editorContainer.value) {
      monacoEditor = monaco.editor.create(editorContainer.value, {
        value: props.problem?.starting_code || '',
        language: (props.problem?.language || 'PYTHON').toLowerCase(),
        automaticLayout: true,
        theme: 'vs-dark',
        minimap: { enabled: false },
        scrollBeyondLastLine: false
      });
      isEditorReady.value = true;
    }
  } catch (err) {
    console.error('Monaco init failed', err);
  }
}

async function submit() {
  if (!monacoEditor) return;
  isSubmitting.value = true;
  submitError.value = null;
  try {
    const code = monacoEditor.getValue();
    emits('submit', { solution: code });
  } catch (err) {
    submitError.value = err;
  } finally {
    isSubmitting.value = false;
  }
}

onMounted(() => {
  createEditor();
});

onBeforeUnmount(() => {
  if (monacoEditor) monacoEditor.dispose();
});
</script>

<style scoped>
.left-panel-scroll { height:575px; overflow-y:auto; padding-right:8px; }
.monaco-editor { width: 100%; }
</style>
