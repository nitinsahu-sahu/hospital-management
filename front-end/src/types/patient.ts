// types/patient.ts
export interface PatientFormData {
  name: string;
  email: string;
  gender: string;
  dateOfBirth: string;
  maritalStatus: string;
  bloodGroup: string;
  mobileNumber: string;
  address: string;
  durationOfMarriage:string;
  city: string;
  sex: string;
  department: string;
  doctor: string;
  type: "OPD" | "IPD";
  referredBy: string;
  emergencyName: string;
  emergencyMobile: string;
  symptoms: string;
  fee: number | string;
  age: number | string;
  paymentMode: "Cash" | "UPI" | "Card";
  paymentStatus: "Paid" | "Pending";
}

export interface Patient extends PatientFormData {
  _id: string;
  patientId: string;
  doctorId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    totalRecords: number;
    currentPage: number;
    totalPages: number;
    limit: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}