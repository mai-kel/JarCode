import { defineStore } from 'pinia';
import { ref } from 'vue';
import * as submissionService from '../services/submissionService';
import { getErrorMessage } from '../utils/errorHandler';

export const useSubmissionStore = defineStore('submission', () => {
  const isLoading = ref(false);
  const error = ref(null);
  const currentSubmission = ref(null);

  /**
   * List submissions for a problem
   * @param {number} problemId - Problem ID
   * @param {string} cursor - Pagination cursor
   * @returns {Promise<Object>} Response with submissions data
   */
  async function listSubmissions(problemId, cursor = null) {
    isLoading.value = true;
    error.value = null;
    try {
      const data = await submissionService.listSubmissions(problemId, cursor);
      return data;
    } catch (err) {
      error.value = {
        message: getErrorMessage(err),
        details: err.details || err,
        status: err.status || 0,
      };
      return { results: [], next: null };
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Create a new submission
   * @param {number} problemId - Problem ID
   * @param {Object} payload - Submission data
   * @returns {Promise<Object|null>} Created submission or null on error
   */
  async function createSubmission(problemId, payload) {
    isLoading.value = true;
    error.value = null;
    try {
      const data = await submissionService.createSubmission(problemId, payload);
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
   * Set current submission
   * @param {Object} submission - Submission to set as current
   */
  function setCurrentSubmission(submission) {
    currentSubmission.value = submission;
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
    currentSubmission,
    listSubmissions,
    createSubmission,
    setCurrentSubmission,
    clearError,
  };
});
