// types/patient.ts
// types/patient.ts
export interface Patient {
  _id: string;
  patientId: string;
  UH_ID?: string;
  name: string;
  email?: string;
  gender?: string;
  sex?: string;
  sexDetails?:string;
  dateOfBirth?: string;
  age?: number;
  maritalStatus?: string;
  maritalStatusDetails?:string;
  infertiliyTypeDetails?:string;
  bloodGroup?: string;
  mobileNumber: string;
  relative?:any;

  pic: {
    url: string;
    alt: string;
  };
  city?: string;
  address?: string;
  department?: string;
  doctor?: string;
  type: "OPD" | "IPD";
  referredBy?: string;
  emergencyName?: string;
  emergencyMobile?: string;
  symptoms?: string;
  fee?: string;
  paymentMode: "Cash" | "UPI" | "Card";
  paymentStatus: "Paid" | "Pending";
  idProofType?: string;
  idProofTypeDetails?:string;
  idProofNumber?: string;
  infertiliyType?: string;
  howToFindClinic?: string;
  howToFindClinicDetails?:string;
  referredByDoctorName?: string;
  durationOfMarriage?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface PatientFormData {
  name: string;
  email: string;
  gender: string;
  dateOfBirth: string;
  maritalStatus: string;
  bloodGroup: string;
  mobileNumber: string;
  city: string;
  department: string;
  doctor: string;
  type: "OPD" | "IPD";
  referredBy: string;
  emergencyName: string;
  emergencyMobile: string;
  symptoms: string;
  fee: string;
  paymentMode: "Cash" | "UPI" | "Card";
  paymentStatus: "Paid" | "Pending";
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