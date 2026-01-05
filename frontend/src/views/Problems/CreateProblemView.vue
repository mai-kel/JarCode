<template>
  <Card class="p-3">
    <template #title>
      <div class="flex align-items-center justify-content-between w-full">
        <h2 class="m-0">Create Problem</h2>
        <Button class="p-button-text" label="Back" icon="pi pi-angle-left" @click="goHome" />
      </div>
    </template>
    <template #content>
      <form class="p-fluid grid" @submit.prevent="handleCreate">
        <div class="field col-12">
          <label for="title">Title</label>
          <InputText
            id="title"
            v-model="title"
            :invalid="submitted && !title"
            placeholder="Enter problem title"
          />
          <small v-if="submitted && !title" class="p-error">Title is required.</small>
        </div>

        <div class="field col-12 md:col-6">
          <label for="language">Language</label>
          <Dropdown
            id="language"
            v-model="language"
            :options="languageOptions"
            option-label="text"
            option-value="value"
          />
        </div>

        <div class="field col-12 md:col-6">
          <label for="difficulty">Difficulty</label>
          <Dropdown
            id="difficulty"
            v-model="difficulty"
            :options="difficultyOptions"
            option-label="text"
            option-value="value"
          />
        </div>

        <div class="col-12">
          <ProblemEditor
            v-model:description="description"
            v-model:starting-code="startingCode"
            v-model:test-code="testCode"
            :language="language"
          />
        </div>

        <div class="col-12 mt-3 flex align-items-center">
          <Button type="submit" label="Create Problem" icon="pi pi-plus" :loading="isLoading" />
        </div>

        <div class="col-12 mt-3">
          <Message
            v-if="error"
            severity="error"
            :closable="true"
            @close="problemStore.clearError()"
          >
            <strong>Error:</strong> {{ error?.message || 'An error occurred' }}
          </Message>
        </div>
      </form>
    </template>
  </Card>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import Card from 'primevue/card';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Dropdown from 'primevue/dropdown';
import Message from 'primevue/message';

import ProblemEditor from '../../components/ProblemEditor.vue';
import { Languages, Difficulties } from '../../constants/problems';
import { useProblemStore } from '../../store/problem';
import { useUnsavedChanges } from '../../composables/useUnsavedChanges';

const router = useRouter();
const toast = useToast();
const problemStore = useProblemStore();

const title = ref('');
const description = ref('');
const startingCode = ref('');
const testCode = ref('');
const language = ref(Languages[0].value);
const difficulty = ref(Difficulties[0].value);

const submitted = ref(false);

const isLoading = computed(() => problemStore.isLoading);
const error = computed(() => problemStore.error);

const languageOptions = Languages;
const difficultyOptions = Difficulties;

const handleCreate = async () => {
  submitted.value = true;
  problemStore.clearError();

  if (
    !title.value ||
    !description.value ||
    !startingCode.value ||
    !testCode.value ||
    !language.value ||
    !difficulty.value
  ) {
    toast.add({
      severity: 'error',
      summary: 'Validation error',
      detail: 'All fields are required.',
      life: 4000,
    });
    return;
  }

  const payload = {
    title: title.value,
    description: description.value,
    language: language.value,
    starting_code: startingCode.value,
    test_code: testCode.value,
    difficulty: difficulty.value,
  };

  const created = await problemStore.createProblem(payload);
  if (created?.id) {
    toast.add({ severity: 'success', summary: 'Problem created', life: 2500 });
    // Reset form fields to clear dirty state before navigation
    title.value = '';
    description.value = '';
    startingCode.value = '';
    testCode.value = '';
    language.value = Languages[0].value;
    difficulty.value = Difficulties[0].value;
    submitted.value = false;
    router.push({ name: 'edit-problem', params: { problemId: created.id } });
  } else {
    toast.add({
      severity: 'error',
      summary: 'Failed to create problem',
      detail: problemStore.error?.message || 'An error occurred',
      life: 4000,
    });
  }
};

const goHome = () => router.push({ name: 'home' });

const isDirty = computed(
  () =>
    !!title.value || !!description.value || !!startingCode.value || !!testCode.value
);

useUnsavedChanges(isDirty);
</script>

<style scoped></style>
