// services/patientService.ts
import axios, { AxiosError } from 'axios';
import { Patient, PatientFormData, ApiResponse, PaginatedResponse } from '../types/patient';

const API_BASE_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Error handling helper
const handleApiError = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiResponse<null>>;
    throw new Error(
      axiosError.response?.data?.message || 'Network Error'
    );
  }
  throw new Error('An unexpected error occurred');
};

// Create Patient
export const createPatient = async (patientData: PatientFormData): Promise<ApiResponse<Patient>> => {
  try {
    const response = await api.post<ApiResponse<Patient>>('/patient', patientData);
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

// Get All Patients
export const getPatients = async (
  page: number = 1, 
  limit: number = 10
): Promise<PaginatedResponse<Patient>> => {
  try {
    const response = await api.get<PaginatedResponse<Patient>>(
      `/patient?page=${page}&limit=${limit}`
    );
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

// Get All Patients
export const getRoleWise = async (
): Promise<PaginatedResponse<Patient>> => {
  try {
    const response = await api.get<PaginatedResponse<Patient>>(
      `/patient/role`
    );
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

// Get Single Patient
export const getPatientById = async (id: string): Promise<ApiResponse<Patient>> => {
  try {
    const response = await api.get<ApiResponse<Patient>>(`/patient/${id}`);
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

// Update Patient
export const updatePatient = async (
  id: string, 
  patientData: Partial<PatientFormData>
): Promise<ApiResponse<Patient>> => {
  try {
    const response = await api.put<ApiResponse<Patient>>(`/patient/${id}`, patientData);
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

// Delete Patient
export const deletePatient = async (id: string): Promise<ApiResponse<null>> => {
  try {
    const response = await api.delete<ApiResponse<null>>(`/patient/${id}`);
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};