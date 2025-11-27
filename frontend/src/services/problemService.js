import apiClient from './api';

const BASE = '/problems/';

export async function createProblem(payload) {
  const resp = await apiClient.post(BASE, payload);
  return resp.data;
}

export async function getProblem(id) {
  const resp = await apiClient.get(`${BASE}${id}/`);
  return resp.data;
}

export async function updateProblem(id, payload) {
  const resp = await apiClient.put(`${BASE}${id}/`, payload);
  return resp.data;
}

export async function deleteProblem(id) {
  const resp = await apiClient.delete(`${BASE}${id}/`);
  return resp.data;
}

export async function listProblems({ search = '', language = null, difficulty = null, author = null, cursor = null, is_solved = null } = {}) {
  const params = {};
  if (search) params.title = search;
  if (language) params.language = language;
  if (difficulty) params.difficulty = difficulty;
  if (author) params.author = author;
  if (is_solved !== null && is_solved !== undefined) params.is_solved = is_solved;
  if (cursor) params.cursor = cursor;
  const resp = await apiClient.get(BASE, { params });
  return resp.data;
}

export default {
  createProblem,
  getProblem,
  updateProblem,
  deleteProblem,
  listProblems
};
