// src/api/authService.ts
import apiClient from './apiClient';
import type { Customer, RegisterRequest } from '@moria/types';

export type RegisterData = RegisterRequest;
export type { LoginRequest, LoginResponse, RegisterResponse } from '@moria/types';

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
    // Chamar endpoint de logout para limpar o cookie httpOnly
    await apiClient.post('/auth/logout');
  }

  async getProfile(): Promise<Customer> {
    const response = await apiClient.get<Customer>('/auth/profile');
    return response.data;
  }

  async updateProfile(data: Partial<Customer>): Promise<Customer> {
    const response = await apiClient.put<Customer>('/auth/profile', data);
    return response.data;
  }
}

export default new AuthService();