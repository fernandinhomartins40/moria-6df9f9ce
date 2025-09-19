// src/api/favoriteService.ts
import apiClient from './apiClient';

class FavoriteService {
  async getFavorites(): Promise<number[]> {
    const response = await apiClient.get<number[]>('/favorites');
    return response.data;
  }

  async addToFavorites(productId: number): Promise<void> {
    await apiClient.post('/favorites', { productId });
  }

  async removeFromFavorites(productId: number): Promise<void> {
    await apiClient.delete(`/favorites/${productId}`);
  }

  async isFavorite(productId: number): Promise<boolean> {
    try {
      await apiClient.get(`/favorites/${productId}`);
      return true;
    } catch (error) {
      return false;
    }
  }
}

export default new FavoriteService();