import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Для Android эмулятора используем 10.0.2.2 вместо localhost
const getApiBaseUrl = () => {
  if (process.env.API_BASE_URL) {
    return process.env.API_BASE_URL;
  }
  
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:4000/api';
  }
  
  return 'http://localhost:4000/api';
};

const API_BASE_URL = getApiBaseUrl();

class ApiService {
  private api: AxiosInstance;

  constructor() {
    console.log('🔧 ApiService: Initializing with baseURL:', API_BASE_URL);
    console.log('🔧 ApiService: Platform:', Platform.OS);
    console.log('🔧 ApiService: Environment API_BASE_URL:', process.env.API_BASE_URL);
    
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor для добавления токена
    this.api.interceptors.request.use(
      async (config) => {
        const token = await AsyncStorage.getItem('token');
        console.log('🔑 ApiService: Token from storage:', token ? 'Present' : 'Not found');
        console.log('🔑 ApiService: Request URL:', config.url);
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
          console.log('🔑 ApiService: Authorization header set');
        } else {
          console.log('⚠️ ApiService: No token found, request will be unauthenticated');
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor для обработки ошибок
    this.api.interceptors.response.use(
      (response) => {
        console.log('✅ ApiService: Response received:', response.status, response.config.url);
        return response;
      },
      async (error) => {
        console.log('❌ ApiService: Response error:', error.response?.status, error.config?.url);
        console.log('❌ ApiService: Error details:', error.response?.data);
        
        if (error.response?.status === 401) {
          console.log('🔑 ApiService: 401 Unauthorized, clearing token');
          // Токен истек, очищаем хранилище
          await AsyncStorage.removeItem('token');
          await AsyncStorage.removeItem('user');
        }
        return Promise.reject(error);
      }
    );
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.api.get<T>(url, config);
    return response.data;
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    console.log('apiService.post called with:', {
      url,
      data,
      config,
      fullUrl: `${this.api.defaults.baseURL}${url}`
    });
    const response = await this.api.post<T>(url, data, config);
    return response.data;
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.api.put<T>(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.api.delete<T>(url, config);
    return response.data;
  }

  async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.api.patch<T>(url, data, config);
    return response.data;
  }
}

export const apiService = new ApiService();
