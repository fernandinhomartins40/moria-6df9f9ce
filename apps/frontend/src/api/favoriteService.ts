// src/api/favoriteService.ts
import apiClient from './apiClient';

export interface Favorite {
  id: string;
  customerId: string;
  productId: string;
  createdAt: string;
}

export interface FavoriteListResponse {
  favorites: Favorite[];
  totalCount: number;
  page: number;
  limit: number;
}

class FavoriteService {
  async getFavorites(params?: {
    page?: number;
    limit?: number;
  }): Promise<FavoriteListResponse> {
    const response = await apiClient.get<FavoriteListResponse>('/favorites', { params });
    return response.data;
  }

  async getFavoriteProductIds(): Promise<string[]> {
    const response = await apiClient.get<string[]>('/favorites/product-ids');
    return response.data;
  }

  async addToFavorites(productId: string): Promise<Favorite> {
    const response = await apiClient.post<Favorite>('/favorites', { productId });
    return response.data;
  }

  async removeFromFavorites(productId: string): Promise<void> {
    await apiClient.delete(`/favorites/product/${productId}`);
  }

  async removeFavoriteById(favoriteId: string): Promise<void> {
    await apiClient.delete(`/favorites/${favoriteId}`);
  }

  async isFavorite(productId: string): Promise<boolean> {
    try {
      const response = await apiClient.get(`/favorites/check/${productId}`);
      return response.data.isFavorite;
    } catch (error) {
      return false;
    }
  }

  async getFavoriteById(id: string): Promise<Favorite> {
    const response = await apiClient.get<Favorite>(`/favorites/${id}`);
    return response.data;
  }

  async getFavoriteCount(): Promise<number> {
    const response = await apiClient.get<{ count: number }>('/favorites/count');
    return response.data.count;
  }
}

export default new FavoriteService();