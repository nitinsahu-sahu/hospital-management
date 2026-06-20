import { PNDTOption, GynaeOption, PelvicSubOption, GeneticOption } from '../types/investigation.types';

export const pndtOptions: PNDTOption[] = [
  { id: 'first_trimester', code: 'first_trimester', name: 'First Trimester TVS (6-10 weeks)', price: 1000 },
  { id: 'nt_nb_scan_single', code: 'nt_nb_scan_single', name: 'NT/NB Scan (Single) (11-13 weeks)', price: 1500 },
  { id: 'nt_nb_scan_twins', code: 'nt_nb_scan_twins', name: 'NT/NB Scan (Twins) (11-13 weeks)', price: 2000 },
  { id: 'nt_nb_scan_doppler_single', code: 'nt_nb_scan_doppler_single', name: 'NT/NB Scan With Doppler (Single)', price: 2000 },
  { id: 'nt_nb_scan_doppler_twins', code: 'nt_nb_scan_doppler_twins', name: 'NT/NB Scan With Doppler (Twins)', price: 2500 },
  { id: 'genetic_sonogram_single', code: 'genetic_sonogram_single', name: 'Genetic Sonogram (16 weeks) (Single)', price: 2000 },
  { id: 'genetic_sonogram_twins', code: 'genetic_sonogram_twins', name: 'Genetic Sonogram (16 weeks) (Twins)', price: 3000 },
  { id: 'anomaly_scan_single_only', code: 'anomaly_scan_single_only', name: 'Anomaly Scan (19-22 weeks) (Single Only)', price: 4000 }
];

export const gynaeOptions: GynaeOption[] = [
  { id: 'pelvic', name: 'PELVIC ULTRASOUND', price: 0 },
  { id: 'fm', name: 'FM (FOLLICULAR MONITORING)', price: 0 }
];

export const pelvicSubOptions: PelvicSubOption[] = [
  { id: 'trans_abdominal', code: "trans_abdominal", name: 'PELVIC ULTRASOUND (TRANS ABDOMINAL)', price: 800 },
  { id: 'tvs_viginal', code: "tvs_viginal", name: 'TRANS VAGINAL SCAN (TVS) BASIC', price: 1000 },
  { id: '3d_tvs', code: "3d_tvs", name: '3D TVS', price: 1500 },
  { id: 'infertility_d2_d3', code: "infertility_d2_d3", name: 'Infertility D2 D3 (TVS Scan)', price: 1500 },
  { id: 'follicular_monitoring', code: "follicular_monitoring", name: 'Follicular Monitoring (Ovulation Study)', price: 1500 }
];

export const geneticOptions: GeneticOption[] = [
  { id: 'T3295', code: "T3295", name: 'Comprehensive Non Invasive Prenatal Testing (NIPT-COMP)', price: 12000 },
  { id: 'T2112', code: "T2112", name: 'Focus Non invasive Prenatal Testing (NIPT-FOCUS)', price: 10000 },
  { id: 'T1511', code: "T1511", name: 'Karyotyping From Blood', price: 2200 },
  { id: 'T2008', code: "T2008", name: 'Karyotyping From Product of Conception (POC) by NGS', price: 8000 },
  { id: 'P901', code: "P901", name: 'Prenatal Microarray Combo MCC+QFPCR+CMA 315k', price: 16000 },
  { id: 'P902', code: "P902", name: 'Prenatal Microarray Combo MCC+QFPCR+CMA 750k', price: 25000 },
  { id: 'P904', code: "P904", name: 'Prenatal Rapid combo QFPCR+MCC', price: 5000 },
  { id: 'T2564', code: "T2564", name: 'beta Globin Gene Sequencing', price: 8000 },
  { id: 'T4794', code: "T4794", name: 'Orien Whole Exome Sequencing', price: 20000 },
  { id: 'T3434', code: "T3434", name: 'Aneuploidy Karyotyping', price: 7000 },
  { id: 'T9400', code: "T9400", name: 'Clinical Exom', price: 15000 },
  { id: 'T6345', code: "T6345", name: 'RH Genotyping Nipt', price: 16000 },
  { id: 'T1811', code: "T1811", name: 'Double Marker by Delfia-Smart report', price: 2000 },
  { id: 'P-901', code: "P-901", name: 'Prenatal Microarray Combo MCC+QFPCR+CMA 315k', price: 13000 },
  { id: 'T1892', code: "T1892", name: 'Double Marker with PIGF-Delfia', price: 3500 },
  { id: 'M1245', code: "M1245", name: 'Quadruple Marker - Delfia', price: 2500 },
  { id: 'G1452', code: "G1452", name: 'Double Marker - Prisca', price: 1600 },
  { id: 'G2180', code: "G2180", name: 'Quadruple Marker - Prisca', price: 2500 },
  { id: 'T4596', code: "T4596", name: 'Carrier Focus Exome + Orion Focus (Couple)', price: 30000 },
  { id: 'T2417+G2408', code: "T2417+G2408", name: 'LBC+HPV', price: 2000 },
];

export const routineOptions: GeneticOption[] = [
  { id: '3020', code: "3020", name: 'Vitamin B12 (CYANOCABALAMINE) Serum', price: 1350 },
  { id: '3301', code: "3301", name: 'Anti-CCP Antibodies Serum', price: 2250 },
  { id: '1100', code: "1100", name: 'Anti Nuclear Antibody, IFA, Serum', price: 1400 },
  { id: '9911M', code: "9911M", name: 'Torch IGG Evaluation, Serum', price: 1700 },
  { id: '3546', code: "3546", name: 'Prostate Specific Antigen, Serum', price: 1050 },
  { id: '8823', code: "8823", name: '25 - Hydroxyvitamin D (Vitamin D Total), Serum', price: 1225 },
  { id: '3244', code: "3244", name: 'Testosterone, Total, Serum', price: 850 },
  { id: '3195', code: "3195", name: 'Luteinizing Hormone (LM), Serum', price: 650 },
  { id: '3155', code: "3155", name: 'Estradoil (E2), Serum', price: 850 },
  { id: '3174', code: "3174", name: 'Follicle Stimulting Hormone (FSH), Serum', price: 650 },
  { id: '2021', code: "2021", name: 'LH, FSH, Prolactin, Serum', price: 1700 },
  { id: '1499', code: "1499", name: 'Thyroid Panel II (FT3, FT4, TSH), Serum', price: 1050 },
  { id: '3250', code: "3250", name: 'Tsh 3RD Generation Ultrasensitive, Serum', price: 380 },
  { id: '2434', code: "2434", name: 'TB PCR', price: 2250 },
  { id: '9901', code: "9901", name: 'Torch IGG & IGM ABS (EIA)', price: 3600 },
  { id: '1350', code: "1350", name: 'HLA-827, Flow Cytometry, Blood', price: 3300 },
  { id: '3184', code: "3184", name: 'HCG, Serum', price: 850 },
  { id: '9901M', code: "9901M", name: 'Torch IGG & IGM Evaluation, Serum', price: 3000 },
  { id: '1705R', code: "1705R", name: 'AMH / MIS, Serum', price: 2300 },
  { id: '1268O', code: "1268O", name: 'Double Marker (FMF Approved), Serum', price: 2750 },
  { id: 'TPC', code: "TPC", name: 'Thyroid Panel, Serum', price: 500 },
  { id: '1275P', code: "1275P", name: 'Second Trimester Quadruple Maker', price: 4200 },
  { id: '3834', code: "3834", name: 'Hemoglobin Variant Analysis - Blood', price: 1200 },
  { id: '1221T', code: "1221T", name: 'Indirect Coombs Test & antibody Titre', price: 1200 },
  { id: '1347H', code: "1347H", name: 'Alanine Aminotransferase (ALT / SGPT),Serum', price: 145 },
  { id: '1120', code: "1120", name: 'Coombs Test, Direct, EDTA Whole Blood', price: 375 },
  { id: '1320UH', code: "1320UH", name: 'Creatinine 24HRS Urine', price: 280 },
  // { id: '3834', code: "3834", name: 'Hemoglobin Variant Analysis - Blood', price: 1200 },
  // { id: '3834', code: "3834", name: 'Hemoglobin Variant Analysis - Blood', price: 1200 },
  // { id: '3834', code: "3834", name: 'Hemoglobin Variant Analysis - Blood', price: 1200 },
  // { id: '3834', code: "3834", name: 'Hemoglobin Variant Analysis - Blood', price: 1200 },

];