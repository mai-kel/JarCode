import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import * as userService from '../services/userService';
import { getErrorMessage } from '../utils/errorHandler';

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null);
  const isLoading = ref(false);
  const error = ref(null);
  const csrfInitialized = ref(false);
  const isReady = ref(false); // becomes true after initial user fetch attempt

  const router = useRouter();

  const isAuthenticated = computed(() => !!user.value);

  async function ensureCsrf() {
    if (!csrfInitialized.value) {
      try {
        await userService.initializeCSRF();
        csrfInitialized.value = true;
      } catch (err) {
        console.error('Error initializing CSRF token:', err);
      }
    }
  }

  async function login(credentials) {
    isLoading.value = true;
    error.value = null;
    try {
      await ensureCsrf();
      const userData = await userService.login(credentials);
      user.value = userData;
      isReady.value = true;
      router.push({ name: 'home' });
      return true;
    } catch (err) {
      error.value = {
        message: getErrorMessage(err),
        details: err.details || err,
        status: err.status || 0,
      };
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  async function register(details) {
    isLoading.value = true;
    error.value = null;
    try {
      await ensureCsrf();
      await userService.register(details);
      isReady.value = true;
      return true;
    } catch (err) {
      error.value = {
        message: getErrorMessage(err),
        details: err.details || err,
        status: err.status || 0,
      };
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  async function logout() {
    isLoading.value = true;
    error.value = null;
    try {
      await ensureCsrf();
      await userService.logout();
      user.value = null;
      isReady.value = true;
      router.push({ name: 'login' });
    } catch (err) {
      error.value = {
        message: getErrorMessage(err),
        details: err.details || err,
        status: err.status || 0,
      };
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchUser() {
    isLoading.value = true;
    error.value = null;
    try {
      await ensureCsrf();
      const userData = await userService.getCurrentUser();
      user.value = userData;
    } catch (err) {
      user.value = null;
      error.value = {
        message: getErrorMessage(err),
        details: err.details || err,
        status: err.status || 0,
      };
    } finally {
      isLoading.value = false;
      isReady.value = true;
    }
  }

  async function verifyAccount({ user_id, user_uuid, token }) {
    isLoading.value = true;
    error.value = null;
    try {
      await ensureCsrf();
      const success = await userService.verifyAccount({ user_id, user_uuid, token });
      return success;
    } catch (err) {
      error.value = {
        message: getErrorMessage(err),
        details: err.details || err,
        status: err.status || 0,
      };
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  async function resendVerification(email) {
    isLoading.value = true;
    error.value = null;
    try {
      await ensureCsrf();
      await userService.resendVerification(email);
      return true;
    } catch (err) {
      error.value = {
        message: getErrorMessage(err),
        details: err.details || err,
        status: err.status || 0,
      };
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  async function sendPasswordReset(email) {
    isLoading.value = true;
    error.value = null;
    try {
      await ensureCsrf();
      await userService.sendPasswordReset(email);
      return true;
    } catch (err) {
      error.value = {
        message: getErrorMessage(err),
        details: err.details || err,
        status: err.status || 0,
      };
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  async function changePassword({ user_id, user_uuid, token, password, password2 }) {
    isLoading.value = true;
    error.value = null;
    try {
      await ensureCsrf();
      const success = await userService.changePassword({
        user_id,
        user_uuid,
        token,
        password,
        password2,
      });
      return success;
    } catch (err) {
      error.value = {
        message: getErrorMessage(err),
        details: err.details || err,
        status: err.status || 0,
      };
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  async function updateProfile({ first_name, last_name }) {
    isLoading.value = true;
    error.value = null;
    try {
      await ensureCsrf();
      const userData = await userService.updateProfile({ first_name, last_name });
      user.value = userData;
      return true;
    } catch (err) {
      error.value = {
        message: getErrorMessage(err),
        details: err.details || err,
        status: err.status || 0,
      };
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  function clearError() {
    error.value = null;
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
    updateProfile,
    clearError,
  };
});
