import { PNDTOption, GynaeOption, PelvicSubOption, GeneticOption } from '../types/investigation.types';

export const pndtOptions: PNDTOption[] = [
  { id: 'first_trimester', name: 'First Trimester TVS (6-10 weeks)', price: 1000 },
  { id: 'nt_nb_scan_single', name: 'NT/NB Scan (Single) (11-13 weeks)', price: 1500 },
  { id: 'nt_nb_scan_twins', name: 'NT/NB Scan (Twins) (11-13 weeks)', price: 2000 },
  { id: 'nt_nb_scan_doppler_single', name: 'NT/NB Scan With Doppler (Single)', price: 2000 },
  { id: 'nt_nb_scan_doppler_twins', name: 'NT/NB Scan With Doppler (Twins)', price: 2500 },
  { id: 'genetic_sonogram_single', name: 'Genetic Sonogram (16 weeks) (Single)', price: 2000 },
  { id: 'genetic_sonogram_twins', name: 'Genetic Sonogram (16 weeks) (Twins)', price: 3000 },
  { id: 'anomaly_scan_single_only', name: 'Anomaly Scan (19-22 weeks) (Single Only)', price: 4000 }
];

export const gynaeOptions: GynaeOption[] = [
  { id: 'pelvic', name: 'PELVIC ULTRASOUND', price: 0 },
  { id: 'fm', name: 'FM (FOLLICULAR MONITORING)', price: 0 }
];

export const pelvicSubOptions: PelvicSubOption[] = [
  { id: 'trans_abdominal', name: 'PELVIC ULTRASOUND (TRANS ABDOMINAL)', price: 800 },
  { id: 'tvs_viginal', name: 'TRANS VAGINAL SCAN (TVS) BASIC', price: 1000 },
  { id: '3d_tvs', name: '3D TVS', price: 1500 },
  { id: 'infertility_d2_d3', name: 'Infertility D2 D3 (TVS Scan)', price: 1500 },
  { id: 'follicular_monitoring', name: 'Follicular Monitoring (Ovulation Study)', price: 1500 }
];

export const geneticOptions: GeneticOption[] = [
  { id: 'T3295', code: "T3295", name: 'Comprehensive Non Invasive Prenatal Testing (NIPT-COMP)', price: 12000 },
  { id: 'T2112', code: "T2112", name: 'Focus Non invasive Prenatal Testing (NIPT-FOCUS)', price: 10000 },
  { id: 'T1511', code: "T1511", name: 'Karyotyping From Blood', price: 2200 },
  { id: 'T2008', code: "T2008", name: 'Karyotyping From Product of Conception (POC) by NGS', price: 8000 },
  { id: 'P901', code: "P901", name: 'Prenatal Microarray Combo mcc+ QFPCR+ CMA 315k', price: 16000 }
];

export const routineOptions: GeneticOption[] = [
  { id: '3020', code: "3020", name: 'Vitamin B12 (CYANOCABALAMINE) Serum', price: 1350 },
  { id: '3301', code: "3301", name: 'Anti-CCP Antibodies Serum', price: 2250 },
  { id: '1100', code: "1100", name: 'Anti Nuclear Antibody, IFA, Serum', price: 1400 },
  { id: '9911M', code: "9911M", name: 'Torch IGG Evaluation, Serum', price: 1700 },
  { id: '3546', code: "3546", name: 'Prostate Specific Antigen, Serum', price: 1050 }
];