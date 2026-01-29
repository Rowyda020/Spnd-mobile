import { User } from '../context/AuthContext';
import api from './api';
import * as SecureStore from 'expo-secure-store';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  username: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: {
    _id: string;
    username: string;
    email: string;
    totalIncome: number;
  };
  message: string;
}

class AuthService {
async login(credentials: LoginCredentials): Promise<AuthResponse> {
  const response = await api.post('/login/jwt', credentials);
  console.log('[LOGIN RESPONSE]', response.data);           // ← add this
  await this.saveAuthData(response.data);
  return response.data;
}

  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    const response = await api.post('/register', credentials);
    await this.saveAuthData(response.data);
    return response.data;
  }

  async googleLogin(idToken: string): Promise<AuthResponse> {
    const response = await api.post('/login/google/mobile', { idToken });
    await this.saveAuthData(response.data);
    return response.data;
  }
  // services/auth.service.ts
async refreshCurrentUser(): Promise<User | null> {
  try {
    const response = await api.get('/me'); // or '/user/profile'
    const freshUser = response.data;

    // Update storage with latest data
    await SecureStore.setItemAsync('user', JSON.stringify(freshUser));

    return freshUser;
  } catch (error) {
    console.error('Failed to refresh user from server:', error);
    return null;
  }
}

async saveAuthData(data: AuthResponse) {
  console.log('[Saving token]', data.token ? 'yes' : 'no token!');
  await SecureStore.setItemAsync('token', data.token);
  await SecureStore.setItemAsync('user', JSON.stringify(data.user));
}

  async logout() {
    await SecureStore.deleteItemAsync('token');
    await SecureStore.deleteItemAsync('user');
  }

  async getToken(): Promise<string | null> {
    return await SecureStore.getItemAsync('token');
  }

  async getUser() {
    const userString = await SecureStore.getItemAsync('user');
    return userString ? JSON.parse(userString) : null;
  }

  async isAuthenticated(): Promise<boolean> {
    const token = await this.getToken();
    return !!token;
  }
}

export default new AuthService();
