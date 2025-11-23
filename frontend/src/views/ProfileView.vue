<template>
  <div>
    <Card>
      <template #title>
        <h2>Profile</h2>
      </template>

      <template #content>
        <form @submit.prevent="handleSave">
          <div class="p-fluid">
            <div class="field">
              <label for="firstName">First Name</label>
              <InputText id="firstName" v-model="firstName" />
            </div>

            <div class="field">
              <label for="lastName">Last Name</label>
              <InputText id="lastName" v-model="lastName" />
            </div>

            <div class="field">
              <label for="email">Email</label>
              <InputText id="email" v-model="email" :disabled="true" />
            </div>

            <Message v-if="sendSuccessMessage" severity="success" :closable="false">
              {{ sendSuccessMessage }}
            </Message>

            <Message v-if="error" severity="error" :closable="false">
              {{ getErrorMessage(error) }}
            </Message>

            <div>
              <Button label="Send password reset link" icon="pi pi-envelope" class="p-button-primary"
                      :loading="isSendingReset" @click="handleSend" :disabled="!!sendSuccessMessage || !email" />
            </div>
            <div class="mt-3">
              <Button type="submit" label="Save" icon="pi pi-check" class="p-button-success" :loading="isLoading" :disabled="!isDirty" />
            </div>
          </div>
        </form>
      </template>
    </Card>
  </div>
</template>

<script setup>
import { ref, watchEffect, computed } from 'vue'
import { useAuthStore } from '../store/auth'
import parseApiError from '../utils/parseApiError'
import { useToast } from 'primevue/usetoast'

const authStore = useAuthStore()
const toast = useToast()

const firstName = ref('')
const lastName = ref('')
const email = ref('')
const isLoading = ref(false)
const isSendingReset = ref(false)
const error = ref(null)
const sendSuccessMessage = ref('')

const getErrorMessage = parseApiError

watchEffect(() => {
  const u = authStore.user
  firstName.value = u?.first_name || ''
  lastName.value = u?.last_name || ''
  email.value = u?.email || ''
})

const isDirty = computed(() => {
  const u = authStore.user
  if (!u) return false
  return firstName.value !== (u.first_name || '') || lastName.value !== (u.last_name || '')
})

const handleSave = async () => {
  if (!isDirty.value) return
  isLoading.value = true
  error.value = null
  try {
    const resp = await authStore.updateProfile({ first_name: firstName.value, last_name: lastName.value })
    if (resp.ok) {
      toast.add({ severity: 'success', summary: 'Profile updated', life: 2500 })
    } else {
      error.value = resp.error
    }
  } catch (e) {
    error.value = e.response?.data || { message: 'An unknown error occurred' }
  } finally {
    isLoading.value = false
  }
}

const handleSend = async () => {
  if (!email.value) return
  isSendingReset.value = true
  error.value = null
  sendSuccessMessage.value = ''
  try {
    const resp = await authStore.sendPasswordReset(email.value)
    if (resp.ok) {
      sendSuccessMessage.value = 'Email with a password reset link will be sent to you shortly.'
    } else {
      error.value = resp.error
    }
  } catch (e) {
    error.value = e.response?.data || { message: 'An unknown error occurred' }
  } finally {
    isSendingReset.value = false
  }
}
</script>
