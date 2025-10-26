import axios from 'axios';


const API_URL = '/api';

const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});


function getCsrfToken() {
  const cookieValue = document.cookie
    .split('; ')
    .find(row => row.startsWith('csrftoken='))
    ?.split('=')[1];
  return cookieValue;
}


export const initCSRF = async () => {
  try {
    await apiClient.get('/users/csrf-init/');
  } catch (error) {
    console.error('Error initializing CSRF token:', error);
  }
};

apiClient.interceptors.request.use(
  (config) => {
    const methodsRequiringCsrf = ['post', 'put', 'patch', 'delete'];

    if (methodsRequiringCsrf.includes(config.method.toLowerCase())) {
      const token = getCsrfToken();
      if (token) {
        config.headers['X-CSRFToken'] = token;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);


apiClient.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default apiClient;

