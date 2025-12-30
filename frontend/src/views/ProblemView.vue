<template>
  <div v-if="!problem" class="w-full flex align-items-center justify-content-center" style="min-height:320px;">
    <ProgressSpinner style="width:3.5rem;height:3.5rem"></ProgressSpinner>
  </div>
  <Card v-else class="py-3">
    <template #title>
      <div class="flex align-items-center justify-content-between w-full">
        <h2 class="m-0">{{ problem?.title || 'Problem' }}</h2>
        <Button class="p-button-text" label="Back" icon="pi pi-angle-left" @click="goBack"></Button>
      </div>
    </template>

    <template #subtitle>
      <div>
        Author: {{ problem?.author.first_name }} {{ problem?.author.last_name }}
      </div>
      <div class="mt-3">
        <Button class="mr-2" :class="editorTab ? '' : 'p-button-outlined'" label="Editor" @click="() => (editorTab = true)"></Button>
        <Button :class="!editorTab ? '' : 'p-button-outlined'" label="Submissions" @click="switchToSubmissions"></Button>
      </div>
    </template>

    <template #content>
      <div class="p-fluid grid">
          <ProblemEditorPanel v-if="editorTab" :problem="problem" v-model:editorCode="editorCode" @submit="handleSubmitFromPanel" @back="goBack"></ProblemEditorPanel>
          <ProblemSubmissionsPanel
            v-else
            :submissions="submissions"
            :loading="loadingSubmissions"
            :loadingMore="loadingMore"
            :hasNext="!!nextCursor"
            :selected="selectedSubmission"
            :problem="problem"
            @select="selectSubmission"
            @load-more="loadMoreSubmissions"
          ></ProblemSubmissionsPanel>
      </div>
    </template>
  </Card>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Card from 'primevue/card';
import Button from 'primevue/button';
import ProgressSpinner from 'primevue/progressspinner';

import ProblemEditorPanel from '../components/ProblemEditorPanel.vue';
import ProblemSubmissionsPanel from '../components/ProblemSubmissionsPanel.vue';

import { getProblem } from '../services/problemService';
import submissionService from '../services/submissionService';
import { useToast } from 'primevue/usetoast';

const route = useRoute();
const router = useRouter();
const problemId = route.params.problemId;

const problem = ref(null);
const editorTab = ref(true);
const editorCode = ref("")

const submissions = ref([]);
const loadingSubmissions = ref(false);
const loadingMore = ref(false);
const nextCursor = ref(null);
const selectedSubmission = ref(null);
const ws = ref(null);
const toast = useToast();

const goBack = () => router.push({ name: 'browse-problems' });

async function fetchProblem() {
  try {
    const data = await getProblem(problemId);
    problem.value = data;
    editorCode.value = data.starting_code;
  }
  catch (err) { console.error(err); }
}

function parseCursorFromUrl(url) {
  try {
    if (!url) return null;
    const u = url.includes('://') ? new URL(url) : new URL(url, location.origin);
    return u.searchParams.get('cursor');
  } catch (e) {
    try {
      const m = url.match(/[?&]cursor=([^&]+)/);
      return m ? decodeURIComponent(m[1]) : null;
    } catch (e2) { return null; }
  }
}

async function fetchSubmissions(cursor = null, append = false) {
  if (append) loadingMore.value = true; else loadingSubmissions.value = true;
  try {
    const data = await submissionService.listSubmissions(problemId, cursor);
    if (append) submissions.value.push(...(data.results || []));
    else submissions.value = data.results || [];
    nextCursor.value = parseCursorFromUrl(data.next);
    if (submissions.value.length && !selectedSubmission.value) selectedSubmission.value = submissions.value[0];
  } catch (err) { console.error('Error loading submissions', err); }
  finally { loadingMore.value = false; loadingSubmissions.value = false; }
}

function selectSubmission(s) { selectedSubmission.value = s; }

async function handleSubmitFromPanel(payload) {
  try {
    const created = await submissionService.createSubmission(problemId, payload);
    submissions.value.unshift(created);
    selectedSubmission.value = created;
    editorTab.value = false;
  } catch (err) {
    if (err && err.response && err.response.status === 429) {
      const retryAfter = err.response.headers && err.response.headers['retry-after'];
      const detail = retryAfter ? `You're sending submissions too quickly - please wait ${retryAfter} seconds before trying again.`
                                : "You're sending submissions too quickly - please wait a few moments before trying again.";
      toast.add({ severity: 'warn', summary: 'Too many submissions', detail, life: 6000 });
    } else {
      console.error('submit error', err);
      toast.add({ severity: 'error', summary: 'Submission failed', detail: 'An error occurred while submitting. Please try again later.', life: 4000 });
    }
  }
}

function switchToSubmissions() {
  if (editorTab.value) {
    editorTab.value = false;
    fetchSubmissions();
  }
}

async function loadMoreSubmissions() {
  if (!nextCursor.value || loadingMore.value) return;
  await fetchSubmissions(nextCursor.value, true);
}

function setupWebsocket() {
  const proto = location.protocol === 'https:' ? 'wss' : 'ws';
  const url = `${proto}://${location.host}/ws/submission/`;

  const connect = (url) => {
    try {
      const socket = new WebSocket(url);
      let opened = false;
      const openTimeout = setTimeout(() => { if (!opened) { try { socket.close(); } catch (e) {} } }, 2500);
      socket.onopen = () => { opened = true; clearTimeout(openTimeout); };
      socket.onmessage = (evt) => {
        try {
          const data = JSON.parse(evt.data);
          const idx = submissions.value.findIndex(s => s.id === data.id);
          if (idx !== -1) submissions.value[idx] = { ...submissions.value[idx], ...data };
          else submissions.value.unshift(data);
          if (selectedSubmission.value && selectedSubmission.value.id === data.id) selectedSubmission.value = { ...selectedSubmission.value, ...data };
        } catch (e) { console.error('invalid ws message', e); }
      };
      socket.onclose = () => { setTimeout(() => connect(url), 5000); };
      socket.onerror = (err) => { console.warn('ws error', err, url); };
      ws.value = socket;
    } catch (e) { console.error('could not open websocket', e, url); }
  };

  connect(url);
}

onMounted(async () => { await fetchProblem(); await fetchSubmissions(); setupWebsocket(); });
onBeforeUnmount(() => { if (ws.value) ws.value.close(); });
</script>
