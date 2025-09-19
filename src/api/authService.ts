// src/api/authService.ts
import apiClient from './apiClient';
import { Customer, RegisterData } from '@/contexts/AuthContext';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  customer: Customer;
}

export interface RegisterResponse {
  token: string;
  customer: Customer;
}

class AuthService {
  async login(data: LoginRequest): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>('/auth/login', data);
    return response.data;
  }

  async register(data: RegisterData): Promise<RegisterResponse> {
    const response = await apiClient.post<RegisterResponse>('/auth/register', data);
    return response.data;
  }

  async logout(): Promise<void> {
    // Limpar token do localStorage
    localStorage.removeItem('authToken');
  }

  async getProfile(): Promise<Customer> {
    const response = await apiClient.get<Customer>('/auth/profile');
    return response.data;
  }

  async updateProfile(data: Partial<Customer>): Promise<Customer> {
    const response = await apiClient.put<Customer>('/auth/profile', data);
    return response.data;
  }

  setAuthToken(token: string): void {
    localStorage.setItem('authToken', token);
  }

  getAuthToken(): string | null {
    return localStorage.getItem('authToken');
  }

  removeAuthToken(): void {
    localStorage.removeItem('authToken');
  }
}

export default new AuthService();