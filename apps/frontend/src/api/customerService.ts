import apiClient from './apiClient';

// ==================== TYPES ====================

export interface CustomerQuote {
  id: string;
  userId: string;
  customerName: string;
  customerWhatsApp: string;
  items: CustomerQuoteItem[];
  total: number;
  status: 'PENDING' | 'ANALYZING' | 'QUOTED' | 'APPROVED' | 'REJECTED';
  observations?: string;
  createdAt: string;
  updatedAt: string;
  quotedAt?: string | null;
}

export interface CustomerQuoteItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  quotedPrice: number | null;
  observations?: string | null;
}

export interface CustomerOrder {
  id: string;
  status: 'PENDING' | 'CONFIRMED' | 'IN_PRODUCTION' | 'PREPARING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  quoteStatus?: string | null;
  hasProducts: boolean;
  hasServices: boolean;
  total: number;
  subtotal?: number;
  discountAmount?: number;
  paymentMethod?: string;
  items: CustomerOrderItem[];
  address?: any;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerOrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  type: 'product' | 'service';
}

export interface CustomerNotification {
  id: string;
  type: 'NEW_QUOTE_REQUEST' | 'QUOTE_RESPONDED' | 'QUOTE_APPROVED' | 'QUOTE_REJECTED' | 'ORDER_STATUS_UPDATED' | 'ORDER_CREATED';
  title: string;
  message: string;
  data?: any;
  read: boolean;
  readAt: string | null;
  createdAt: string;
  updatedAt: string;
}

// ==================== QUOTES ====================

/**
 * Get all quotes for the authenticated customer
 * @param status - Filter by status (optional)
 */
export async function getMyQuotes(status?: string): Promise<CustomerQuote[]> {
  const params = status && status !== 'all' ? { status } : {};
  const response = await apiClient.get('/customers/me/quotes', { params });
  return response.data;
}

/**
 * Get a specific quote by ID for the authenticated customer
 * @param id - Quote ID
 */
export async function getMyQuoteById(id: string): Promise<CustomerQuote> {
  const response = await apiClient.get(`/customers/me/quotes/${id}`);
  return response.data;
}

/**
 * Approve a quote (customer accepts the quoted prices)
 * @param id - Quote ID
 */
export async function approveQuote(id: string): Promise<{ id: string; status: string; orderStatus: string; message: string }> {
  const response = await apiClient.patch(`/customers/me/quotes/${id}/approve`);
  return response.data;
}

/**
 * Reject a quote (customer declines the quoted prices)
 * @param id - Quote ID
 */
export async function rejectQuote(id: string): Promise<{ id: string; status: string; message: string }> {
  const response = await apiClient.patch(`/customers/me/quotes/${id}/reject`);
  return response.data;
}

// ==================== ORDERS ====================

/**
 * Get all orders for the authenticated customer
 */
export async function getMyOrders(): Promise<CustomerOrder[]> {
  const response = await apiClient.get('/customers/me/orders');
  return response.data;
}

/**
 * Get a specific order by ID for the authenticated customer
 * @param id - Order ID
 */
export async function getMyOrderById(id: string): Promise<CustomerOrder> {
  const response = await apiClient.get(`/customers/me/orders/${id}`);
  return response.data;
}

// ==================== NOTIFICATIONS ====================

/**
 * Get all notifications for the authenticated customer
 */
export async function getMyNotifications(): Promise<CustomerNotification[]> {
  const response = await apiClient.get('/customers/me/notifications');
  return response.data;
}

/**
 * Get count of unread notifications for the authenticated customer
 */
export async function getUnreadNotificationCount(): Promise<number> {
  const response = await apiClient.get('/customers/me/notifications/unread-count');
  return response.data.count;
}

/**
 * Mark a specific notification as read
 * @param id - Notification ID
 */
export async function markNotificationAsRead(id: string): Promise<CustomerNotification> {
  const response = await apiClient.patch(`/customers/me/notifications/${id}/read`);
  return response.data;
}

/**
 * Mark all notifications as read for the authenticated customer
 */
export async function markAllNotificationsAsRead(): Promise<{ message: string; count: number }> {
  const response = await apiClient.patch('/customers/me/notifications/read-all');
  return response.data;
}

// ==================== DEFAULT EXPORT ====================

const customerService = {
  // Quotes
  getMyQuotes,
  getMyQuoteById,
  approveQuote,
  rejectQuote,

  // Orders
  getMyOrders,
  getMyOrderById,

  // Notifications
  getMyNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
};

export default customerService;
