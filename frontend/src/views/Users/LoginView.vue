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
              <div v-if="fieldErrors.email">
                <div v-for="(m,i) in fieldErrors.email" :key="i" class="p-error" style="margin-top:6px">{{ m }}</div>
              </div>
            </div>

            <div class="field">
              <label for="password">Password</label>
              <InputText id="password" v-model="password" type="password" />
              <div v-if="fieldErrors.password">
                <div v-for="(m,i) in fieldErrors.password" :key="i" class="p-error" style="margin-top:6px">{{ m }}</div>
              </div>
            </div>

            <Message v-if="fieldErrors._non_field && fieldErrors._non_field.length" severity="error" :closable="false">
              <div v-for="(m,i) in fieldErrors._non_field" :key="i">{{ m }}</div>
            </Message>

            <Button type="submit" label="Login" class="mt-4" :loading="authStore.isLoading" />
          </div>
        </form>
      </template>
      <template #footer>
        <div style="padding-bottom: 5px;">
          Forgot password? <router-link to="/send-password-reset">Reset here</router-link>
        </div>
        <div style="padding-bottom: 5px;">
          Don't have an account? <router-link to="/register">Register here</router-link>
        </div>
        <div>
          Resend verification email <router-link to="/resend-verification">  here </router-link>
        </div>
      </template>
    </Card>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useAuthStore } from '../../store/auth';
import { useToast } from 'primevue/usetoast';
import parseApiError, { parseApiErrorFields } from '../../utils/parseApiError'

const email = ref('');
const password = ref('');
const authStore = useAuthStore();
const toast = useToast();
const fieldErrors = ref({})

const handleLogin = async () => {
  const success = await authStore.login({
    email: email.value,
    password: password.value
  });

  if (success) {
    fieldErrors.value = {}
  } else {
    fieldErrors.value = parseApiErrorFields(authStore.error)
  }
};

</script>
