import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import apiClient, { initCSRF } from '../services/api'

export const useAuthStore = defineStore('auth', () => {

  const user = ref(null)
  const isLoading = ref(false)
  const error = ref(null)
  const csrfInitialized = ref(false);

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
      router.push({ name: 'login' })
      return true;
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
    }
  }

  return {
    user,
    isLoading,
    error,
    isAuthenticated,
    login,
    register,
    logout,
    fetchUser
  }
})
