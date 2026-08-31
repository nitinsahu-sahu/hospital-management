// types/examination.ts

export interface SystemExamination {
  status: 'normal' | 'abnormal' | '';
  details: string;
}

export interface VitalsFormData {
  pr: string;
  prUnit: string;
  bp: string;
  bpUnit: string;
  height: string;
  heightUnit: string;
  weight: string;
  weightUnit: string;
  bmi: string;
  bmiUnit: string;
  abdominalExamination: string;
  localExamination: {
    perVaginalExamination: string;
    perSpeculumExamination: string;
  };
}

// Rubella Investigations Interface
export interface RubellaInvestigations {
  igg: string;
  igm: string;
  amh: string;
  avidityTest: string;
}

// HSG (Hysterosalpingography) Interface
export interface HSGInvestigations {
  year: string;
  finding: string;
}

// Investigations Interface
export interface Investigations {
  bloodGroup: string; // Select dropdown value
  hiv: string;
  tsh: string;
  hbsAg: string;
  rbs: string;
  hcv: string;
  prl: string;
  vdrl: string;
  sgot: string;
  dtah: string;
  sgpt: string;
  bun: string;
  srCreatinine: string;
  rubella: RubellaInvestigations;
  thalassemiaScreen: string;
  papTest: string;
  karyotype: string;
  hsg: HSGInvestigations;
  echocardiography: string;
}

// Medical History Interface
export interface MedicalHistory {
  problem: string;
  currentMedications: string;
}

// Surgical History Item Interface
export interface SurgicalHistoryItem {
  surgery: string;
  year: string;
  detailsFinding: string;
}

// Complete Examination Form Data Interface
export interface ExaminationFormData {
  patientExaminationDate: any;
  vitals: VitalsFormData;
  cns: SystemExamination;
  cvs: SystemExamination;
  respiratorySystem: SystemExamination;
  git: SystemExamination;
  investigations: Investigations;
  medicalHistory: MedicalHistory;
  surgicalHistory: SurgicalHistoryItem[];
}

// For API submission - Create Examination
export interface CreateExaminationData {
  patientId: string | undefined;
  vitals: VitalsFormData;
  cns: SystemExamination['status'];
  cnsDetails: string;
  cvs: SystemExamination['status'];
  cvsDetails: string;
  respiratorySystem: SystemExamination['status'];
  respiratorySystemDetails: string;
  git: SystemExamination['status'];
  gitDetails: string;
  investigations: Investigations;
  medicalHistory: MedicalHistory;
  surgicalHistory: SurgicalHistoryItem[];
}

// For API submission - Update Examination (all fields optional)
export interface UpdateExaminationData {
  patientExaminationDate?: any;
  vitals?: Partial<VitalsFormData>;
  cns?: SystemExamination['status'];
  cnsDetails?: string;
  cvs?: SystemExamination['status'];
  cvsDetails?: string;
  respiratorySystem?: SystemExamination['status'];
  respiratorySystemDetails?: string;
  git?: SystemExamination['status'];
  gitDetails?: string;
  investigations?: Partial<Investigations>;
  medicalHistory?: Partial<MedicalHistory>;
  surgicalHistory?: SurgicalHistoryItem[];
}

// Couple Examination Data Interface
export interface CoupleExaminationData {
  wife: ExaminationFormData;
  husband: ExaminationFormData;
}

// API Response Interface
export interface ExaminationResponse {
  _id: string;
  patientId: string;
  patientExaminationDate: string;
  vitals: VitalsFormData;
  cns: SystemExamination['status'];
  cnsDetails: string;
  cvs: SystemExamination['status'];
  cvsDetails: string;
  respiratorySystem: SystemExamination['status'];
  respiratorySystemDetails: string;
  git: SystemExamination['status'];
  gitDetails: string;
  investigations: Investigations;
  medicalHistory: MedicalHistory;
  surgicalHistory: SurgicalHistoryItem[];
  createdAt: string;
  updatedAt: string;
}

// Examination State Interface for Redux
export interface ExaminationState {
  examinations: ExaminationResponse[];
  currentExamination: ExaminationResponse | null;
  loading: boolean;
  error: string | null;
}

// Blood Group Options Type
export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';

// Blood Group Options Array
export const BLOOD_GROUPS: BloodGroup[] = [
  'A+',
  'A-',
  'B+',
  'B-',
  'AB+',
  'AB-',
  'O+',
  'O-'
];

// Helper function to get initial investigations
export const getInitialInvestigations = (): Investigations => ({
  bloodGroup: '',
  hiv: '',
  tsh: '',
  hbsAg: '',
  rbs: '',
  hcv: '',
  prl: '',
  vdrl: '',
  sgot: '',
  dtah: '',
  sgpt: '',
  bun: '',
  srCreatinine: '',
  rubella: {
    igg: '',
    igm: '',
    amh: '',
    avidityTest: '',
  },
  thalassemiaScreen: '',
  papTest: '',
  karyotype: '',
  hsg: {
    year: '',
    finding: '',
  },
  echocardiography: '',
});

// Helper function to get initial medical history
export const getInitialMedicalHistory = (): MedicalHistory => ({
  problem: '',
  currentMedications: '',
});

// Helper function to get initial surgical history
export const getInitialSurgicalHistory = (): SurgicalHistoryItem[] => [
  {
    surgery: '',
    year: '',
    detailsFinding: '',
  }
];

// Helper function to get initial vitals
export const getInitialVitals = (): VitalsFormData => ({
  pr: '',
  prUnit: 'bpm',
  bp: '',
  bpUnit: 'mmHg',
  height: '',
  heightUnit: 'cm',
  weight: '',
  weightUnit: 'kg',
  bmi: '',
  bmiUnit: 'kg/m²',
  abdominalExamination: '',
  localExamination: {
    perVaginalExamination: '',
    perSpeculumExamination: '',
  },
});

// Helper function to get initial system examination
export const getInitialSystemExamination = (): SystemExamination => ({
  status: '' as 'normal' | 'abnormal' | '',
  details: '',
});

// Helper function to get initial examination form
export const getInitialExaminationForm = (): ExaminationFormData => ({
  patientExaminationDate: new Date().toISOString().split('T')[0],
  vitals: getInitialVitals(),
  cns: getInitialSystemExamination(),
  cvs: getInitialSystemExamination(),
  respiratorySystem: getInitialSystemExamination(),
  git: getInitialSystemExamination(),
  investigations: getInitialInvestigations(),
  medicalHistory: getInitialMedicalHistory(),
  surgicalHistory: getInitialSurgicalHistory(),
});

// Validation function to check if form is valid
export const isExaminationFormValid = (formData: ExaminationFormData): boolean => {
  // Check required fields
  if (!formData.patientExaminationDate) return false;
  if (!formData.investigations.bloodGroup) return false;
  
  // Check if any required vitals are missing (optional, adjust as needed)
  // if (!formData.vitals.pr) return false;
  // if (!formData.vitals.bp) return false;
  
  return true;
};

// Utility function to get blood group display name
export const getBloodGroupDisplayName = (bloodGroup: string): string => {
  if (!bloodGroup) return 'Not Selected';
  return bloodGroup;
};

// Utility function to format examination date
export const formatExaminationDate = (date: string): string => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};