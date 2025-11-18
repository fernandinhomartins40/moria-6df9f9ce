// src/api/serviceService.ts
import apiClient from './apiClient';

export interface Service {
  id: string;
  name: string;
  description: string;
  category: string;
  estimatedTime: string;
  basePrice?: number;
  specifications?: Record<string, any>;
  isActive: boolean;
  status?: string;
  slug?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ServiceListResponse {
  services: Service[];
  totalCount: number;
  page: number;
  limit: number;
}

export interface CreateServiceDto {
  name: string;
  description: string;
  category: string;
  estimatedTime: string;
  basePrice?: number;
  specifications?: Record<string, any>;
  status?: string;
}

export interface UpdateServiceDto {
  name?: string;
  description?: string;
  category?: string;
  estimatedTime?: string;
  basePrice?: number;
  specifications?: Record<string, any>;
  status?: string;
}

class ServiceService {
  async getServices(params?: {
    page?: number;
    limit?: number;
    category?: string;
    search?: string;
    status?: string;
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

  async createService(data: CreateServiceDto): Promise<Service> {
    const response = await apiClient.post<Service>('/services', data);
    return response.data;
  }

  async updateService(id: string, data: UpdateServiceDto): Promise<Service> {
    const response = await apiClient.put<Service>(`/services/${id}`, data);
    return response.data;
  }

  async deleteService(id: string): Promise<void> {
    await apiClient.delete(`/services/${id}`);
  }

  async toggleServiceStatus(id: string, isActive: boolean): Promise<Service> {
    const status = isActive ? 'INACTIVE' : 'ACTIVE';
    const response = await apiClient.put<Service>(`/services/${id}`, { status });
    return response.data;
  }

  async getCategories(): Promise<{ category: string; count: number }[]> {
    const response = await apiClient.get<{ category: string; count: number }[]>('/services/categories/list');
    return response.data;
  }
}

export default new ServiceService();