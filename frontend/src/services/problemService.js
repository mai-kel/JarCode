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

export default {
  createProblem
};
