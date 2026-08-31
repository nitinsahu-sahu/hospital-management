export interface InvestigationItem {
  _id: string;
  name: string;
  category: string;
  price: number;
  selected: boolean;
  code?: string
}

export interface GeneticOption {
  _id: string;
  name: string;
  price: number;
  code: string
}

export interface PNDTOption {
  _id: string;
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
  category:string;
  _id: string;
  name: string;
  price: number;
  code: string;
}



export interface InvestigationData {
  patientId: string;
  category: string;
  investigations: InvestigationItem[];
  totalAmount: number;
}