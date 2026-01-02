import { defineStore } from 'pinia';
import { ref } from 'vue';
import * as problemService from '../services/problemService';
import { getErrorMessage } from '../utils/errorHandler';

export const useProblemStore = defineStore('problem', () => {
  const isLoading = ref(false);
  const error = ref(null);
  const currentProblem = ref(null);

  /**
   * Create a new problem
   * @param {Object} payload - Problem data
   * @returns {Promise<Object|null>} Created problem or null on error
   */
  async function createProblem(payload) {
    isLoading.value = true;
    error.value = null;
    try {
      const data = await problemService.createProblem(payload);
      currentProblem.value = data;
      return data;
    } catch (err) {
      error.value = {
        message: getErrorMessage(err),
        details: err.details || err,
        status: err.status || 0,
      };
      return null;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Get problem by ID
   * @param {number} id - Problem ID
   * @returns {Promise<Object|null>} Problem data or null on error
   */
  async function getProblem(id) {
    isLoading.value = true;
    error.value = null;
    try {
      const data = await problemService.getProblem(id);
      currentProblem.value = data;
      return data;
    } catch (err) {
      error.value = {
        message: getErrorMessage(err),
        details: err.details || err,
        status: err.status || 0,
      };
      return null;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Update problem
   * @param {number} id - Problem ID
   * @param {Object} payload - Problem data
   * @returns {Promise<Object|null>} Updated problem or null on error
   */
  async function updateProblem(id, payload) {
    isLoading.value = true;
    error.value = null;
    try {
      const data = await problemService.updateProblem(id, payload);
      if (currentProblem.value && currentProblem.value.id === id) {
        currentProblem.value = data;
      }
      return data;
    } catch (err) {
      error.value = {
        message: getErrorMessage(err),
        details: err.details || err,
        status: err.status || 0,
      };
      return null;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Delete problem
   * @param {number} id - Problem ID
   * @returns {Promise<boolean>} Success status
   */
  async function deleteProblem(id) {
    isLoading.value = true;
    error.value = null;
    try {
      await problemService.deleteProblem(id);
      if (currentProblem.value && currentProblem.value.id === id) {
        currentProblem.value = null;
      }
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

  /**
   * List problems with filters
   * @param {Object} filters - Filter options
   * @returns {Promise<Object>} Response with problems data
   */
  async function listProblems(filters = {}) {
    isLoading.value = true;
    error.value = null;
    try {
      const data = await problemService.listProblems(filters);
      return data;
    } catch (err) {
      error.value = {
        message: getErrorMessage(err),
        details: err.details || err,
        status: err.status || 0,
      };
      return { results: [], next: null, previous: null };
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Clear current problem
   */
  function clearProblem() {
    currentProblem.value = null;
    error.value = null;
  }

  /**
   * Clear error
   */
  function clearError() {
    error.value = null;
  }

  return {
    isLoading,
    error,
    currentProblem,
    createProblem,
    getProblem,
    updateProblem,
    deleteProblem,
    listProblems,
    clearProblem,
    clearError,
  };
});
