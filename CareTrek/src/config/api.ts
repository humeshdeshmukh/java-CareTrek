import axios, { AxiosError } from 'axios';
import { getAuthToken } from '../utils';

// Use the computer's IP address for device/emulator access
// On Android emulator, use 10.0.2.2 for localhost
// On physical device, use your computer's local IP address
// const API_BASE_URL = 'http://10.0.2.2:5000'; // For Android emulator
const API_BASE_URL = 'http://192.168.1.6:5000'; // For physical device

// Create axios instance with base URL
export const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache',
    'Expires': '0'
  },
  timeout: 15000, // 15 seconds timeout
});

// Log request details
api.interceptors.request.use(
  (config) => {
    console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`, {
      baseURL: config.baseURL,
      headers: config.headers,
      data: config.data
    });
    return config;
  },
  (error) => {
    console.error('[API] Request Error:', error);
    return Promise.reject(error);
  }
);

// Log response details
api.interceptors.response.use(
  (response) => {
    console.log(`[API] Response ${response.status} ${response.config.url}`);
    return response;
  },
  (error: AxiosError) => {
    if (error.response) {
      // Server responded with a status code outside 2xx
      console.error('[API] Response Error:', {
        status: error.response.status,
        statusText: error.response.statusText,
        url: error.config?.url,
        method: error.config?.method,
        data: error.response.data
      });
    } else if (error.request) {
      // Request was made but no response received
      console.error('[API] No Response:', {
        url: error.config?.url,
        method: error.config?.method,
        message: 'No response received from server',
        isAxiosError: error.isAxiosError,
        code: error.code
      });
    } else {
      // Something happened in setting up the request
      console.error('[API] Request Setup Error:', error.message);
    }
    return Promise.reject(error);
  }
);

// Add request interceptor to include auth token
api.interceptors.request.use(
  async (config) => {
    try {
      console.log('[API] Getting auth token...');
      const token = await getAuthToken();
      console.log('[API] Token retrieved:', token ? 'Token exists' : 'No token found');
      
      if (token) {
        console.log('[API] Adding Authorization header with token');
        config.headers.Authorization = `Bearer ${token}`;
      } else {
        console.warn('[API] No auth token available for request');
      }
      
      console.log(`[API] Making ${config.method?.toUpperCase()} request to ${config.url}`, {
        url: config.url,
        method: config.method,
        headers: config.headers,
        hasAuthHeader: !!config.headers.Authorization
      });
      
      return config;
    } catch (error) {
      console.error('[API] Error in request interceptor:', error);
      return Promise.reject(error);
    }
  },
  (error) => {
    console.error('[API] Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log(`Response from ${response.config.url}:`, response.status);
    return response;
  },
  (error) => {
    const { response, request, message, config } = error;
    
    if (response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Response error:', {
        status: response.status,
        statusText: response.statusText,
        url: config?.url,
        data: response.data,
      });
      
      if (response.status === 401) {
        console.error('Unauthorized access - please log in');
        // You might want to redirect to login here
      } else if (response.status === 404) {
        console.error('Resource not found:', config?.url);
      } else if (response.status >= 500) {
        console.error('Server error:', response.data);
      }
    } else if (request) {
      // The request was made but no response was received
      console.error('No response from server. Is the backend running?', {
        url: config?.url,
        method: config?.method,
        message: message
      });
    } else {
      // Something happened in setting up the request
      console.error('Request setup error:', message);
    }
    
    return Promise.reject(error);
  }
);

export default api;
