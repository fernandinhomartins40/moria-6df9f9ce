export interface VehicleLookupResponse {
  plate: string;
  brand: string;
  model: string;
  year: number;
  modelYear?: number;
  color?: string;
  chassisLastDigits?: string;
  municipality?: string;
  state?: string;
  fipeValue?: string;
  fipeCode?: string;
  stolen?: boolean;
  source: string;
}

export interface VehicleAPIProvider {
  name: string;
  priority: number;
  lookupByPlate(plate: string): Promise<VehicleLookupResponse>;
  isAvailable(): Promise<boolean>;
  getRemainingQuota?(): Promise<number | 'unlimited' | null>;
}

export interface APIStatus {
  name: string;
  status: 'available' | 'unavailable' | 'error';
  remainingQuota: number | 'unlimited' | null;
  priority: number;
}
