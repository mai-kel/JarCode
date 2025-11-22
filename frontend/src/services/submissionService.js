import apiClient from './api';

const BASE = (problemId) => `/problems/${problemId}/submissions/`;


export async function listSubmissions(problemId, cursor = null) {
  const url = cursor ? `${BASE(problemId)}?cursor=${encodeURIComponent(cursor)}` : BASE(problemId);
  const resp = await apiClient.get(url);
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
