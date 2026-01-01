import apiClient from './api';

const BASE = (problemId) => `/problems/${problemId}/submissions/`;

/**
 * List submissions for a problem
 * @param {number} problemId - Problem ID
 * @param {string} cursor - Pagination cursor
 * @returns {Promise<Object>} Response with submissions data
 */
export async function listSubmissions(problemId, cursor = null) {
  const url = cursor ? `${BASE(problemId)}?cursor=${encodeURIComponent(cursor)}` : BASE(problemId);
  const response = await apiClient.get(url);
  return response.data;
}

/**
 * Create a new submission
 * @param {number} problemId - Problem ID
 * @param {Object} payload - Submission data (code, language, etc.)
 * @returns {Promise<Object>} Created submission data
 */
export async function createSubmission(problemId, payload) {
  const response = await apiClient.post(BASE(problemId), payload);
  return response.data;
}

export default {
  listSubmissions,
  createSubmission
};
