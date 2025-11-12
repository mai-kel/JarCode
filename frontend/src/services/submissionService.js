import apiClient from './api';

const BASE = (problemId) => `/problems/${problemId}/submissions/`;

export async function listSubmissions(problemId) {
  const resp = await apiClient.get(BASE(problemId));
  return resp.data;
}

export async function createSubmission(problemId, payload) {
  const resp = await apiClient.post(BASE(problemId), payload);
  return resp.data;
}

export default {
  listSubmissions,
  createSubmission
};
