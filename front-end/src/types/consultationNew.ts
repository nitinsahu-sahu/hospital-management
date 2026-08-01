export interface ConsultationFees {
  freeOfCost: number;
  emergencyConsultationFee: number | string;
  geneticConsultationFee: number | string;
  opdConsultationFee: number | string;
  additionalFees: AdditionalFee[];
}

export interface AdditionalFee {
  name: string;
  amount: number;
  addedAt?: string;
}

export interface NewFee {
  name: string;
  amount: string;
}

export interface FormData {
  fees: ConsultationFees;
  totalAmount: number;
  consultationDate?: string;
  doctorNotes?: string;
  diagnosis?: string;
}

export interface SelectedPatient {
  _id: string;
  name: string;
  UH_ID: string;
  pic?: {
    url: string;
  };
  mobileNumber?: string;
  relative?:{
    _id?:string
  }
}

export interface Consultation {
  _id: string;
  patientId: SelectedPatient;
  consultationDate: string;
  doctorNotes: string;
  diagnosis: string;
  fees: ConsultationFees;
  totalAmount: number;
  status: 'pending' | 'completed' | 'cancelled';
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
  updatedBy?: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ConsultationStats {
  totalConsultations: number;
  totalAmount: number;
  averageAmount: number;
  lastConsultation: string | null;
}