export interface HistoryOfIllness {
  onset: string;
  duration: string;
  associatedSymptoms: string;
}

export interface MenstrualHistory {
  cycleLength: string;
  daysOfFlow: string;
  associatedSymptoms: string;
}

export interface ObstetricHistory {
  gravida: string;
  para: string;
  living: string;
  abortion: string;
  ectopic: string;
}

export interface WifeMedicalHistory {
  diabetes: 'yes' | 'no' | '';
  hypertension: 'yes' | 'no' | '';
  asthma: 'yes' | 'no' | '';
  thyroid: 'yes' | 'no' | '';
  drugAllergy: 'yes' | 'no' | '';
  drugAllergyDetails: string;
  geneticDiseaseSelf: 'yes' | 'no' | '';
  geneticDiseaseFamily: 'yes' | 'no' | '';
  downSyndrome: 'yes' | 'no' | '';
  smoking: 'yes' | 'no' | '';
  drugAddiction: 'yes' | 'no' | '';
}

export interface HusbandHistory {
  clinicalHistory: string;
}

export interface PatientHistoryForm {
  chiefComplaints: string;
  amenorrhoea: string;
  complaint: string;
  onset: string;
  duration: string;
  associatedSymptoms: string;
  cycleLength: string;
  daysOfFlow: string;
  menstrualSymptoms: string;
  gravida: string;
  para: string;
  living: string;
  abortion: string;
  ectopic: string;
  diabetes: 'yes' | 'no' | '';
  hypertension: 'yes' | 'no' | '';
  asthma: 'yes' | 'no' | '';
  thyroid: 'yes' | 'no' | '';
  drugAllergy: 'yes' | 'no' | '';
  drugAllergyDetails: string;
  geneticDiseaseSelf: 'yes' | 'no' | '';
  geneticDiseaseFamily: 'yes' | 'no' | '';
  downSyndrome: 'yes' | 'no' | '';
  smoking: 'yes' | 'no' | '';
  drugAddiction: 'yes' | 'no' | '';
  husbandClinicalHistory: string;
}

export interface PatientHistoryPayload {
  patientId: string;
  consultationId?: string;
  chiefComplaints: string;
  amenorrhoea: string;
  complaint: string;
  historyOfIllness: HistoryOfIllness;
  menstrualHistory: MenstrualHistory;
  obstetricHistory: ObstetricHistory;
  wifeMedicalHistory: WifeMedicalHistory;
  husbandHistory: HusbandHistory;
}

export interface Patient {
  _id: string;
  [key: string]: any;
}