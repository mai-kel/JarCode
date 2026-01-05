<template>
  <div class="w-full">
    <div v-if="!problem" class="text-center p-3">
      <ProgressSpinner></ProgressSpinner>
    </div>

    <div v-else class="p-fluid grid">
      <div class="col-12 lg:col-5">
        <Card>
          <template #title> Description </template>
          <template #subtitle>
            Language: {{ formattedLanguage }}
            <br />
            Difficulty: {{ formattedDifficulty }}
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
            <MonacoCodeEditor
              v-model="editorCode"
              :language="problem?.language || 'PYTHON'"
              :height="575"
              class="mb-3"
            />

            <div class="flex gap-2">
              <Button
                label="Submit"
                icon="pi pi-play"
                :loading="isSubmitting"
                @click="submit"
              ></Button>
            </div>

            <div v-if="submitError" class="mt-3 text-red-600">
              Error: {{ submitError.message || submitError }}
            </div>
          </template>
        </Card>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted } from 'vue';
import DOMPurify from 'dompurify';
import Card from 'primevue/card';
import Button from 'primevue/button';
import MonacoCodeEditor from './editors/MonacoCodeEditor.vue';
import { Languages, Difficulties } from '../constants/problems';

const props = defineProps({ problem: Object });
const emits = defineEmits(['submit', 'back']);
const editorCode = defineModel('editorCode');

const isSubmitting = ref(false);
const submitError = ref(null);

const sanitizedDescription = computed(() => {
  return props.problem?.description ? DOMPurify.sanitize(props.problem.description) : '';
});

const formattedLanguage = computed(
  () => Languages.find((l) => l.value === props.problem.language).text
);

const formattedDifficulty = computed(
  () => Difficulties.find((l) => l.value === props.problem.difficulty).text
);

async function submit() {
  isSubmitting.value = true;
  submitError.value = null;
  try {
    emits('submit', { solution: editorCode.value });
  } catch (err) {
    submitError.value = err;
  } finally {
    isSubmitting.value = false;
  }
}

// Apply Prism.js syntax highlighting to code blocks
function highlightCodeBlocks() {
  nextTick(() => {
    if (window.Prism) {
      window.Prism.highlightAll();
    }
  });
}

// Watch for changes in problem to re-highlight code blocks
watch(
  () => props.problem,
  () => {
    highlightCodeBlocks();
  },
  { deep: true }
);

// Highlight code blocks on mount if problem is already loaded
onMounted(() => {
  highlightCodeBlocks();
});
</script>

<style scoped>
.left-panel-scroll {
  height: 575px;
  overflow-y: auto;
  padding-right: 8px;
}
.monaco-editor {
  width: 100%;
}
</style>
