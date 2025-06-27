import axios, { AxiosResponse, AxiosError } from 'axios';
import { API_BASE_URL } from '../constants/constants';
import { TokenManager } from '../context/tokenManager';

// Create axios instance with base configuration
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Request interceptor to add token to headers
apiClient.interceptors.request.use(
  (config) => {
    const token = TokenManager.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle authentication errors
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    // If we get a 401 response, clear the token and redirect to login
    if (error.response?.status === 401) {
      console.log('Received 401 response, clearing authentication data');
      TokenManager.clearAllAuthData();
      
      // Only redirect if we're not already on the login page
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;
