// api.ts
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_URL } from '../config/env';

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await SecureStore.getItemAsync('token');
      console.log('[API REQUEST]', config.method?.toUpperCase(), config.url);
      console.log('[Token from SecureStore]', token ? 'EXISTS (length: ' + token.length + ')' : 'MISSING');

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('[Authorization header added]');
      } else {
        console.log('[No token → request sent without auth]');
      }

      console.log('[Full config headers]', config.headers);
      return config;
    } catch (error) {
      console.error('[Token interceptor error]', error);
      return config;
    }
  },
  (error) => {
    console.error('[Request interceptor rejection]', error);
    return Promise.reject(error);
  }
);

// Response interceptor (keep as is, but add log)
api.interceptors.response.use(
  (response) => {
    console.log('[API RESPONSE OK]', response.status, response.config.url);
    return response;
  },
  async (error) => {
    console.log('[API RESPONSE ERROR]', error.response?.status, error.response?.data);
    if (error.response?.status === 401) {
      console.log('[401 DETECTED] Clearing token');
      await SecureStore.deleteItemAsync('token');
      await SecureStore.deleteItemAsync('user');
    }
    return Promise.reject(error);
  }
);

export default api;