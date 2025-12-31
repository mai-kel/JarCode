<template>
  <div class="form-container">
    <Card class="form-card">
      <template #title>
        <h2 class="text-center">Resend verification link</h2>
      </template>

      <template #content>
        <form @submit.prevent="handleResend">
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

            <Button type="submit" label="Send link" class="mt-4" :loading="isLoading" :disabled="!!successMessage" />
          </div>
        </form>
      </template>

      <template #footer>
        <div class="text-center">
          Your account is already verified? <router-link to="/login">Login</router-link>
        </div>
      </template>
    </Card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '../../store/auth'

const authStore = useAuthStore()

const email = ref('')
const isLoading = ref(false)
const error = ref(null)
const successMessage = ref('')

import parseApiError from '../../utils/parseApiError'
const getErrorMessage = parseApiError

const handleResend = async () => {
  isLoading.value = true
  error.value = null
  successMessage.value = ''
  try {
    const resp = await authStore.resendVerification(email.value)
    if (resp.ok) {
      successMessage.value = 'If an account with this email exists and is not yet activated, a verification link was sent.'
    } else {
      error.value = resp.error
    }
  } catch (e) {
    error.value = e.response?.data || { message: 'An unknown error occurred' }
  } finally {
    isLoading.value = false
  }
}
</script>
