<template #content>
  <div class="w-full">
    <div class="p-fluid grid">
      <div class="col-12 lg:col-5">
          <Card>
          <template #title>
              <h4 class="m-0">Submissions</h4>
          </template>
          <template #content>
          <div v-if="loading" class="text-center p-3"> <ProgressSpinner /></div>
          <div v-else class="left-panel-scroll" ref="listContainer">
              <ul class="list-none p-0 m-0">
                  <li v-for="s in submissions" :key="s.id" class="p-2 border-bottom cursor-pointer" :class="{ 'bg-100': selected && selected.id === s.id }" @click="$emit('select', s)">
                      <div>
                          <div class="font-medium">{{ formatDate(s.created_at) }}</div>
                          <div class="text-sm text-color-secondary">Status: {{ statusLabel(s.status) }}</div>
                          <div class="mt-2">
                              <template v-if="(s.status || '').toUpperCase() !== 'EVALUATED'">
                              <ProgressSpinner style="width:1rem;height:1rem" class="p-mr-2" />
                              </template>
                              <template v-else>
                              <span :class="outcomeInfo(s.result?.outcome).isPass ? 'outcome-pass' : 'outcome-fail'" :title="outcomeInfo(s.result?.outcome).label">
                                  {{ outcomeInfo(s.result?.outcome).icon }}
                              </span>
                              <span class="text-sm text-color-secondary" style="margin-left:8px">{{ outcomeInfo(s.result?.outcome).label }}</span>
                              </template>
                          </div>
                      </div>
                  </li>
              </ul>
              <div v-if="submissions.length === 0" class="p-3 text-color-secondary">No submissions yet.</div>
              <div v-if="loadingMore" class="text-center p-3"> <ProgressSpinner /></div>
          </div>
          </template>
          </Card>
      </div>
      <div v-if="selected" class="col-12 lg:col-7">
        <Card>
        <template #title>
          <h4 class="m-0">Submitted code</h4>
        </template>
        <template #content>
          <MonacoCodeEditor
            :model-value="selected?.solution || ''"
            :language="problem?.language || 'PYTHON'"
            :read-only="true"
            :height="570"
          />
        </template>
        </Card>
      </div>

      <div v-if="selected && selected.result && selected.result.ai_evaluation" class="col-12 lg:col-5">
        <Card>
          <template #title>
            <h4 class="m-0">AI Evaluation</h4>
          </template>
          <template #content>
            <div v-html="sanitizedAiEvaluation" class="submission-ai-evaluation"></div>
          </template>
        </Card>
      </div>

      <div v-if="selected && selected.result && selected.result.output" class="col-12 lg:col-7">
        <Card>
          <template #title>
          <h4 class="m-0">Output</h4>
          </template>
          <template #content>
          <pre class="submission-output">{{ selected.result.output }}</pre>
          </template>
        </Card>
      </div>
    </div>
  </div>
</template>


<script setup>
import { ref, onMounted, computed, onBeforeUnmount, watch, nextTick } from 'vue';
import DOMPurify from 'dompurify';
import { marked } from 'marked';
import Card from 'primevue/card';
import ProgressSpinner from 'primevue/progressspinner';
import MonacoCodeEditor from './editors/MonacoCodeEditor.vue';
import { outcomeInfo, statusLabel } from '../constants/submissions';

const props = defineProps({ submissions: Array, loading: Boolean, selected: Object, problem: Object, hasNext: Boolean, loadingMore: Boolean });
const emits = defineEmits(['select', 'load-more']);

const sanitizedAiEvaluation = computed(() => {
  if (props.selected && props.selected.result && props.selected.result.ai_evaluation){
    const html = marked.parse(props.selected.result.ai_evaluation);
    return DOMPurify.sanitize(html);
  }
  return "";
});

const listContainer = ref(null);
let observer = null;
let autoFillInterval = null;

function formatDate(d) {
  try { return new Date(d).toLocaleString(); } catch (e) { return d; }
}

onBeforeUnmount(() => {
  if (observer) observer.disconnect();
  if (autoFillInterval) clearInterval(autoFillInterval);
});

function observeLastItem() {
  nextTick(() => {
    try {
      if (!listContainer.value) return;
      const ul = listContainer.value.querySelector('ul');
      if (!ul) return;
      const last = ul.querySelector('li:last-child');
      if (!last) return;
      if (observer) observer.disconnect();
      observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            if (!props.loading && !props.loadingMore && props.hasNext) {
              emits('load-more');
            }
          }
        });
      }, { root: listContainer.value, threshold: 0.1 });
      observer.observe(last);
      fillIfNoScroll();
    } catch (e) { console.error('observe error', e); }
  });
}

watch(() => props.submissions && props.submissions.length, () => { observeLastItem(); fillIfNoScroll(); });
onMounted(() => { observeLastItem(); fillIfNoScroll(); });

function fillIfNoScroll() {
  try {
    if (autoFillInterval) return;
    autoFillInterval = setInterval(() => {
      try {
        if (!props.hasNext || props.loading || props.loadingMore) {
          if (!props.hasNext && autoFillInterval) { clearInterval(autoFillInterval); autoFillInterval = null; }
          return;
        }
        const container = listContainer.value;
        if (container) {
          const fits = container.scrollHeight <= container.clientHeight;
          if (fits) {
            emits('load-more');
            return;
          } else {
            clearInterval(autoFillInterval); autoFillInterval = null;
          }
        } else {
          const docH = Math.max(document.documentElement.scrollHeight, document.body.scrollHeight);
          const winH = window.innerHeight || document.documentElement.clientHeight;
          if (docH <= winH) {
            emits('load-more');
            return;
          } else {
            clearInterval(autoFillInterval); autoFillInterval = null;
          }
        }
      } catch (e) { console.error('auto-load loop error', e); }
    }, 250);
  } catch (e) { console.error('auto-load start error', e); }
}
</script>

<style scoped>
.left-panel-scroll { height:570px; overflow-y:auto; padding-right:8px; }
.monaco-editor { width:100%; }
.cursor-pointer { cursor: pointer; }
.border-bottom { border-bottom: 1px solid #eee; }
.bg-100 { background-color: #f5f5f5; }
.outcome-pass { color: #28a745; font-weight: 700; font-size: 1.05rem; }
.outcome-fail { color: #dc3545; font-weight: 700; font-size: 1.05rem; }
.submission-ai-evaluation { max-height:720px; min-height: 300px; overflow:auto; padding-right:0.5rem; }
.submission-output { background:#f7f7f7; white-space:pre-wrap; max-height:720px; min-height: 300px; overflow:auto; margin:0; padding:1rem; }
</style>
