// services/prescriptionService.ts
import axios, { AxiosError } from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

interface PrescriptionData {
  patientId: string;
  doctorId: string;
  diagnosis: string;
  symptoms?: string;
  medications: Array<{
    drugName: string;
    dosage: string;
    frequency: string;
    duration: string;
    route: string;
    instructions?: string;
  }>;
  specialInstructions?: string;
  followUpDate?: string;
  notes?: string;
}

// services/prescriptionService.ts (Add delete and get functions if not already there)

export const deletePrescription = async (id: string) => {
  try {
    const response = await api.delete(`/prescription/${id}`);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'Failed to delete prescription');
    }
    throw error;
  }
};

// services/prescriptionService.ts - Add update function
export const updatePrescription = async (id: string, data: any) => {
  try {
    const response = await api.put(`/prescription/${id}`, data);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'Failed to update prescription');
    }
    throw error;
  }
};

export const getPrescriptions = async (page = 1, limit = 10) => {
  try {
    const response = await api.get(`/prescription?page=${page}&limit=${limit}`);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'Failed to fetch prescriptions');
    }
    throw error;
  }
};

export const createPrescription = async (data: PrescriptionData) => {
  try {
    const response = await api.post('/prescription', data);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'Failed to create prescription');
    }
    throw error;
  }
};

export const getPrescriptionById = async (id: string) => {
  try {
    const response = await api.get(`/prescription/${id}`);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'Failed to fetch prescription');
    }
    throw error;
  }
};