<template>
  <div class="form-container">
    <Card class="form-card">
      <template #title>
        <h2 class="text-center">Login</h2>
      </template>
      <template #content>
        <form @submit.prevent="handleLogin">
          <div class="p-fluid">

            <div class="field">
              <label for="email">Email</label>
              <InputText id="email" v-model="email" type="email" />
            </div>

            <div class="field">
              <label for="password">Password</label>
              <InputText id="password" v-model="password" type="password" />
            </div>

            <Message v-if="authStore.error" severity="error" :closable="false">
              {{ getErrorMessage(authStore.error) }}
            </Message>

            <Button type="submit" label="Login" class="mt-4" :loading="authStore.isLoading" />
          </div>
        </form>
      </template>
      <template #footer>
        <div class="text-center">
          Don't have an account? <router-link to="/register">Register here</router-link>
        </div>
      </template>
    </Card>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useAuthStore } from '../store/auth';
import { useToast } from 'primevue/usetoast';

const email = ref('');
const password = ref('');
const authStore = useAuthStore();
const toast = useToast();

const handleLogin = async () => {
  const success = await authStore.login({
    email: email.value,
    password: password.value
  });

  if (success) {
    toast.add({ severity: 'success', summary: 'Success', detail: 'Logged in successfully!', life: 3000 });
  }
};

const getErrorMessage = (error) => {
  if (error.non_field_errors) {
    return error.non_field_errors.join(', ');
  }
  if(error.message) {
    return error.message;
  }
  return 'Login failed. Please check your credentials.';
};
</script>
