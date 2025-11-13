<template>
    <Card>
      <template #title>
        <h2>Account verification</h2>
      </template>

      <template #content>
        <div class="p-fluid">
          <div v-if="status === 'pending'">
            <Message severity="info" :closable="false">
                Verifying your account, please wait...
            </Message>
          </div>

          <div v-else-if="status === 'success'">
            <Message severity="success" :closable="false">
                Your account has been successfully verified.
            </Message>
          </div>

          <div v-else-if="status === 'invalid'">
            <Message severity="error" :closable="false">
                This verification link is invalid or has expired.
            </Message>
          </div>

          <div v-else>
            <Message severity="warn" :closable="false">
                Unexpected error has occurred.
            </Message>
          </div>
        </div>
      </template>

      <template #footer>
        <Button v-if="status === 'success'" label="Go to login" @click="goToLogin" />
        <Button v-else label="Return to home" @click="goHome" />
      </template>
    </Card>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../store/auth'

const route = useRoute()
const router = useRouter()
const status = ref('pending')
const authStore = useAuthStore()

const goToLogin = () => router.push({ name: 'login' })
const goHome = () => router.push({ name: 'home' })

onMounted(async () => {
  const { user_id, user_uuid, token } = route.params

  try {
    const basePath = '/verify-account'
    window.history.replaceState(null, '', basePath)
  } catch (e) {

  }

  if (!user_id || !user_uuid || !token) {
    status.value = 'invalid'
    return
  }

  try {
    const payload = {
      user_id: Number(user_id),
      user_uuid: String(user_uuid),
      token: String(token)
    }

    const ok = await authStore.verifyAccount(payload)
    status.value = ok ? 'success' : 'invalid'
  } catch (err) {
    status.value = 'invalid'
  }
})
</script>
