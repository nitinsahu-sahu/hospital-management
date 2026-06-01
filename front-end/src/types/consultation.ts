export interface AdditionalFee {
  name: string;
  amount: number;
  // addedAt:string;
}

export interface ConsultationFees {
  freeOfCost: number;
  emergencyConsultationFee: number | string;
  geneticConsultationFee: number | string;
  opdConsultationFee: number | string;
  additionalFees: AdditionalFee[];
}

export interface FormData {
  fees: ConsultationFees;
  totalAmount: number;
}

export interface NewFee {
  name: string;
  amount: number | string;
}

export interface SelectedPatient {
  _id: string;
  name: string;
  UH_ID: string;
  pic?: {
    url: string;
  };
  mobileNumber?: string;
}