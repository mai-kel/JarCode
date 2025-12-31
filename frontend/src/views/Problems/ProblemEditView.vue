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
          <Message v-if="error" severity="error" :closable="true">
            <strong>Error:</strong> {{ error.message || error }}
          </Message>
        </div>
      </form>
    </template>
  </Card>
</template>

<script setup>
import { ref, onMounted, computed, onBeforeUnmount } from 'vue';
import { useRoute, useRouter, onBeforeRouteLeave } from 'vue-router';
import { useConfirm } from 'primevue/useconfirm';
import { useToast } from 'primevue/usetoast';
import Card from 'primevue/card';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Dropdown from 'primevue/dropdown';
import Message from 'primevue/message';

import ProblemEditor from '../../components/ProblemEditor.vue';
import { Languages, Difficulties } from '../../constants/problems';
import { getProblem, updateProblem, deleteProblem } from '../../services/problemService';

const route = useRoute();
const router = useRouter();
const toast = useToast();
const confirm = useConfirm();

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
const isLoading = ref(false);
const error = ref(null);

const languageOptions = Languages;
const difficultyOptions = Difficulties;

onMounted(async () => {
  isLoading.value = true;
  try {
    const data = await getProblem(problemId);
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
  } catch (err) {
    error.value = err.response?.data || err.message || err;
  } finally {
    isLoading.value = false;
  }
});

const handleUpdate = async () => {
  submitted.value = true;
  error.value = null;

  if (!title.value || !description.value || !startingCode.value || !testCode.value || !language.value || !difficulty.value) {
    error.value = { message: 'All fields are required.' };
    return;
  }

  isLoading.value = true;
  try {
    const payload = {
      title: title.value,
      description: description.value,
      language: language.value,
      starting_code: startingCode.value,
      test_code: testCode.value,
      difficulty: difficulty.value
    };

  const updated = await updateProblem(problemId, payload);
  toast.add({ severity: 'success', summary: 'Problem updated', life: 2500 });
  originalTitle.value = title.value;
  originalDescription.value = description.value;
  originalStartingCode.value = startingCode.value;
  originalTestCode.value = testCode.value;
  originalLanguage.value = language.value;
  originalDifficulty.value = difficulty.value;
  } catch (err) {
    error.value = err.response?.data || err.message || err;
  } finally {
    isLoading.value = false;
  }
};

const goBack = () => router.push({ name: 'my-problems' });

const confirmDeleteProblem = () => {
  confirm.require({
    header: 'Delete problem',
    message: 'Are you sure you want to delete this problem? This cannot be undone.',
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: 'Delete',
    rejectLabel: 'Cancel',
    acceptClass: 'p-button-danger',
    accept: async () => {
      isLoading.value = true;
      try {
        await deleteProblem(problemId);
        toast.add({ severity: 'success', summary: 'Problem deleted', life: 2000 });
        router.push({ name: 'my-problems' });
      } catch (err) {
        toast.add({ severity: 'error', summary: 'Failed to delete problem', detail: err.response?.data || err.message || err, life: 4000 });
      } finally {
        isLoading.value = false;
      }
    }
  });
};

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

onBeforeRouteLeave((to, from, next) => {
  if (!isDirty.value) return next();
  confirm.require({
    header: 'Unsaved changes',
    message: 'You have unsaved changes. Leave without saving?',
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: 'Leave',
    rejectLabel: 'Stay',
    acceptClass: 'p-button-danger',
    accept: () => next(),
    reject: () => next(false)
  });
});

const beforeUnload = (e) => {
  if (isDirty.value) {
    e.preventDefault();
    e.returnValue = '';
  }
};

window.addEventListener('beforeunload', beforeUnload);
onBeforeUnmount(() => window.removeEventListener('beforeunload', beforeUnload));
</script>

<style scoped>
</style>
