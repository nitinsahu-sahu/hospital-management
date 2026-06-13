export interface InvestigationItem {
  id: string;
  name: string;
  category: string;
  price: number;
  selected: boolean;
  code?: string
}

export interface PNDTOption {
  id: string;
  name: string;
  price: number;
  code: string;
}

export interface GynaeOption {
  id: string;
  name: string;
  price: number;
}

export interface PelvicSubOption {
  id: string;
  name: string;
  price: number;
  code: string;
}

export interface GeneticOption {
  id: string;
  name: string;
  price: number;
  code: string
}

export interface InvestigationData {
  patientId: string;
  consultationId: string;
  category: string;
  investigations: InvestigationItem[];
  totalAmount: number;
}