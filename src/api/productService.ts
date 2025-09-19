// src/api/productService.ts
import apiClient from './apiClient';

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  image?: string;
  stock?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProductListResponse {
  products: Product[];
  totalCount: number;
  page: number;
  limit: number;
}

class ProductService {
  async getProducts(params?: {
    page?: number;
    limit?: number;
    category?: string;
    search?: string;
  }): Promise<ProductListResponse> {
    const response = await apiClient.get<ProductListResponse>('/products', { params });
    return response.data;
  }

  async getProductById(id: number): Promise<Product> {
    const response = await apiClient.get<Product>(`/products/${id}`);
    return response.data;
  }

  async getFeaturedProducts(limit?: number): Promise<Product[]> {
    const response = await apiClient.get<Product[]>('/products/featured', {
      params: { limit }
    });
    return response.data;
  }

  async searchProducts(query: string): Promise<Product[]> {
    const response = await apiClient.get<Product[]>('/products/search', {
      params: { q: query }
    });
    return response.data;
  }
}

export default new ProductService();