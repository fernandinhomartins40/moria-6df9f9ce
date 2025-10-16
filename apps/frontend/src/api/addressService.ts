// src/api/addressService.ts
import apiClient from './apiClient';
import { Address } from '@/contexts/AuthContext';

class AddressService {
  async getAddresses(): Promise<Address[]> {
    const response = await apiClient.get<Address[]>('/addresses');
    return response.data;
  }

  async getAddressById(id: string): Promise<Address> {
    const response = await apiClient.get<Address>(`/addresses/${id}`);
    return response.data;
  }

  async createAddress(data: Omit<Address, 'id'>): Promise<Address> {
    const response = await apiClient.post<Address>('/addresses', data);
    return response.data;
  }

  async updateAddress(id: string, data: Partial<Address>): Promise<Address> {
    const response = await apiClient.put<Address>(`/addresses/${id}`, data);
    return response.data;
  }

  async deleteAddress(id: string): Promise<void> {
    await apiClient.delete(`/addresses/${id}`);
  }

  async setDefaultAddress(addressId: string): Promise<Address> {
    const response = await apiClient.patch<Address>(`/addresses/${addressId}/default`);
    return response.data;
  }
}

export default new AddressService();