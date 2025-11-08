<template>
  <Card class="p-3">
    <template #title>
      <div class="flex align-items-center justify-content-between w-full">
        <h2 class="m-0">Create Problem</h2>
        <Button class="p-button-text" label="Back" icon="pi pi-angle-left" @click="goHome" />
      </div>
    </template>
    <template #content>
      <form @submit.prevent="handleCreate" class="p-fluid grid">
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

        <div class="col-12 mt-3 flex align-items-center">
          <Button type="submit" label="Create Problem" icon="pi pi-plus" :loading="isLoading" />
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
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import Card from 'primevue/card';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Dropdown from 'primevue/dropdown';
import Message from 'primevue/message';

import ProblemEditor from '../components/ProblemEditor.vue';
import { Languages, Difficulties } from '../constants/problems';
import problemService from '../services/problemService';

const router = useRouter();
const toast = useToast();

const title = ref('');
const description = ref('');
const startingCode = ref('');
const testCode = ref('');
const language = ref(Languages[0].value);
const difficulty = ref(Difficulties[0].value);

const submitted = ref(false);
const isLoading = ref(false);
const error = ref(null);

const languageOptions = Languages;
const difficultyOptions = Difficulties;

const handleCreate = async () => {
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

    const created = await problemService.createProblem(payload);
    if (created?.id) {
      toast.add({ severity: 'success', summary: 'Problem created', life: 2500 });
      router.push({ name: 'home' });
    } else {
      error.value = { message: 'Unexpected response from server.' };
    }
  } catch (err) {
    error.value = err.response?.data || err.message || err;
  } finally {
    isLoading.value = false;
  }
};

const goHome = () => router.push({ name: 'home' });

function onUpdateDescription(v) {
  description.value = v;
}

function onUpdateStartingCode(v) {
  startingCode.value = v;
}

function onUpdateTestCode(v) {
  testCode.value = v;
}
</script>

<style scoped>
</style>
