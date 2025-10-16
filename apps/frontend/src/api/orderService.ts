// src/api/orderService.ts
import apiClient from './apiClient';
import { Order, OrderItem } from '@/contexts/AuthContext';

export interface CreateOrderRequest {
  items: Omit<OrderItem, 'id'>[];
  addressId: string;
  paymentMethod: string;
  couponCode?: string;
}

export interface OrderListResponse {
  orders: Order[];
  totalCount: number;
  page: number;
  limit: number;
}

class OrderService {
  async createOrder(data: CreateOrderRequest): Promise<Order> {
    const response = await apiClient.post<Order>('/orders', data);
    return response.data;
  }

  async getOrders(params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<OrderListResponse> {
    const response = await apiClient.get<OrderListResponse>('/orders', { params });
    return response.data;
  }

  async getOrderById(id: string): Promise<Order> {
    const response = await apiClient.get<Order>(`/orders/${id}`);
    return response.data;
  }

  async updateOrderStatus(orderId: string, status: string): Promise<Order> {
    const response = await apiClient.patch<Order>(`/orders/${orderId}/status`, { status });
    return response.data;
  }

  async cancelOrder(orderId: string): Promise<Order> {
    const response = await apiClient.patch<Order>(`/orders/${orderId}/cancel`);
    return response.data;
  }

  async getOrderTracking(orderId: string): Promise<any> {
    const response = await apiClient.get<any>(`/orders/${orderId}/tracking`);
    return response.data;
  }
}

export default new OrderService();