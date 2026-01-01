<template>
  <Card>
    <template #title>
      <h2>Reset password</h2>
    </template>

    <template #content>
      <div class="p-fluid">
        <div v-if="status === 'pending'">
          <Message severity="info" :closable="false">Resetting your password, please wait...</Message>
        </div>

        <div v-else-if="status === 'success'">
          <Message severity="success" :closable="false">Your password has been changed successfully.</Message>
        </div>

        <div v-else-if="status === 'invalid'">
          <Message severity="error" :closable="false">This password reset link is invalid or has expired.</Message>
        </div>

        <div v-else>
          <form @submit.prevent="handleReset">
            <div class="field">
              <label for="password">New password</label>
              <InputText id="password" v-model="password" type="password" />
              <div v-if="fieldErrors.password">
                <div v-for="(m, i) in fieldErrors.password" :key="i" class="p-error" style="margin-top:6px">{{ m }}</div>
              </div>
            </div>

            <div class="field">
              <label for="password2">Confirm password</label>
              <InputText id="password2" v-model="password2" type="password" />
              <div v-if="fieldErrors.password2">
                <div v-for="(m, i) in fieldErrors.password2" :key="i" class="p-error" style="margin-top:6px">{{ m }}</div>
              </div>
              <div v-if="password && password2 && password !== password2" class="p-error" style="margin-top:6px">Passwords do not match.</div>
            </div>

            <Message v-if="fieldErrors._non_field && fieldErrors._non_field.length" severity="error" :closable="false">
              <div v-for="(m, i) in fieldErrors._non_field" :key="i">{{ m }}</div>
            </Message>

            <Button type="submit" label="Reset password" :loading="isLoading" :disabled="isSubmitDisabled" class="mt-4" />
          </form>
        </div>
      </div>
    </template>

    <template #footer>
      <Button v-if="status === 'success'" label="Go to login" @click="goToLogin" />
    </template>
  </Card>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '../../store/auth';
import { getErrorMessage } from '../../utils/errorHandler';
import { parseApiErrorFields } from '../../utils/parseApiError';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const status = ref('form');
const password = ref('');
const password2 = ref('');
const isLoading = computed(() => authStore.isLoading);
const fieldErrors = ref({});

const isSubmitDisabled = computed(() => {
  if (isLoading.value) return true;
  if (!password.value || !password2.value) return true;
  if (password.value !== password2.value) return true;
  return false;
});

const goToLogin = () => router.push({ name: 'login' });
const goHome = () => router.push({ name: 'home' });

onMounted(() => {
  const { user_id, user_uuid, token } = route.params;
  if (!user_id || !user_uuid || !token) {
    status.value = 'invalid';
    return;
  }
  try {
    const basePath = '/reset-password';
    window.history.replaceState(null, '', basePath);
  } catch (e) {
    // Ignore history API errors
  }
});

const handleReset = async () => {
  const { user_id, user_uuid, token } = route.params;
  if (!user_id || !user_uuid || !token) {
    status.value = 'invalid';
    return;
  }

  fieldErrors.value = {};
  authStore.clearError();

  try {
    const success = await authStore.changePassword({
      user_id: Number(user_id),
      user_uuid: String(user_uuid),
      token: String(token),
      password: password.value,
      password2: password2.value
    });

    if (success) {
      status.value = 'success';
      fieldErrors.value = {};
    } else {
      const storeError = authStore.error;
      fieldErrors.value = storeError?.fields || parseApiErrorFields(storeError?.details || storeError);
    }
  } catch (e) {
    const respErr = e.response?.data || e.message || 'An unknown error occurred';
    fieldErrors.value = parseApiErrorFields(respErr);
  }
}
</script>
