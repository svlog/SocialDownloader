import axios from 'axios';

/**
 * Pre-configured Axios instance with centralized error handling.
 */
export const apiClient = axios.create({
  timeout: 30000,
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    let message = 'An unexpected error occurred while communicating with the server.';

    if (error.response?.data?.error) {
      message = error.response.data.error;
    } else if (error.response?.data?.msg) {
      message = error.response.data.msg;
    } else if (error.response?.status) {
      message = `Server returned error (${error.response.status}). Please try again later.`;
    } else if (error.message) {
      message = error.message;
    }

    return Promise.reject(new Error(message));
  },
);
