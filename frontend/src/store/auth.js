import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import apiClient, { initCSRF } from '../services/api'

export const useAuthStore = defineStore('auth', () => {

  const user = ref(null)
  const isLoading = ref(false)
  const error = ref(null)
  const csrfInitialized = ref(false);
  const isReady = ref(false); // becomes true after initial user fetch attempt

  const router = useRouter()

  const isAuthenticated = computed(() => !!user.value)

  async function ensureCsrf() {
    if (!csrfInitialized.value) {
      await initCSRF();
      csrfInitialized.value = true;
    }
  }

  async function login(credentials) {
    isLoading.value = true
    error.value = null
    try {
      await ensureCsrf();
      const response = await apiClient.post('/users/login/', credentials)
      user.value = response.data
      isReady.value = true
      router.push({ name: 'home' })
      return true;
    } catch (e) {
      error.value = e.response?.data || { message: 'An unknown error occurred' }
      return false;
    } finally {
      isLoading.value = false
    }
  }

  async function register(details) {
    isLoading.value = true
    error.value = null
    try {
      await ensureCsrf();
      await apiClient.post('/users/register/', details)
      isReady.value = true
      return true
    } catch (e) {
      error.value = e.response?.data || { message: 'An unknown error occurred' }
      return false;
    } finally {
      isLoading.value = false
    }
  }

  async function logout() {
    isLoading.value = true
    error.value = null
    try {
      await ensureCsrf();
      await apiClient.post('/users/logout/')
      user.value = null
      isReady.value = true
      router.push({ name: 'login' })
    } catch (e) {
      error.value = e.response?.data || { message: 'An unknown error occurred' }
    } finally {
      isLoading.value = false
    }
  }

  async function fetchUser() {
    isLoading.value = true;
    error.value = null;
    try {
      await ensureCsrf();
      const response = await apiClient.get('/users/me/');
      user.value = response.data;
    } catch (e) {
      user.value = null;
    } finally {
      isLoading.value = false;
      isReady.value = true;
    }
  }

  async function verifyAccount({ user_id, user_uuid, token }) {
    isLoading.value = true
    error.value = null
    try {
      await ensureCsrf();
      const payload = { user_id, user_uuid, token }
      const resp = await apiClient.post('/users/verify-account/', payload)
      return resp.status === 200
    } catch (e) {
      error.value = e.response?.data || { message: 'An unknown error occurred' }
      return false
    } finally {
      isLoading.value = false
    }
  }

  async function resendVerification(email) {
    try {
      await ensureCsrf();
      await apiClient.post('/users/resend-verification-link/', { email })
      return { ok: true }
    } catch (e) {
      const respErr = e.response?.data || { message: 'An unknown error occurred' }
      return { ok: false, error: respErr }
    }
  }

  async function sendPasswordReset(email) {
    try {
      await ensureCsrf();
      await apiClient.post('/users/send-password-reset-link/', { email })
      return { ok: true }
    } catch (e) {
      const respErr = e.response?.data || { message: 'An unknown error occurred' }
      return { ok: false, error: respErr }
    }
  }

  async function changePassword({ user_id, user_uuid, token, password, password2 }) {
    try {
      await ensureCsrf();
      const payload = { user_id, user_uuid, token, password, password2 }
      const resp = await apiClient.put('/users/change-password/', payload)
      return { ok: resp.status === 200 }
    } catch (e) {
      const respErr = e.response?.data || { message: 'An unknown error occurred' }
      return { ok: false, error: respErr }
    }
  }

  async function updateProfile({ first_name, last_name }) {
    isLoading.value = true
    error.value = null
    try {
      await ensureCsrf();
      const payload = { first_name, last_name }
      const resp = await apiClient.put('/users/me/', payload)
      user.value = resp.data
      return { ok: true, data: resp.data }
    } catch (e) {
      const respErr = e.response?.data || { message: 'An unknown error occurred' }
      error.value = respErr
      return { ok: false, error: respErr }
    } finally {
      isLoading.value = false
    }
  }

  return {
    user,
    isLoading,
    error,
    isReady,
    isAuthenticated,
    login,
    register,
    logout,
    fetchUser,
    verifyAccount,
    resendVerification,
    sendPasswordReset,
    changePassword,
    updateProfile
  }
})
