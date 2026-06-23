const Discharge = require('../models/Discharge');
const User = require('../models/User');
const PatientHistory = require('../models/PatientHistory');
const Consultation = require('../models/Cosultation');
const Investigation = require('../models/Investigation');
const BloodInvestigation = require('../models/BloodInvestigation');
const GeneticInvestigation = require('../models/GeneticInvestigation');
const Procedure = require('../models/Procedure');
const Prescription = require('../models/Prescription');
const PatientExamination = require('../models/PatientExamination');
const Relative = require('../models/Relative');
const RelativeExamination = require('../models/RelativeExamination');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// Helper function to get doctor details
const getDoctorDetails = async () => {
  try {
    const doctor = await User.findOne({ role: 'doctor', isActive: true })
      .select('-password -__v');
    return doctor;
  } catch (error) {
    console.error('Error fetching doctor details:', error);
    return null;
  }
};

// Helper function to get all discharge data
const getDischargeData = async (patientId) => {
  try {
    const [
      patient,
      doctor,
      consultation,
      patientHistory,
      patientExamination,
      investigations,
      bloodInvestigations,
      geneticInvestigations,
      procedures,
      prescriptions,
      relativeExaminations
    ] = await Promise.all([
      User.findById(patientId).select('-password -__v'),
      getDoctorDetails(),
      Consultation.findOne({ patientId }),
      PatientHistory.findOne({ patientId }),
      PatientExamination.findOne({ patientId }),
      Investigation.findOne({ patientId }),
      BloodInvestigation.findOne({ patientId }),
      GeneticInvestigation.findOne({ patientId }),
      Procedure.findOne({ patientId }),
      Prescription.findOne({ patientId }).sort({ createdAt: -1 }),
      RelativeExamination.findOne({ patientId })
    ]);

    // Get discharge record if exists
    const dischargeRecord = await Discharge.findOne({ patientId });
    const relative = await Relative.findOne({ UH_ID: patient?.UH_ID });

    return {
      patient,
      doctor,
      consultation,
      patientHistory,
      patientExamination,
      investigations,
      bloodInvestigations,
      geneticInvestigations,
      procedures,
      prescriptions,
      relative,
      relativeExaminations,
      dischargeRecord
    };
  } catch (error) {
    console.error('Error fetching discharge data:', error);
    throw error;
  }
};

const formatExamValue = (value, details) => {
  if (!value) return null;
  if (value.toLowerCase() === 'normal' && !details) {
    return 'Normal';
  }
  if (value.toLowerCase() === 'normal' && details) {
    return `Normal (${details})`;
  }
  if (details) {
    return `${value} (${details})`;
  }
  return value;
};

const generateDischargePDF = async (data, res) => {

  const colors = {
    primary: '#1a5276',
    secondary: '#2e86c1',
    accent: '#1abc9c',
    lightBg: '#ebf5fb',
    border: '#aed6f1',
    text: '#2c3e50',
    lightText: '#5d6d7e',
    highlight: '#d4efdf',
    white: '#ffffff'
  };

  const doc = new PDFDocument({
    size: 'A4',
    margin: 14,  // Reduced from 18
    bufferPages: true
  });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=discharge_summary_${data.patient?.UH_ID || 'patient'}.pdf`);

  doc.pipe(res);

  // ===== HEADER ===== (slightly shorter)
  doc.rect(0, 0, doc.page.width, 45).fill(colors.primary);  // Reduced from 55
  doc.rect(0, 45, doc.page.width, 1.5).fill(colors.accent); // Reduced from 2

  doc.fillColor(colors.white)
    .fontSize(11) // Reduced from 13
    .font('Helvetica-Bold')
    .text('Women Fetal Care Clinic', 18, 8, { align: 'center' }); // Reduced from 10

  doc.fontSize(6) // Reduced from 7
    .font('Helvetica')
    .text('IVF & Infertility Specialist', { align: 'center' });

  if (data.doctor) {
    doc.fontSize(5.5) // Reduced from 6
      .text(`Dr. ${data.doctor.name} | ${data.doctor.qualification || ''} | Reg. No: ${data.doctor.registrationNumber || 'N/A'}`, { align: 'center' });
  }

  doc.fillColor(colors.text);

  // Title - compact
  const titleY = doc.y + 1; // Reduced from 2
  doc.rect(18, titleY - 2, doc.page.width - 36, 13) // Reduced height from 16 to 13
    .fill(colors.lightBg)
    .stroke(colors.border);

  doc.fillColor(colors.primary)
    .fontSize(9) // Reduced from 10
    .font('Helvetica-Bold')
    .text('DISCHARGE SUMMARY', 18, titleY, { align: 'center' });

  doc.moveDown(1.2); // Reduced from 2

  // ===== PATIENT DEMOGRAPHICS =====
  doc.fillColor(colors.primary)
    .fontSize(9) // Reduced from 10
    .font('Helvetica-Bold')
    .text('Patient Demographics', 18, doc.y);

  doc.strokeColor(colors.border)
    .lineWidth(0.4) // Reduced from 0.5
    .moveTo(18, doc.y + 1.5) // Reduced from 2
    .lineTo(doc.page.width - 18, doc.y + 1.5)
    .stroke();

  doc.fillColor(colors.text)
    .fontSize(7.5) // Reduced from 8
    .font('Helvetica');

  let yPos = doc.y + 6; // Reduced from 8

  const getPatientField = (field, detailsField) => {
    if (field === 'other' && detailsField) {
      return `Other (${detailsField})`;
    }
    return field || 'N/A';
  };

  const col1 = 22;
  const col2 = doc.page.width / 3 + 10;
  const col3 = (doc.page.width / 3) * 2 + 20;

  // Row 1
  doc.fillColor(colors.lightText)
    .text('Name:', col1, yPos, { continued: true })
    .fillColor(colors.text)
    .text(` ${data.patient?.name || 'N/A'}`);

  doc.fillColor(colors.lightText)
    .text('UHID:', col2, yPos, { continued: true })
    .fillColor(colors.text)
    .text(` ${data.patient?.UH_ID || 'N/A'}`);

  doc.fillColor(colors.lightText)
    .text('Age:', col3, yPos, { continued: true })
    .fillColor(colors.text)
    .text(` ${data.patient?.age ? `${data.patient.age} yrs` : 'N/A'}`);
  yPos += 8; // Reduced from 10

  // Row 2
  doc.fillColor(colors.lightText)
    .text('Sex:', col1, yPos, { continued: true })
    .fillColor(colors.text)
    .text(` ${getPatientField(data.patient?.sex, data.patient?.sexDetails)}`);

  doc.fillColor(colors.lightText)
    .text('Marital:', col2, yPos, { continued: true })
    .fillColor(colors.text)
    .text(` ${getPatientField(data.patient?.maritalStatus, data.patient?.maritalStatusDetails)}`);

  doc.fillColor(colors.lightText)
    .text('Marriage Duration:', col3, yPos, { continued: true })
    .fillColor(colors.text)
    .text(` ${data.patient?.durationOfMarriage ? `${data.patient.durationOfMarriage} yrs` : 'N/A'}`);
  yPos += 8;

  // Row 3
  doc.fillColor(colors.lightText)
    .text('Mobile:', col1, yPos, { continued: true })
    .fillColor(colors.text)
    .text(` ${data.patient?.mobileNumber || 'N/A'}`);

  const regDate = data.patient?.createdAt ? new Date(data.patient.createdAt).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }) : 'N/A';
  doc.fillColor(colors.lightText)
    .text('Reg. Date:', col2, yPos, { continued: true })
    .fillColor(colors.text)
    .text(` ${regDate}`);

  doc.fillColor(colors.lightText)
    .text('Address:', col3, yPos, { continued: true })
    .fillColor(colors.text)
    .text(` ${data.patient?.address?.substring(0, 20) || 'N/A'}`);
  yPos += 8;

  // Row 4
  doc.fillColor(colors.lightText)
    .text('ID Proof:', col1, yPos, { continued: true })
    .fillColor(colors.text)
    .text(` ${getPatientField(data.patient?.idProofType, data.patient?.idProofTypeDetails)}`);

  doc.fillColor(colors.lightText)
    .text('ID Number:', col2, yPos, { continued: true })
    .fillColor(colors.text)
    .text(` ${data.patient?.idProofNumber || 'N/A'}`);

  doc.fillColor(colors.lightText)
    .text('How Found:', col3, yPos, { continued: true })
    .fillColor(colors.text)
    .text(` ${getPatientField(data.patient?.howToFindClinic, data.patient?.howToFindClinicDetails)}`);
  yPos += 8;

  // Row 5
  doc.fillColor(colors.lightText)
    .text('Referred By:', col1, yPos, { continued: true })
    .fillColor(colors.text)
    .text(` ${data.patient?.referredByDoctorName || 'N/A'}`);

  doc.fillColor(colors.lightText)
    .text('Infertility:', col2, yPos, { continued: true })
    .fillColor(colors.text)
    .text(` ${getPatientField(data.patient?.infertiliyType, data.patient?.infertiliyTypeDetails)}`);
  yPos += 8;

  // ===== HUSBAND DETAILS ===== (compact)
  if (data.relative) {
    yPos += 2; // Reduced from 4
    doc.fillColor(colors.primary)
      .fontSize(9)
      .font('Helvetica-Bold')
      .text('Husband/Relative:', 18, yPos)
      .font('Helvetica')
      .fontSize(7.5);
    yPos += 5; // Reduced from 6

    const relative = data.relative;
    let idProofText = '';
    if (relative.idProofType === 'other' && relative.idProofTypeDetails) {
      idProofText = `${relative.idProofTypeDetails}: ${relative.idProofNumber || 'N/A'}`;
    } else if (relative.idProofType) {
      const idType = relative.idProofType.charAt(0).toUpperCase() + relative.idProofType.slice(1);
      idProofText = `${idType}: ${relative.idProofNumber || 'N/A'}`;
    } else {
      idProofText = 'ID: N/A';
    }

    const relText = `Name: ${relative.name || 'N/A'} | Age: ${relative.age || 'N/A'} yrs | Mobile: ${relative.mobileNumber || 'N/A'} | ${idProofText}`;
    doc.fillColor(colors.text)
      .fontSize(7.5)
      .text(`  ${relText}`, 18, yPos + 6, { width: doc.page.width - 36 });
    yPos += 15; // Reduced from 18
  }

  // ===== CONSULTATION FEES ===== (compact)
  if (data.consultation?.fees) {
    yPos += 2; // Reduced from 4
    const fees = data.consultation.fees;
    doc.fillColor(colors.primary)
      .fontSize(9)
      .font('Helvetica-Bold')
      .text('Consultation Fees:', 18, yPos)
      .font('Helvetica')
    yPos += 12; // Reduced from 15

    const tableX = 22;
    const col1Width = 25;
    const col2Width = 150;
    const col3Width = 100;

    doc.rect(tableX, yPos - 1.5, doc.page.width - 44, 10) // Reduced height from 12 to 10
      .fill(colors.lightBg)
      .stroke(colors.border);

    doc.fillColor(colors.primary)
      .fontSize(8) // Reduced from 9
      .font('Helvetica-Bold')
      .text('#', tableX + 5, yPos, { width: 20, align: 'center' })
      .text('Fee Type', tableX + 30, yPos)
      .text('Amount (₹)', doc.page.width - 80, yPos, { align: 'center' });

    yPos += 10; // Reduced from 12

    doc.fillColor(colors.text)
      .fontSize(7.5) // Reduced from 8
      .font('Helvetica');

    const feeItems = [];
    if (fees.opdConsultationFee && fees.opdConsultationFee > 0) {
      feeItems.push({ label: 'OPD Consultation', amount: fees.opdConsultationFee });
    }
    if (fees.emergencyConsultationFee && fees.emergencyConsultationFee > 0) {
      feeItems.push({ label: 'Emergency Consultation', amount: fees.emergencyConsultationFee });
    }
    if (fees.geneticConsultationFee && fees.geneticConsultationFee > 0) {
      feeItems.push({ label: 'Genetic Consultation', amount: fees.geneticConsultationFee });
    }
    if (fees.additionalFees && fees.additionalFees.length > 0) {
      fees.additionalFees.forEach(additionalFee => {
        feeItems.push({
          label: `Additional: ${additionalFee.name || 'N/A'}`,
          amount: additionalFee.amount || 0
        });
      });
    }
    if (fees.freeOfCost && fees.freeOfCost > 0) {
      feeItems.push({ label: 'Free of Cost', amount: fees.freeOfCost });
    }

    feeItems.forEach((item, idx) => {
      if (idx % 2 === 0) {
        doc.rect(tableX, yPos - 0.5, doc.page.width - 44, 8.5) // Reduced from 10
          .fill(colors.white)
          .stroke(colors.border);
      } else {
        doc.rect(tableX, yPos - 0.5, doc.page.width - 44, 8.5)
          .fill('#f8f9fa')
          .stroke(colors.border);
      }

      doc.fillColor(colors.text)
        .fontSize(7.5)
        .text(`${idx + 1}`, tableX + 5, yPos, { width: 20, align: 'center' })
        .text(item.label, tableX + 30, yPos)
        .text(`₹${item.amount}`, doc.page.width - 80, yPos, { align: 'center' });

      yPos += 8.5; // Reduced from 10
    });

    if (feeItems.length === 0) {
      doc.rect(tableX, yPos - 0.5, doc.page.width - 44, 8.5)
        .fill(colors.white)
        .stroke(colors.border);
      doc.fillColor(colors.lightText)
        .fontSize(7.5)
        .text('No fees recorded', tableX + 30, yPos);
      yPos += 8.5;
    }

    doc.strokeColor(colors.border)
      .lineWidth(0.4)
      .moveTo(tableX, yPos)
      .lineTo(doc.page.width - 22, yPos)
      .stroke();

    yPos += 3; // Reduced from 4

    const totalAmount = feeItems.reduce((sum, item) => sum + item.amount, 0);
    doc.rect(tableX, yPos - 1.5, doc.page.width - 44, 10) // Reduced from 12
      .fill(colors.highlight)
      .stroke(colors.border);

    doc.fillColor(colors.primary)
      .fontSize(8) // Reduced from 9
      .font('Helvetica-Bold')
      .text('Total', tableX + 30, yPos)
      .text(`₹${totalAmount}`, doc.page.width - 80, yPos, { align: 'center' });

    yPos += 12; // Reduced from 14
  }

  // ===== CLINICAL HISTORY ===== (compact)
  if (data.patientHistory) {
    yPos += 2; // Reduced from 4

    const history = data.patientHistory;

    doc.fillColor(colors.primary)
      .fontSize(9)
      .font('Helvetica-Bold')
      .text('Clinical History:', 18, yPos)
      .font('Helvetica')
      .fontSize(7.5);
    yPos += 12; // Reduced from 15

    if (history.chiefComplaints) {
      const complaintText = history.chiefComplaints.replace(/_/g, ' ').toUpperCase();
      doc.fillColor(colors.lightText)
        .text('Chief:', 25, yPos, { continued: true })
        .fillColor(colors.text)
        .text(` ${complaintText}${history.chiefComplaintsDetails ? ` - ${history.chiefComplaintsDetails}` : ''}`);
      yPos += 7; // Reduced from 9
    }

    if (history.menstrualHistory) {
      const menstrual = history.menstrualHistory;
      let menstrualText = '';
      if (menstrual.lmp) {
        const lmpDate = new Date(menstrual.lmp).toLocaleDateString('en-IN', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        });
        menstrualText += `LMP: ${lmpDate} | `;
      }
      menstrualText += `Cycle: ${menstrual.cycleLength || 'N/A'} days | Flow: ${menstrual.daysOfFlow || 'N/A'} days`;
      if (menstrual.associatedSymptoms) {
        menstrualText += ` | Symptoms: ${menstrual.associatedSymptoms.substring(0, 30)}${menstrual.associatedSymptoms.length > 30 ? '...' : ''}`;
      }
      doc.fillColor(colors.lightText)
        .text('Menstrual:', 25, yPos, { continued: true })
        .fillColor(colors.text)
        .text(` ${menstrualText}`);
      yPos += 7;
    }

    if (history.obstetricHistory) {
      const obst = history.obstetricHistory;
      const obstParts = [];
      if (obst.gravida) obstParts.push(`G:${obst.gravida}`);
      if (obst.para) obstParts.push(`P:${obst.para}`);
      if (obst.living) obstParts.push(`L:${obst.living}`);
      if (obst.abortion) obstParts.push(`A:${obst.abortion}`);
      if (obst.sb_iod_dead) obstParts.push(`SB:${obst.sb_iod_dead}`);
      if (obst.ectopic) obstParts.push(`Ect:${obst.ectopic}`);

      if (obstParts.length > 0) {
        doc.fillColor(colors.lightText)
          .text('Obstetric:', 25, yPos, { continued: true })
          .fillColor(colors.text)
          .text(` ${obstParts.join(' | ')}`);
        yPos += 7;
      }
    }

    if (history.wifeMedicalHistory) {
      const wifeMed = history.wifeMedicalHistory;
      const wifeParts = [];
      if (wifeMed.diabetes && wifeMed.diabetes !== 'no') wifeParts.push(`DM:${wifeMed.diabetes}`);
      if (wifeMed.hypertension && wifeMed.hypertension !== 'no') wifeParts.push(`HTN:${wifeMed.hypertension}`);
      if (wifeMed.thyroid && wifeMed.thyroid !== 'no') wifeParts.push(`Thyroid:${wifeMed.thyroid}`);
      if (wifeMed.drugAllergy && wifeMed.drugAllergy !== 'no') {
        wifeParts.push(`Allergy:${wifeMed.drugAllergy}${wifeMed.drugAllergyDetails ? `(${wifeMed.drugAllergyDetails})` : ''}`);
      }

      if (wifeParts.length > 0) {
        doc.fillColor(colors.lightText)
          .text('Wife Med:', 25, yPos, { continued: true })
          .fillColor(colors.text)
          .text(` ${wifeParts.join(' | ')}`);
        yPos += 7;
      }
    }

    if (history.husbandMedicalHistory) {
      const husbandMed = history.husbandMedicalHistory;
      const husbandParts = [];
      if (husbandMed.diabetes && husbandMed.diabetes !== 'no') husbandParts.push(`DM:${husbandMed.diabetes}`);
      if (husbandMed.hypertension && husbandMed.hypertension !== 'no') husbandParts.push(`HTN:${husbandMed.hypertension}`);
      if (husbandMed.thyroid && husbandMed.thyroid !== 'no') husbandParts.push(`Thyroid:${husbandMed.thyroid}`);
      if (husbandMed.drugAllergy && husbandMed.drugAllergy !== 'no') {
        husbandParts.push(`Allergy:${husbandMed.drugAllergy}${husbandMed.drugAllergyDetails ? `(${husbandMed.drugAllergyDetails})` : ''}`);
      }
      if (husbandMed.smoking && husbandMed.smoking !== 'no') husbandParts.push(`Smoking:${husbandMed.smoking}`);

      if (husbandParts.length > 0) {
        doc.fillColor(colors.lightText)
          .text('Husband Med:', 25, yPos, { continued: true })
          .fillColor(colors.text)
          .text(` ${husbandParts.join(' | ')}`, 22, yPos, {
            width: doc.page.width - 40
          });
        yPos += 7;
      }
    }
  }

  // ===== EXAMINATION FINDINGS ===== (compact)
  const formatExamValue = (value, details) => {
    if (!value) return null;
    if (value.toLowerCase() === 'normal' && !details) return 'Normal';
    if (value.toLowerCase() === 'normal' && details) return `Normal (${details})`;
    if (details) return `${value} (${details})`;
    return value;
  };

  if (data.patientExamination) {
    yPos += 2;

    const exam = data.patientExamination;
    const vitals = exam.vitals || {};

    doc.fillColor(colors.primary)
      .fontSize(9)
      .font('Helvetica-Bold')
      .text('Patient Examination:', 18, yPos)
      .font('Helvetica')
      .fontSize(7.5);
    yPos += 12;

    let vitalsText = '';
    if (vitals.bp) vitalsText += `BP: ${vitals.bp}${vitals.bpUnit ? ` ${vitals.bpUnit}` : ''} | `;
    if (vitals.pr) vitalsText += `PR: ${vitals.pr}${vitals.prUnit ? ` ${vitals.prUnit}` : ''} | `;
    if (vitals.height) vitalsText += `Ht: ${vitals.height}${vitals.heightUnit ? ` ${vitals.heightUnit}` : ''} | `;
    if (vitals.weight) vitalsText += `Wt: ${vitals.weight}${vitals.weightUnit ? ` ${vitals.weightUnit}` : ''}`;
    if (vitals.bmi) vitalsText += ` | BMI: ${vitals.bmi}${vitals.bmiUnit ? ` ${vitals.bmiUnit}` : ''}`;

    if (vitalsText) {
      doc.fillColor(colors.text)
        .fontSize(7.5)
        .text(`${vitalsText}`, 24, yPos, { width: doc.page.width - 36 });
      yPos += 8; // Reduced from 10
    }

    if (vitals.abdominalExamination) {
      doc.fillColor(colors.lightText)
        .text('  Abdomen:', 18, yPos, { continued: true })
        .fillColor(colors.text)
        .text(` ${vitals.abdominalExamination}`);
      yPos += 7;
    }

    if (vitals.localExamination) {
      if (vitals.localExamination.perVaginalExamination) {
        doc.fillColor(colors.lightText)
          .text('  Per Vaginal:', 18, yPos, { continued: true })
          .fillColor(colors.text)
          .text(` ${vitals.localExamination.perVaginalExamination}`);
        yPos += 7;
      }
      if (vitals.localExamination.perSpeculumExamination) {
        doc.fillColor(colors.lightText)
          .text('  Per Speculum:', 18, yPos, { continued: true })
          .fillColor(colors.text)
          .text(` ${vitals.localExamination.perSpeculumExamination}`);
        yPos += 7;
      }
    }

    const systems = [
      { label: 'CNS', value: exam.cns, details: exam.cnsDetails },
      { label: 'CVS', value: exam.cvs, details: exam.cvsDetails },
      { label: 'RS', value: exam.respiratorySystem, details: exam.respiratorySystemDetails },
      { label: 'GIT', value: exam.git, details: exam.gitDetails },
    ];

    const sysText = systems
      .filter(s => s.value)
      .map(s => {
        const formatted = formatExamValue(s.value, s.details);
        return `${s.label}: ${formatted}`;
      })
      .join(' | ');

    if (sysText) {
      doc.fillColor(colors.text)
        .text(`  ${sysText}`, 18, yPos, { width: doc.page.width - 36 });
      yPos += 7;
    }

    yPos += 1; // Reduced from 2
  }

  if (data.relativeExaminations) {
    yPos += 2;
    const relExam = data.relativeExaminations;
    const relVitals = relExam.vitals || {};

    doc.fillColor(colors.primary)
      .fontSize(9)
      .font('Helvetica-Bold')
      .text('Relative Examination:', 18, yPos)
      .font('Helvetica')
      .fontSize(7.5);
    yPos += 12;

    let relVitalsText = '';
    if (relVitals.bp) relVitalsText += `BP: ${relVitals.bp}${relVitals.bpUnit ? ` ${relVitals.bpUnit}` : ''} | `;
    if (relVitals.pr) relVitalsText += `PR: ${relVitals.pr}${relVitals.prUnit ? ` ${relVitals.prUnit}` : ''} | `;
    if (relVitals.height) relVitalsText += `Ht: ${relVitals.height}${relVitals.heightUnit ? ` ${relVitals.heightUnit}` : ''} | `;
    if (relVitals.weight) relVitalsText += `Wt: ${relVitals.weight}${relVitals.weightUnit ? ` ${relVitals.weightUnit}` : ''}`;
    if (relVitals.bmi) relVitalsText += ` | BMI: ${relVitals.bmi}${relVitals.bmiUnit ? ` ${relVitals.bmiUnit}` : ''}`;

    if (relVitalsText) {
      doc.fillColor(colors.text)
        .fontSize(7.5)
        .text(`  ${relVitalsText}`, 18, yPos, { width: doc.page.width - 36 });
      yPos += 7; // Reduced from 8
    }

    if (relVitals.abdominalExamination) {
      doc.fillColor(colors.lightText)
        .fontSize(7.5)
        .text('  Abdomen:', 18, yPos, { continued: true })
        .fillColor(colors.text)
        .text(` ${relVitals.abdominalExamination}`);
      yPos += 7; // Reduced from 8
    }

    const relSystems = [
      { label: 'CNS', value: relExam.cns, details: relExam.cnsDetails },
      { label: 'CVS', value: relExam.cvs, details: relExam.cvsDetails },
      { label: 'RS', value: relExam.respiratorySystem, details: relExam.respiratorySystemDetails },
      { label: 'GIT', value: relExam.git, details: relExam.gitDetails },
    ];

    const relSysText = relSystems
      .filter(s => s.value)
      .map(s => {
        const formatted = formatExamValue(s.value, s.details);
        return `${s.label}: ${formatted}`;
      })
      .join(' | ');

    if (relSysText) {
      doc.fillColor(colors.text)
        .fontSize(7.5)
        .text(`  ${relSysText}`, 18, yPos, { width: doc.page.width - 36 });
      yPos += 6; // Reduced from 7
    }

    yPos += 1; // Reduced from 2
  }

  // ===== INVESTIGATIONS ===== (compact)
  const hasInvestigations = data.investigations || data.bloodInvestigations || data.geneticInvestigations;

  if (hasInvestigations) {
    yPos += 2;

    doc.fillColor(colors.primary)
      .fontSize(9)
      .font('Helvetica-Bold')
      .text('Investigations:', 18, yPos)
      .font('Helvetica')
      .fontSize(7.5);
    yPos += 12;

    const renderInvestigationTable = (title, investigationsData, items) => {
      if (!items || items.length === 0) return;

      doc.fillColor(colors.secondary)
        .fontSize(9)
        .font('Helvetica-Bold')
        .text(`  ${title}:`, 18, yPos)
        .font('Helvetica')
        .fontSize(7.5);
      yPos += 12;

      const tableX = 28;
      const col1 = 28;
      const col2 = 40;
      const col3 = 380;

      doc.rect(tableX, yPos - 1.5, doc.page.width - 50, 9) // Reduced from 10
        .fill(colors.lightBg)
        .stroke(colors.border);

      doc.fillColor(colors.primary)
        .fontSize(8) // Reduced from 9
        .font('Helvetica-Bold')
        .text('#', col1, yPos, { width: 12, align: 'center' })
        .text('Test Name', col2, yPos)
        .text('Amount (₹)', col3, yPos, { align: 'center' });

      yPos += 9; // Reduced from 10

      doc.fillColor(colors.text)
        .fontSize(7.5)
        .font('Helvetica');

      items.forEach((item, idx) => {
        if (idx % 2 === 0) {
          doc.rect(tableX, yPos - 0.5, doc.page.width - 50, 8) // Reduced from 9
            .fill(colors.white)
            .stroke(colors.border);
        } else {
          doc.rect(tableX, yPos - 0.5, doc.page.width - 50, 8)
            .fill('#f8f9fa')
            .stroke(colors.border);
        }

        let testName = item.name || 'N/A';
        if (testName.length > 45) {
          testName = testName.substring(0, 42) + '...';
        }

        doc.fillColor(colors.text)
          .fontSize(7.5)
          .text(`${idx + 1}`, col1, yPos, { width: 12, align: 'center' })
          .text(testName, col2, yPos, { width: 335 })
          .text(`₹${item.price || 0}`, col3, yPos, { align: 'center' });

        yPos += 8; // Reduced from 9
      });

      doc.strokeColor(colors.border)
        .lineWidth(0.4)
        .moveTo(tableX, yPos)
        .lineTo(doc.page.width - 22, yPos)
        .stroke();

      yPos += 3; // Reduced from 4
    };

    if (data.investigations?.investigations?.length > 0) {
      renderInvestigationTable('PNDT / Obstetric Ultrasound', data.investigations, data.investigations.investigations);
    }

    if (data.bloodInvestigations?.investigations?.length > 0) {
      renderInvestigationTable('Blood Investigations', data.bloodInvestigations, data.bloodInvestigations.investigations);
    }

    if (data.geneticInvestigations?.investigations?.length > 0) {
      renderInvestigationTable('Genetic Investigations', data.geneticInvestigations, data.geneticInvestigations.investigations);
    }

    yPos += 1;
  }

  // ===== PROCEDURES ===== (compact)
  if (data.procedures?.procedures?.length > 0) {
    yPos += 2;

    doc.fillColor(colors.primary)
      .fontSize(9)
      .font('Helvetica-Bold')
      .text('Procedures:', 18, yPos)
      .font('Helvetica')
      .fontSize(7.5);
    yPos += 12;

    const tableX = 22;
    const col1 = 22;
    const col2 = 40;
    const col3 = 320;
    const col4 = 390;

    doc.rect(tableX, yPos - 1.5, doc.page.width - 44, 10) // Reduced from 12
      .fill(colors.lightBg)
      .stroke(colors.border);

    doc.fillColor(colors.primary)
      .fontSize(8) // Reduced from 9
      .font('Helvetica-Bold')
      .text('#', col1, yPos, { width: 18, align: 'center' })
      .text('Procedure Name', col2, yPos)
      .text('Category', col3, yPos)
      .text('Amount (₹)', col4, yPos, { align: 'center' });

    yPos += 10; // Reduced from 12

    doc.fillColor(colors.text)
      .fontSize(7.5)
      .font('Helvetica');

    const procedures = data.procedures.procedures;
    procedures.forEach((proc, idx) => {
      if (idx % 2 === 0) {
        doc.rect(tableX, yPos - 0.5, doc.page.width - 44, 8.5) // Reduced from 10
          .fill(colors.white)
          .stroke(colors.border);
      } else {
        doc.rect(tableX, yPos - 0.5, doc.page.width - 44, 8.5)
          .fill('#f8f9fa')
          .stroke(colors.border);
      }

      let procName = proc.name || 'N/A';
      if (procName.length > 38) {
        procName = procName.substring(0, 35) + '...';
      }

      let category = proc.category || 'N/A';
      if (proc.subType) {
        category = `${category} (${proc.subType})`;
      }
      category = category.charAt(0).toUpperCase() + category.slice(1);

      doc.fillColor(colors.text)
        .fontSize(7.5)
        .text(`${idx + 1}`, col1, yPos, { width: 18, align: 'center' })
        .text(procName, col2, yPos, { width: 275 })
        .text(category, col3, yPos, { width: 70 })
        .text(`₹${proc.price || 0}`, col4, yPos, { align: 'center' });

      yPos += 8.5; // Reduced from 10
    });

    doc.strokeColor(colors.border)
      .lineWidth(0.4)
      .moveTo(tableX, yPos)
      .lineTo(doc.page.width - 22, yPos)
      .stroke();

    yPos += 3; // Reduced from 4

    if (data.procedures.totalAmount) {
      doc.rect(tableX, yPos - 1.5, doc.page.width - 44, 10) // Reduced from 12
        .fill(colors.highlight)
        .stroke(colors.border);

      doc.fillColor(colors.primary)
        .fontSize(8) // Reduced from 9
        .font('Helvetica-Bold')
        .text('Total', col2, yPos)
        .text(`₹${data.procedures.totalAmount}`, col4, yPos, { align: 'center' });

      yPos += 12; // Reduced from 14
    }

    if (data.procedures.notes) {
      doc.fillColor(colors.lightText)
        .fontSize(5) // Reduced from 5.5
        .font('Helvetica')
        .text(`  Notes: ${data.procedures.notes}`, 18, yPos, { width: doc.page.width - 36 });
      yPos += 6; // Reduced from 8
    }

    yPos += 1;
  }

  // ===== DISCHARGE RECORD ===== (compact)
  if (data.dischargeRecord) {
    yPos += 2;

    const discharge = data.dischargeRecord;

    doc.fillColor(colors.primary)
      .fontSize(9)
      .font('Helvetica-Bold')
      .text('Discharge:', 18, yPos)
      .font('Helvetica')
      .fontSize(7.5);
    yPos += 12;

    if (discharge.finalDiagnosis) {
      doc.fillColor(colors.lightText)
        .fontSize(7.5)
        .text('  Dx:', 18, yPos, { continued: true })
        .fillColor(colors.text)
        .text(` ${discharge.finalDiagnosis.substring(0, 65)}${discharge.finalDiagnosis.length > 65 ? '...' : ''}`);
      yPos += 6; // Reduced from 7
    }

    if (discharge.treatmentSummary) {
      doc.fillColor(colors.lightText)
        .fontSize(7.5)
        .text('  Tx:', 18, yPos, { continued: true })
        .fillColor(colors.text)
        .text(` ${discharge.treatmentSummary.substring(0, 65)}${discharge.treatmentSummary.length > 65 ? '...' : ''}`);
      yPos += 6; // Reduced from 8
    }

    if (discharge.dischargeAdvice) {
      doc.fillColor(colors.lightText)
        .fontSize(7.5)
        .text('  Advice:', 18, yPos, { continued: true })
        .fillColor(colors.text)
        .text(` ${discharge.dischargeAdvice.substring(0, 65)}${discharge.dischargeAdvice.length > 65 ? '...' : ''}`);
      yPos += 6; // Reduced from 8
    }

    if (discharge.followUpDate) {
      const followUp = new Date(discharge.followUpDate).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
      doc.fillColor(colors.lightText)
        .fontSize(7.5)
        .text('  Discharge Date:', 18, yPos, { continued: true })
        .fillColor(colors.text)
        .text(` ${followUp}`);

      yPos += 6; // Reduced from 8
    }
  }

  // ===== PRESCRIPTIONS ===== (compact)
  if (data.prescriptions?.medications?.length > 0) {
    yPos += 4; // Reduced from 8

    doc.fillColor(colors.primary)
      .fontSize(9)
      .font('Helvetica-Bold')
      .text('Medications:', 18, yPos)
      .font('Helvetica')
      .fontSize(7.5);
    yPos += 12;

    const tableX = 22;
    const col1 = 22;
    const col2 = 40;
    const col3 = 210;
    const col4 = 270;
    const col5 = 380;
    const col6 = 440;

    doc.rect(tableX, yPos - 1.5, doc.page.width - 44, 10) // Reduced from 12
      .fill(colors.lightBg)
      .stroke(colors.border);

    doc.fillColor(colors.primary)
      .fontSize(8) // Reduced from 9
      .font('Helvetica-Bold')
      .text('#', col1, yPos, { width: 18, align: 'center' })
      .text('Drug Name', col2, yPos)
      .text('Dosage', col3, yPos)
      .text('Frequency', col4, yPos)
      .text('Duration', col5, yPos)
      .text('Route', col6, yPos);

    yPos += 10; // Reduced from 12

    doc.fillColor(colors.text)
      .fontSize(7.5)
      .font('Helvetica');

    const meds = data.prescriptions.medications;
    meds.forEach((med, idx) => {
      if (idx % 2 === 0) {
        doc.rect(tableX, yPos - 0.5, doc.page.width - 44, 8.5) // Reduced from 10
          .fill(colors.white)
          .stroke(colors.border);
      } else {
        doc.rect(tableX, yPos - 0.5, doc.page.width - 44, 8.5)
          .fill('#f8f9fa')
          .stroke(colors.border);
      }

      let drugName = med.drugName || 'N/A';
      if (drugName.length > 28) {
        drugName = drugName.substring(0, 25) + '...';
      }

      doc.fillColor(colors.text)
        .fontSize(7.5)
        .text(`${idx + 1}`, col1, yPos, { width: 18, align: 'center' })
        .text(drugName, col2, yPos, { width: 165 })
        .text(med.dosage || 'N/A', col3, yPos)
        .text(med.frequency || 'N/A', col4, yPos, { width: 105 })
        .text(med.duration ? `${med.duration} days` : 'N/A', col5, yPos)
        .text(med.route || 'N/A', col6, yPos, { width: 80 });

      yPos += 8.5; // Reduced from 10
    });

    doc.strokeColor(colors.border)
      .lineWidth(0.4)
      .moveTo(tableX, yPos)
      .lineTo(doc.page.width - 22, yPos)
      .stroke();

    yPos += 6; // Reduced from 8

    if (data.prescriptions.specialInstructions) {
      doc.fillColor(colors.primary)
        .fontSize(9)
        .font('Helvetica-Bold')
        .text('⚠ Special Instructions:', 18, yPos);
      yPos += 12;

      const instrText = data.prescriptions.specialInstructions;
      const instrWidth = doc.page.width - 65;
      const textHeight = doc.heightOfString(instrText, {
        width: instrWidth,
        align: 'left',
        fontSize: 7.5
      });

      const padding = 3; // Reduced from 4
      const boxHeight = textHeight + (padding * 2);

      doc.rect(23, yPos - 1.5, doc.page.width - 46, boxHeight + 3) // Reduced padding
        .fill(colors.highlight)
        .stroke(colors.border);

      doc.fillColor(colors.text)
        .fontSize(7.5)
        .font('Helvetica')
        .text(instrText, 33, yPos + padding - 0.5, {
          width: instrWidth,
          align: 'left'
        });

      yPos += boxHeight + 4; // Reduced from 6
    }
  }

  // ===== GRAND TOTAL ===== (compact)
  let grandTotal = 0;
  const totalItems = [];

  if (data.consultation?.fees) {
    const fees = data.consultation.fees;
    let consultationTotal = 0;
    if (fees.opdConsultationFee) consultationTotal += fees.opdConsultationFee;
    if (fees.emergencyConsultationFee) consultationTotal += fees.emergencyConsultationFee;
    if (fees.geneticConsultationFee) consultationTotal += fees.geneticConsultationFee;
    if (fees.additionalFees) {
      fees.additionalFees.forEach(f => consultationTotal += (f.amount || 0));
    }
    if (fees.freeOfCost) consultationTotal += fees.freeOfCost;
    if (consultationTotal > 0) {
      totalItems.push({ label: 'Consultation Fees', amount: consultationTotal });
      grandTotal += consultationTotal;
    }
  }

  if (data.investigations?.totalAmount) {
    totalItems.push({ label: 'PNDT Investigations', amount: data.investigations.totalAmount });
    grandTotal += data.investigations.totalAmount;
  }
  if (data.bloodInvestigations?.totalAmount) {
    totalItems.push({ label: 'Blood Investigations', amount: data.bloodInvestigations.totalAmount });
    grandTotal += data.bloodInvestigations.totalAmount;
  }
  if (data.geneticInvestigations?.totalAmount) {
    totalItems.push({ label: 'Genetic Investigations', amount: data.geneticInvestigations.totalAmount });
    grandTotal += data.geneticInvestigations.totalAmount;
  }
  if (data.procedures?.totalAmount) {
    totalItems.push({ label: 'Procedures', amount: data.procedures.totalAmount });
    grandTotal += data.procedures.totalAmount;
  }

  if (totalItems.length > 0) {
    doc.fillColor(colors.primary)
      .fontSize(9)
      .font('Helvetica-Bold')
      .text('Total Summary:', 18, yPos)
      .font('Helvetica')
      .fontSize(7.5);
    yPos += 10; // Reduced from 8

    const tableX = 22;
    const col1 = 22;
    const col2 = 50;
    const col3 = 120;

    doc.rect(tableX, yPos - 1.5, doc.page.width - 44, 9) // Reduced from 10
      .fill(colors.lightBg)
      .stroke(colors.border);

    doc.fillColor(colors.primary)
      .fontSize(9) // Reduced from 6.5
      .font('Helvetica-Bold')
      .text('S.No', col1, yPos, { width: 20, align: 'center' })
      .text('Category', col2, yPos)
      .text('Amount (₹)', doc.page.width - 70, yPos, { align: 'center' });

    yPos += 9; // Reduced from 10

    doc.fillColor(colors.text)
      .fontSize(6) // Reduced from 6.5
      .font('Helvetica');

    totalItems.forEach((item, idx) => {
      if (idx % 2 === 0) {
        doc.rect(tableX, yPos - 0.5, doc.page.width - 44, 8) // Reduced from 9
          .fill(colors.white)
          .stroke(colors.border);
      } else {
        doc.rect(tableX, yPos - 0.5, doc.page.width - 44, 8)
          .fill('#f8f9fa')
          .stroke(colors.border);
      }

      doc.fillColor(colors.text)
        .fontSize(8)
        .text(`${idx + 1}`, col1, yPos, { width: 20, align: 'center' })
        .text(item.label, col2, yPos, { width: 65 })
        .text(`₹${item.amount}`, doc.page.width - 70, yPos, { align: 'center' });

      yPos += 8; // Reduced from 9
    });

    doc.strokeColor(colors.border)
      .lineWidth(0.4)
      .moveTo(tableX, yPos)
      .lineTo(doc.page.width - 22, yPos)
      .stroke();

    yPos += 2; // Reduced from 3

    doc.rect(tableX, yPos - 1.5, doc.page.width - 44, 10) // Reduced from 12
      .fill(colors.highlight)
      .stroke(colors.border);

    doc.fillColor(colors.primary)
      .fontSize(6) // Reduced from 6.5
      .font('Helvetica-Bold')
      .text('GRAND TOTAL', col2, yPos)
      .text(`₹${grandTotal}`, doc.page.width - 70, yPos, { align: 'center' });

    yPos += 12; // Reduced from 14
  }

  // ===== FOOTER ===== (compact)
  const pageHeight = doc.page.height;
  const footerY = pageHeight - 42; // Reduced from 48

  doc.strokeColor(colors.border)
    .lineWidth(0.4)
    .moveTo(18, footerY)
    .lineTo(doc.page.width - 18, footerY)
    .stroke();

  doc.fillColor(colors.primary)
    .fontSize(9) // Reduced from 10
    .font('Helvetica-Bold')
    .text('Women Fetal Care Clinic', 18, footerY + 2); // Reduced from 3

  doc.fillColor(colors.lightText)

    .fontSize(7) // Reduced from 8
    .font('Helvetica')
    .text('IVF & Infertility Specialist | 123, Healthcare Road, Near City Hospital', 18, footerY + 12) // Reduced from 9
    .text('Mumbai - 400001, Maharashtra, India | Tel: +91 98765 43210 | Email: info@womenfetalcare.com', 18, footerY + 19); // Reduced from 14

  const sigX = doc.page.width - 170;
  doc.fillColor(colors.lightText)
    .fontSize(6) // Reduced from 5
    .text('_________________________', sigX, footerY + 2) // Reduced from 3
    .font('Helvetica-Bold')
    .fillColor(colors.primary)
    .text(`Dr. ${data.doctor?.name || 'Doctor'}`, sigX, footerY + 9) // Reduced from 11
    .font('Helvetica')
    .fontSize(9) // Reduced from 10
    .fillColor(colors.lightText)
    .text(`Date: ${new Date().toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })}`, sigX, footerY + 16);

  doc.fillColor(colors.border)
    .fontSize(4) // Reduced from 4.5
    .font('Helvetica')
    .text('— END OF DISCHARGE SUMMARY —', 18, pageHeight - 8, { align: 'center' }); // Reduced from 10

  doc.end();
};

exports.createDischarge = async (req, res) => {
  try {
    const {
      patientId,
      consultationId,
      finalDiagnosis,
      treatmentSummary,
      dischargeAdvice,
      followUpDate
    } = req.body;


    discharge = new Discharge({
      patientId,
      consultationId,
      finalDiagnosis,
      treatmentSummary,
      dischargeAdvice,
      followUpDate,
      createdBy: req.user?.id
    });
    await discharge.save();

    res.status(200).json({
      success: true,
      message: 'Discharge summary saved successfully',
      data: discharge
    });
  } catch (error) {
    console.error('Error creating discharge:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating discharge summary',
      error: error.message
    });
  }
};

// Get consultation by patient id
exports.getDischargeByPatientId = async (req, res) => {
  try {
    // Use findOne instead of findById to search by patientId
    const discharge = await Discharge.findOne({ patientId: req.params.id })
      .populate('patientId')
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');

    if (!discharge) {
      return res.status(404).json({
        success: false,
        message: 'Discharge not found'
      });
    }

    res.status(200).json({
      success: true,
      data: discharge
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching discharge',
      error: error.message
    });
  }
};

// Download discharge PDF
exports.downloadDischargePDF = async (req, res) => {
  try {
    const { patientId } = req.params;

    const data = await getDischargeData(patientId);

    if (!data.dischargeRecord) {
      return res.status(404).json({
        success: false,
        message: 'No discharge summary found for this patient'
      });
    }

    await generateDischargePDF(data, res);
  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating PDF',
      error: error.message
    });
  }
};

// Update discharge
exports.updateDischarge = async (req, res) => {
  try {
    const userId = req.user.id;

    const updateData = {
      updatedBy: userId,
      ...req.body
    };

    const discharge = await Discharge.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!discharge) {
      return res.status(404).json({
        success: false,
        message: 'discharge not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Discharge updated successfully',
      data: discharge
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating discharge',
      error: error.message
    });
  }
};