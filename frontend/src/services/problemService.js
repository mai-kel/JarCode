import apiClient from './api';

const BASE = '/problems/';

/**
 * Create a new problem
 * @param {Object} payload - Problem data
 * @returns {Promise<Object>} Created problem data
 */
export async function createProblem(payload) {
  const response = await apiClient.post(BASE, payload);
  return response.data;
}

/**
 * Get problem by ID
 * @param {number} id - Problem ID
 * @returns {Promise<Object>} Problem data
 */
export async function getProblem(id) {
  const response = await apiClient.get(`${BASE}${id}/`);
  return response.data;
}

/**
 * Update problem
 * @param {number} id - Problem ID
 * @param {Object} payload - Problem data
 * @returns {Promise<Object>} Updated problem data
 */
export async function updateProblem(id, payload) {
  const response = await apiClient.put(`${BASE}${id}/`, payload);
  return response.data;
}

/**
 * Delete problem
 * @param {number} id - Problem ID
 * @returns {Promise<void>}
 */
export async function deleteProblem(id) {
  await apiClient.delete(`${BASE}${id}/`);
}

/**
 * List problems with optional filters
 * @param {Object} filters - Filter options
 * @param {string} filters.search - Search query for problem title
 * @param {string} filters.language - Language filter
 * @param {string} filters.difficulty - Difficulty filter
 * @param {number} filters.author - Author user ID filter
 * @param {string} filters.cursor - Pagination cursor
 * @param {boolean} filters.is_solved - Filter by solved status
 * @returns {Promise<Object>} Response with problems data
 */
export async function listProblems({ search = '', language = null, difficulty = null, author = null, cursor = null, is_solved = null } = {}) {
  const params = {};
  if (search) params.title = search;
  if (language) params.language = language;
  if (difficulty) params.difficulty = difficulty;
  if (author) params.author = author;
  if (is_solved !== null && is_solved !== undefined) params.is_solved = is_solved;
  if (cursor) params.cursor = cursor;
  const response = await apiClient.get(BASE, { params });
  return response.data;
}

export default {
  createProblem,
  getProblem,
  updateProblem,
  deleteProblem,
  listProblems
};
