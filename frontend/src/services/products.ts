// ========================================
// PRODUCTS SERVICE - MORIA FRONTEND
// Serviço de produtos usando API Client
// ========================================

import apiClient, { ApiResponse } from './api';

// Product types
export interface Product {
  id: number;
  name: string;
  description?: string;
  category: string;
  subcategory?: string;
  price: number;
  sale_price?: number;
  promo_price?: number;
  cost_price?: number;
  images?: string[];
  stock: number;
  min_stock: number;
  sku?: string;
  supplier?: string;
  is_active: boolean;
  rating?: number;
  rating_count?: number;
  specifications?: Record<string, any>;
  vehicle_compatibility?: string[];
  views_count: number;
  sales_count: number;
  created_at: string;
  updated_at: string;
}

export interface ProductFilters {
  category?: string;
  subcategory?: string;
  supplier?: string;
  min_price?: number;
  max_price?: number;
  search?: string;
  is_active?: boolean;
  on_sale?: boolean;
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface CreateProductData {
  name: string;
  description?: string;
  category: string;
  subcategory?: string;
  price: number;
  sale_price?: number;
  promo_price?: number;
  cost_price?: number;
  stock?: number;
  min_stock?: number;
  sku?: string;
  supplier?: string;
  image_url?: string;
  images?: string[];
  is_active?: boolean;
  specifications?: Record<string, any>;
  vehicle_compatibility?: string[];
}

export interface UpdateProductData extends Partial<CreateProductData> {
  id?: never; // ID não deve ser atualizado
}

export interface ProductStats {
  total_products: number;
  active_products: number;
  low_stock_products: number;
  out_of_stock_products: number;
  total_categories: number;
  average_price: number;
  top_categories: Array<{
    category: string;
    count: number;
  }>;
}

class ProductsService {
  private endpoint = 'products';

  // Get all products with filtering and pagination
  async getProducts(filters?: ProductFilters): Promise<ApiResponse<Product[]>> {
    return apiClient.get<Product[]>(this.endpoint, filters);
  }

  // Get single product by ID
  async getProduct(id: number): Promise<ApiResponse<Product>> {
    return apiClient.get<Product>(`${this.endpoint}/${id}`);
  }

  // Create new product (admin only)
  async createProduct(productData: CreateProductData): Promise<ApiResponse<Product>> {
    return apiClient.post<Product>(this.endpoint, productData);
  }

  // Update product (admin only)
  async updateProduct(id: number, productData: UpdateProductData): Promise<ApiResponse<Product>> {
    return apiClient.patch<Product>(`${this.endpoint}/${id}`, productData);
  }

  // Delete product (admin only)
  async deleteProduct(id: number): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`${this.endpoint}/${id}`);
  }

  // Get popular products
  async getPopularProducts(limit: number = 10): Promise<ApiResponse<Product[]>> {
    return apiClient.get<Product[]>(`${this.endpoint}/popular`, { limit });
  }

  // Get products on sale
  async getProductsOnSale(page: number = 1, limit: number = 10): Promise<ApiResponse<Product[]>> {
    return apiClient.get<Product[]>(`${this.endpoint}/on-sale`, { page, limit });
  }

  // Get products by category
  async getProductsByCategory(
    category: string,
    page: number = 1,
    limit: number = 10
  ): Promise<ApiResponse<Product[]>> {
    return apiClient.get<Product[]>(`${this.endpoint}/category/${encodeURIComponent(category)}`, {
      page,
      limit
    });
  }

  // Search products
  async searchProducts(
    query: string,
    page: number = 1,
    limit: number = 10
  ): Promise<ApiResponse<Product[]>> {
    return apiClient.get<Product[]>(`${this.endpoint}/search`, {
      q: query,
      page,
      limit
    });
  }

  // Get available categories
  async getCategories(): Promise<ApiResponse<string[]>> {
    return apiClient.get<string[]>(`${this.endpoint}/categories`);
  }

  // Get product statistics (admin only)
  async getProductStats(): Promise<ApiResponse<ProductStats>> {
    return apiClient.get<ProductStats>(`${this.endpoint}/admin/stats`);
  }

  // Update product stock (admin only)
  async updateStock(
    id: number,
    stock: number,
    operation: 'set' | 'add' | 'subtract' = 'set'
  ): Promise<ApiResponse<Product>> {
    return apiClient.put<Product>(`${this.endpoint}/${id}/stock`, {
      stock,
      operation
    });
  }

  // Favorites management
  async getFavorites(): Promise<ApiResponse<Product[]>> {
    return apiClient.get<Product[]>(`${this.endpoint}/favorites`);
  }

  async addToFavorites(productId: number): Promise<ApiResponse<void>> {
    return apiClient.post<void>(`${this.endpoint}/${productId}/favorite`);
  }

  async removeFromFavorites(productId: number): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`${this.endpoint}/${productId}/favorite`);
  }

  // Upload product image (admin only)
  async uploadProductImage(
    productId: number,
    imageFile: File,
    onProgress?: (progress: number) => void
  ): Promise<ApiResponse<{ image_url: string }>> {
    return apiClient.uploadFile<{ image_url: string }>(
      `${this.endpoint}/${productId}/image`,
      imageFile,
      { product_id: productId },
      onProgress
    );
  }

  // Bulk operations (admin only)
  async bulkUpdateProducts(
    productIds: number[],
    updateData: Partial<UpdateProductData>
  ): Promise<ApiResponse<{ updated_count: number }>> {
    return apiClient.post<{ updated_count: number }>(`${this.endpoint}/bulk-update`, {
      product_ids: productIds,
      update_data: updateData
    });
  }

  async bulkDeleteProducts(productIds: number[]): Promise<ApiResponse<{ deleted_count: number }>> {
    return apiClient.post<{ deleted_count: number }>(`${this.endpoint}/bulk-delete`, {
      product_ids: productIds
    });
  }

  // Export products data (admin only)
  async exportProducts(filters?: ProductFilters): Promise<ApiResponse<{ download_url: string }>> {
    return apiClient.get<{ download_url: string }>(`${this.endpoint}/export`, filters);
  }

  // Import products from file (admin only)
  async importProducts(
    csvFile: File,
    onProgress?: (progress: number) => void
  ): Promise<ApiResponse<{ imported_count: number; errors?: string[] }>> {
    return apiClient.uploadFile<{ imported_count: number; errors?: string[] }>(
      `${this.endpoint}/import`,
      csvFile,
      undefined,
      onProgress
    );
  }

  // Price history (if available)
  async getPriceHistory(productId: number): Promise<ApiResponse<Array<{
    date: string;
    price: number;
    sale_price?: number;
  }>>> {
    return apiClient.get<Array<{
      date: string;
      price: number;
      sale_price?: number;
    }>>(`${this.endpoint}/${productId}/price-history`);
  }

  // Similar products recommendation
  async getSimilarProducts(productId: number, limit: number = 5): Promise<ApiResponse<Product[]>> {
    return apiClient.get<Product[]>(`${this.endpoint}/${productId}/similar`, { limit });
  }

  // Product reviews (if implemented)
  async getProductReviews(
    productId: number,
    page: number = 1,
    limit: number = 10
  ): Promise<ApiResponse<Array<{
    id: number;
    user_name: string;
    rating: number;
    comment: string;
    created_at: string;
  }>>> {
    return apiClient.get(`${this.endpoint}/${productId}/reviews`, { page, limit });
  }

  async addProductReview(
    productId: number,
    rating: number,
    comment?: string
  ): Promise<ApiResponse<void>> {
    return apiClient.post<void>(`${this.endpoint}/${productId}/reviews`, {
      rating,
      comment
    });
  }
}

// Export singleton instance
export const productsService = new ProductsService();
export default productsService;