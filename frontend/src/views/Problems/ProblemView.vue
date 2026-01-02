<template>
  <div
    v-if="!problem"
    class="w-full flex align-items-center justify-content-center"
    style="min-height: 320px"
  >
    <ProgressSpinner style="width: 3.5rem; height: 3.5rem"></ProgressSpinner>
  </div>
  <Card v-else class="py-3">
    <template #title>
      <div class="flex align-items-center justify-content-between w-full">
        <h2 class="m-0">{{ problem?.title || 'Problem' }}</h2>
        <Button class="p-button-text" label="Back" icon="pi pi-angle-left" @click="goBack"></Button>
      </div>
    </template>

    <template #subtitle>
      <div>Author: {{ problem?.author.first_name }} {{ problem?.author.last_name }}</div>
      <div class="mt-3">
        <Button
          class="mr-2"
          :class="editorTab ? '' : 'p-button-outlined'"
          label="Editor"
          @click="() => (editorTab = true)"
        ></Button>
        <Button
          :class="!editorTab ? '' : 'p-button-outlined'"
          label="Submissions"
          @click="switchToSubmissions"
        ></Button>
      </div>
    </template>

    <template #content>
      <div class="p-fluid grid">
        <ProblemEditorPanel
          v-if="editorTab"
          v-model:editor-code="editorCode"
          :problem="problem"
          @submit="handleSubmitFromPanel"
          @back="goBack"
        ></ProblemEditorPanel>
        <ProblemSubmissionsPanel
          v-else
          :submissions="submissions"
          :loading="loadingSubmissions"
          :loading-more="loadingMore"
          :has-next="!!nextCursor"
          :selected="selectedSubmission"
          :problem="problem"
          @select="(s) => selectSubmission(s)"
          @load-more="loadMoreSubmissions"
        ></ProblemSubmissionsPanel>
      </div>
    </template>
  </Card>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Card from 'primevue/card';
import Button from 'primevue/button';
import ProgressSpinner from 'primevue/progressspinner';
import { useProblemStore } from '../../store/problem';
import { useSubmissionStore } from '../../store/submission';
import ProblemEditorPanel from '../../components/ProblemEditorPanel.vue';
import ProblemSubmissionsPanel from '../../components/ProblemSubmissionsPanel.vue';
import { useToast } from 'primevue/usetoast';
import { useCursorPagination } from '../../composables/useCursorPagination';

const route = useRoute();
const router = useRouter();
const problemId = route.params.problemId;

const problemStore = useProblemStore();
const submissionStore = useSubmissionStore();
const toast = useToast();

const editorTab = ref(true);
const editorCode = ref('');
const ws = ref(null);

const problem = computed(() => problemStore.currentProblem);

const pagination = useCursorPagination(
  (cursor) => submissionStore.listSubmissions(problemId, cursor),
  { initialLoad: false }
);

const submissions = computed(() => pagination.items.value);
const loadingSubmissions = computed(() => pagination.loading.value);
const loadingMore = computed(() => pagination.loadingMore.value);
const nextCursor = computed(() => pagination.nextCursor.value);
const selectedSubmission = computed({
  get: () => submissionStore.currentSubmission,
  set: (value) => submissionStore.setCurrentSubmission(value),
});

const goBack = () => router.push({ name: 'browse-problems' });

async function fetchProblem() {
  const data = await problemStore.getProblem(problemId);
  if (data) {
    editorCode.value = data.starting_code || '';
  } else if (problemStore.error) {
    toast.add({
      severity: 'error',
      summary: 'Failed to load problem',
      detail: problemStore.error.message || 'An error occurred',
      life: 4000,
    });
  }
}

function selectSubmission(s) {
  submissionStore.setCurrentSubmission(s);
}

async function handleSubmitFromPanel(payload) {
  const created = await submissionStore.createSubmission(problemId, payload);
  if (created) {
    pagination.items.value.unshift(created);
    submissionStore.setCurrentSubmission(created);
    editorTab.value = false;
    toast.add({
      severity: 'success',
      summary: 'Submission created',
      life: 2500,
    });
  } else {
    const error = submissionStore.error;
    if (error?.status === 429) {
      const retryAfter =
        error.details?.retry_after || error.originalError?.response?.headers?.['retry-after'];
      const detail = retryAfter
        ? `You're sending submissions too quickly - please wait ${retryAfter} seconds before trying again.`
        : "You're sending submissions too quickly - please wait a few moments before trying again.";
      toast.add({ severity: 'warn', summary: 'Too many submissions', detail, life: 6000 });
    } else {
      toast.add({
        severity: 'error',
        summary: 'Submission failed',
        detail: error?.message || 'An error occurred while submitting. Please try again later.',
        life: 4000,
      });
    }
  }
}

function switchToSubmissions() {
  if (editorTab.value) {
    editorTab.value = false;
    if (submissions.value.length === 0) {
      pagination.fetchPage(null, false);
    }
  }
}

function loadMoreSubmissions() {
  pagination.loadMore();
}

function updateSubmissionRealtime(submission) {
  const index = pagination.items.value.findIndex((s) => s.id === submission.id);
  if (index !== -1) {
    pagination.items.value[index] = { ...pagination.items.value[index], ...submission };
  } else {
    pagination.items.value.unshift(submission);
  }
  if (submissionStore.currentSubmission && submissionStore.currentSubmission.id === submission.id) {
    submissionStore.setCurrentSubmission({ ...submissionStore.currentSubmission, ...submission });
  }
}

function setupWebsocket() {
  const proto = location.protocol === 'https:' ? 'wss' : 'ws';
  const url = `${proto}://${location.host}/ws/submission/`;

  const connect = (url) => {
    try {
      const socket = new WebSocket(url);
      let opened = false;
      const openTimeout = setTimeout(() => {
        if (!opened) {
          try {
            socket.close();
          } catch (_e) {
            // Ignore close errors
          }
        }
      }, 2500);
      socket.onopen = () => {
        opened = true;
        clearTimeout(openTimeout);
      };
      socket.onmessage = (evt) => {
        try {
          const data = JSON.parse(evt.data);
          updateSubmissionRealtime(data);
        } catch (e) {
          console.error('invalid ws message', e);
        }
      };
      socket.onclose = () => {
        setTimeout(() => connect(url), 5000);
      };
      socket.onerror = (err) => {
        console.warn('ws error', err, url);
      };
      ws.value = socket;
    } catch (e) {
      console.error('could not open websocket', e, url);
    }
  };

  connect(url);
}

onMounted(async () => {
  await fetchProblem();
  await pagination.fetchPage(null, false);
  setupWebsocket();
});

onBeforeUnmount(() => {
  if (ws.value) {
    ws.value.close();
  }
});
</script>
