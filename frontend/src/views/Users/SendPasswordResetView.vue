<template>
  <div class="form-container">
    <Card class="form-card">
      <template #title>
        <h2 class="text-center">Send password reset link</h2>
      </template>

      <template #content>
        <form @submit.prevent="handleSend">
          <div class="p-fluid">
            <div class="field">
              <label for="email">Email</label>
              <InputText id="email" v-model="email" type="email" />
            </div>

            <Message v-if="successMessage" severity="success" :closable="false">
              {{ successMessage }}
            </Message>

            <Message v-if="error" severity="error" :closable="false">
              {{ getErrorMessage(error) }}
            </Message>

            <Button
              type="submit"
              label="Send link"
              class="mt-4"
              :loading="isLoading"
              :disabled="!!successMessage"
            />
          </div>
        </form>
      </template>

      <template #footer>
        <div class="text-center">
          Remembered your password? <router-link to="/login">Login</router-link>
        </div>
      </template>
    </Card>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useAuthStore } from '../../store/auth';
import { getErrorMessage } from '../../utils/errorHandler';

const authStore = useAuthStore();

const email = ref('');
const isLoading = computed(() => authStore.isLoading);
const error = computed(() => authStore.error);
const successMessage = ref('');

const handleSend = async () => {
  successMessage.value = '';
  authStore.clearError();
  const success = await authStore.sendPasswordReset(email.value);
  if (success) {
    successMessage.value =
      'If an account with this email exists and is active, a password reset link was sent.';
  }
};
</script>
