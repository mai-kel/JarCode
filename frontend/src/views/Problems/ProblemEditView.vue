<template>
  <Card class="p-3">
    <template #title>
      <div class="flex align-items-center justify-content-between w-full">
        <h2 class="m-0">Edit Problem</h2>
        <Button class="p-button-text" label="Back to my problems" icon="pi pi-angle-left" @click="goBack" />
      </div>
    </template>
    <template #content>
      <form @submit.prevent="handleUpdate" class="p-fluid grid">
        <div class="field col-12">
          <label for="title">Title</label>
          <InputText id="title" v-model="title" :invalid="submitted && !title" placeholder="Enter problem title" />
          <small v-if="submitted && !title" class="p-error">Title is required.</small>
        </div>

        <div class="field col-12 md:col-6">
          <label for="language">Language</label>
          <Dropdown id="language" :options="languageOptions" optionLabel="text" optionValue="value" v-model="language" />
        </div>

        <div class="field col-12 md:col-6">
          <label for="difficulty">Difficulty</label>
          <Dropdown id="difficulty" :options="difficultyOptions" optionLabel="text" optionValue="value" v-model="difficulty" />
        </div>

        <div class="col-12">
          <ProblemEditor
            v-model:description="description"
            v-model:startingCode="startingCode"
            v-model:testCode="testCode"
            :language="language"
          />
        </div>

        <div class="col-12 mt-3">
          <div class="flex flex-column align-items-stretch">
            <div class="mb-2">
              <Button
                type="button"
                label="Delete Problem"
                icon="pi pi-trash"
                class="p-button-danger p-button-text"
                style="width: auto"
                @click="confirmDeleteProblem"
              />
            </div>

            <div>
              <Button type="submit" label="Save" icon="pi pi-save" :loading="isLoading" :disabled="!isDirty" style="width: 100%;" />
            </div>
          </div>
        </div>

        <div class="col-12 mt-3">
          <Message v-if="error" severity="error" :closable="true" @close="problemStore.clearError()">
            <strong>Error:</strong> {{ error?.message || 'An error occurred' }}
          </Message>
        </div>
      </form>
    </template>
  </Card>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import Card from 'primevue/card';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Dropdown from 'primevue/dropdown';
import Message from 'primevue/message';

import ProblemEditor from '../../components/ProblemEditor.vue';
import { Languages, Difficulties } from '../../constants/problems';
import { useProblemStore } from '../../store/problem';
import { getErrorMessage } from '../../utils/errorHandler';
import { useUnsavedChanges } from '../../composables/useUnsavedChanges';
import { useDeleteConfirmation } from '../../composables/useDeleteConfirmation';

const route = useRoute();
const router = useRouter();
const toast = useToast();
const problemStore = useProblemStore();

const problemId = route.params.problemId;

const title = ref('');
const description = ref('');
const startingCode = ref('');
const testCode = ref('');
const language = ref(Languages[0].value);
const difficulty = ref(Difficulties[0].value);

const originalTitle = ref('');
const originalDescription = ref('');
const originalStartingCode = ref('');
const originalTestCode = ref('');
const originalLanguage = ref('');
const originalDifficulty = ref('');

const submitted = ref(false);

const isLoading = computed(() => problemStore.isLoading);
const error = computed(() => problemStore.error);

const languageOptions = Languages;
const difficultyOptions = Difficulties;

onMounted(async () => {
  problemStore.clearError();
  const data = await problemStore.getProblem(problemId);
  if (data) {
    title.value = data.title;
    description.value = data.description;
    startingCode.value = data.starting_code;
    testCode.value = data.test_code;
    language.value = data.language;
    difficulty.value = data.difficulty;
    originalTitle.value = title.value;
    originalDescription.value = description.value;
    originalStartingCode.value = startingCode.value;
    originalTestCode.value = testCode.value;
    originalLanguage.value = language.value;
    originalDifficulty.value = difficulty.value;
  } else if (problemStore.error) {
    toast.add({
      severity: 'error',
      summary: 'Failed to load problem',
      detail: problemStore.error.message || 'An error occurred',
      life: 4000
    });
  }
});

const handleUpdate = async () => {
  submitted.value = true;
  problemStore.clearError();

  if (!title.value || !description.value || !startingCode.value || !testCode.value || !language.value || !difficulty.value) {
    toast.add({
      severity: 'error',
      summary: 'Validation error',
      detail: 'All fields are required.',
      life: 4000
    });
    return;
  }

  const payload = {
    title: title.value,
    description: description.value,
    language: language.value,
    starting_code: startingCode.value,
    test_code: testCode.value,
    difficulty: difficulty.value
  };

  const updated = await problemStore.updateProblem(problemId, payload);
  if (updated) {
    toast.add({ severity: 'success', summary: 'Problem updated', life: 2500 });
    originalTitle.value = title.value;
    originalDescription.value = description.value;
    originalStartingCode.value = startingCode.value;
    originalTestCode.value = testCode.value;
    originalLanguage.value = language.value;
    originalDifficulty.value = difficulty.value;
  } else {
    toast.add({
      severity: 'error',
      summary: 'Failed to update problem',
      detail: problemStore.error?.message || 'An error occurred',
      life: 4000
    });
  }
};

const goBack = () => router.push({ name: 'my-problems' });

const confirmDeleteProblem = useDeleteConfirmation({
  header: 'Delete problem',
  message: 'Are you sure you want to delete this problem? This cannot be undone.',
  onConfirm: () => problemStore.deleteProblem(problemId),
  successRoute: 'my-problems',
  successMessage: 'Problem deleted',
  errorMessage: 'Failed to delete problem',
  onError: () => {
    if (problemStore.error) {
      toast.add({
        severity: 'error',
        summary: 'Failed to delete problem',
        detail: problemStore.error?.message || 'An error occurred',
        life: 4000
      });
    }
  }
});

const isDirty = computed(() => {
  return (
    title.value !== originalTitle.value ||
    description.value !== originalDescription.value ||
    startingCode.value !== originalStartingCode.value ||
    testCode.value !== originalTestCode.value ||
    language.value !== originalLanguage.value ||
    difficulty.value !== originalDifficulty.value
  );
});

useUnsavedChanges(isDirty);
</script>

<style scoped>
</style>
