export interface HistoryOfIllness {
  onset: string;
  duration: string;
  associatedSymptoms: string;
}

export interface DurationItem {
  number: string;
  unit: string;
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
  patientHistoryDate:any,
  chiefComplaints: string;
  chiefComplaintsDetails?: string;
  lmp?: string;
  sb_iod_dead?: string;
  // amenorrhoea: string;
  // complaint: string;
  onset: string;
  duration: DurationItem[];
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

  husbandDiabetes: 'yes' | 'no' | '',
  husbandHypertension: 'yes' | 'no' | '',
  husbandAsthma: 'yes' | 'no' | '',
  husbandThyroid: 'yes' | 'no' | '',
  husbandDrugAllergy: 'yes' | 'no' | '',
  husbandDrugAllergyDetails: string,
  husbandGeneticDiseaseSelf: 'yes' | 'no' | '',
  husbandGeneticDiseaseFamily: 'yes' | 'no' | '',
  husbandDownSyndrome: 'yes' | 'no' | '',
  husbandSmoking: 'yes' | 'no' | '',
  husbandDrugAddiction: 'yes' | 'no' | '',
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