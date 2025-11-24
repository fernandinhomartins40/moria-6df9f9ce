import apiClient from './apiClient';

export interface CustomerVehicle {
  id: string;
  customerId: string;
  brand: string;
  model: string;
  year: number;
  plate: string;
  color: string;
  mileage: number | null;
  chassisNumber: string | null;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

class VehicleService {
  /**
   * Get all vehicles for authenticated customer
   */
  async getVehicles(): Promise<CustomerVehicle[]> {
    const response = await apiClient.get('/customer-vehicles');
    return response.data.data;
  }

  /**
   * Get vehicle by ID
   */
  async getVehicleById(id: string): Promise<CustomerVehicle> {
    const response = await apiClient.get(`/customer-vehicles/${id}`);
    return response.data.data;
  }

  /**
   * Get vehicles by customer ID (Admin)
   */
  async getVehiclesByCustomer(customerId: string): Promise<CustomerVehicle[]> {
    const response = await apiClient.get(`/admin/customers/${customerId}/vehicles`);
    return response.data.data;
  }

  /**
   * Create new vehicle
   */
  async createVehicle(data: {
    brand: string;
    model: string;
    year: number;
    plate: string;
    color: string;
    mileage?: number;
    chassisNumber?: string;
  }): Promise<CustomerVehicle> {
    const response = await apiClient.post('/customer-vehicles', data);
    return response.data.data;
  }

  /**
   * Update vehicle
   */
  async updateVehicle(
    id: string,
    data: {
      brand?: string;
      model?: string;
      year?: number;
      plate?: string;
      color?: string;
      mileage?: number;
      chassisNumber?: string;
    }
  ): Promise<CustomerVehicle> {
    const response = await apiClient.put(`/customer-vehicles/${id}`, data);
    return response.data.data;
  }

  /**
   * Get archived vehicles for authenticated customer
   */
  async getArchivedVehicles(): Promise<CustomerVehicle[]> {
    const response = await apiClient.get('/customer-vehicles/archived');
    return response.data.data;
  }

  /**
   * Soft delete vehicle (archive)
   */
  async deleteVehicle(id: string): Promise<void> {
    await apiClient.delete(`/customer-vehicles/${id}`);
  }

  /**
   * Restore archived vehicle
   */
  async restoreVehicle(id: string): Promise<CustomerVehicle> {
    const response = await apiClient.post(`/customer-vehicles/${id}/restore`);
    return response.data.data;
  }

  /**
   * Permanently delete vehicle
   */
  async permanentlyDeleteVehicle(id: string): Promise<void> {
    await apiClient.delete(`/customer-vehicles/${id}/permanent`);
  }
}

export default new VehicleService();
