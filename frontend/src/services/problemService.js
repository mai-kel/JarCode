import apiClient from './api';

const BASE = '/problems/';

export async function createProblem(payload) {
  const resp = await apiClient.post(BASE, payload);
  return resp.data;
}

export default {
  createProblem
};
