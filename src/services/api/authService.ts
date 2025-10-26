import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiService } from './apiService';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  username: string;
  role: string;
  phone?: string;
  is_privacy_policy_accepted: boolean;
  is_newsletter_subscription: boolean;
}

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  specialization?: string;
  experience?: number;
  role: string;
  isEmailVerified: boolean;
  isActive: boolean;
  is_privacy_policy_accepted: boolean;
  is_newsletter_subscription: boolean;
  organizationId?: number;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

class AuthService {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      console.log('AuthService: Attempting login with credentials:', { email: credentials.email });
      console.log('AuthService: Making request to /auth/login');
      
      const response = await apiService.post<AuthResponse>('/auth/login', credentials);
      
      console.log('AuthService: Login successful, response:', response);
      
      // Сохраняем токен и пользователя
      await AsyncStorage.setItem('token', response.accessToken);
      await AsyncStorage.setItem('user', JSON.stringify(response.user));
      
      console.log('AuthService: Token and user saved to AsyncStorage');
      
      return response;
    } catch (error) {
      console.error('AuthService: Login error:', error);
      console.error('AuthService: Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        statusText: error.response?.statusText
      });
      throw error;
    }
  }

  async register(userData: RegisterData): Promise<{ message: string; user: User }> {
    try {
      const response = await apiService.post<{ message: string; user: User }>('/auth/register', userData);
      return response;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const userString = await AsyncStorage.getItem('user');
      if (userString) {
        return JSON.parse(userString);
      }
      return null;
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  }

  async isAuthenticated(): Promise<boolean> {
    try {
      const token = await AsyncStorage.getItem('token');
      const user = await AsyncStorage.getItem('user');
      return !!(token && user);
    } catch (error) {
      console.error('Auth check error:', error);
      return false;
    }
  }

  async updateProfile(data: Partial<User>): Promise<User> {
    try {
      const response = await apiService.put<User>('/auth/profile', data);
      
      // Обновляем пользователя в хранилище
      await AsyncStorage.setItem('user', JSON.stringify(response));
      
      return response;
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    try {
      return await apiService.post<{ message: string }>('/auth/forgot-password', { email });
    } catch (error) {
      console.error('Forgot password error:', error);
      throw error;
    }
  }

  async resetPassword(token: string, password: string): Promise<{ message: string }> {
    try {
      return await apiService.post<{ message: string }>('/auth/reset-password', { token, password });
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  }

  async verifyEmail(token: string): Promise<{ message: string }> {
    try {
      return await apiService.get<{ message: string }>(`/auth/verify-email?token=${token}`);
    } catch (error) {
      console.error('Verify email error:', error);
      throw error;
    }
  }
}

export const authService = new AuthService();
