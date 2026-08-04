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

export interface ExaminationFormData {
  patientExaminationDate:any;
  vitals: VitalsFormData;
  cns: SystemExamination;
  cvs: SystemExamination;
  respiratorySystem: SystemExamination;
  git: SystemExamination;
}

export interface CoupleExaminationData {
  wife: ExaminationFormData;
  husband: ExaminationFormData;
}