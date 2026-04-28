import axios from 'axios';

const primaryUrl = process.env.REACT_APP_API_URL || 'http://localhost:5001';
const fallbackUrl = process.env.REACT_APP_FALLBACK_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: primaryUrl,
});

let fallbackAttempted = false;

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (!fallbackAttempted && error?.code === 'ERR_CONNECTION_REFUSED') {
      fallbackAttempted = true;
      api.defaults.baseURL = fallbackUrl;
      error.config.baseURL = fallbackUrl;
      return axios(error.config);
    }
    return Promise.reject(error);
  }
);

export default api;
