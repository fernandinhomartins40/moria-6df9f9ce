// src/hooks/useFavorites.ts
import { useState, useEffect } from 'react';
import { favoriteService, handleApiError } from '@/api';

interface UseFavoritesResult {
  favorites: number[];
  loading: boolean;
  error: string | null;
  fetchFavorites: () => Promise<void>;
  addToFavorites: (productId: number) => Promise<boolean>;
  removeFromFavorites: (productId: number) => Promise<boolean>;
  isFavorite: (productId: number) => boolean;
}

export const useFavorites = (): UseFavoritesResult => {
  const [favorites, setFavorites] = useState<number[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFavorites = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const favoriteIds = await favoriteService.getFavorites();
      setFavorites(favoriteIds);
    } catch (err) {
      const apiError = handleApiError(err);
      setError(apiError.message);
    } finally {
      setLoading(false);
    }
  };

  const addToFavorites = async (productId: number): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      await favoriteService.addToFavorites(productId);
      setFavorites(prev => [...prev, productId]);
      return true;
    } catch (err) {
      const apiError = handleApiError(err);
      setError(apiError.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const removeFromFavorites = async (productId: number): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      await favoriteService.removeFromFavorites(productId);
      setFavorites(prev => prev.filter(id => id !== productId));
      return true;
    } catch (err) {
      const apiError = handleApiError(err);
      setError(apiError.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const isFavorite = (productId: number): boolean => {
    return favorites.includes(productId);
  };

  return {
    favorites,
    loading,
    error,
    fetchFavorites,
    addToFavorites,
    removeFromFavorites,
    isFavorite,
  };
};