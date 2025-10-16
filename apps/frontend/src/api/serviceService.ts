// src/api/serviceService.ts
import apiClient from './apiClient';

export interface Service {
  id: string;
  name: string;
  description: string;
  category: string;
  estimatedTime: string;
  basePrice?: number;
  specifications?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ServiceListResponse {
  services: Service[];
  totalCount: number;
  page: number;
  limit: number;
}

class ServiceService {
  async getServices(params?: {
    page?: number;
    limit?: number;
    category?: string;
    search?: string;
  }): Promise<ServiceListResponse> {
    const response = await apiClient.get<ServiceListResponse>('/services', { params });
    return response.data;
  }

  async getServiceById(id: string): Promise<Service> {
    const response = await apiClient.get<Service>(`/services/${id}`);
    return response.data;
  }

  async getFeaturedServices(limit?: number): Promise<Service[]> {
    const response = await apiClient.get<Service[]>('/services/featured', {
      params: { limit }
    });
    return response.data;
  }

  async searchServices(query: string): Promise<Service[]> {
    const response = await apiClient.get<Service[]>('/services/search', {
      params: { q: query }
    });
    return response.data;
  }
}

export default new ServiceService();