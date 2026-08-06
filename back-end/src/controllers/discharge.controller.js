const Discharge = require('../models/Discharge');
const User = require('../models/User');
const PatientHistory = require('../models/PatientHistory');
const Consultation = require('../models/Consultation');
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
const { formatDateTime } = require('../utils/timeFormate');

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

const generateDischargePDFOld = async (data, res) => {
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
    margin: 14,
    bufferPages: true
  });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=discharge_summary_${data.patient?.UH_ID || 'patient'}.pdf`);

  doc.pipe(res);

  // ===== HEADER FUNCTION =====
  const addHeader = () => {
    doc.rect(0, 0, doc.page.width, 45).fill(colors.primary);
    doc.rect(0, 75, doc.page.width, 1.5).fill(colors.accent);

    doc.fillColor(colors.white)
      .fontSize(12)
      .font('Helvetica-Bold')
      .text('Women Fetal Care Clinic', 18, 8, { align: 'center' });

    doc.fontSize(10)
      .font('Helvetica')
      .text('IVF & Infertility Specialist', { align: 'center' });

    if (data.doctor) {
      doc.fontSize(9)
        .text(`${data.doctor.name} | ${data.doctor.qualification || ''} | MPMC REG. NO: ${data.doctor.registrationNumber || 'N/A'}`, { align: 'center' });
    }

    doc.fillColor(colors.text);

    // Title
    const titleY = doc.y + 8;
    const boxHeight = 20;

    doc.rect(18, titleY - 2, doc.page.width - 36, boxHeight)
      .fill(colors.lightBg)
      .stroke(colors.border);

    doc.fillColor(colors.primary)
      .fontSize(12)
      .font('Helvetica-Bold')
      .text(
        'DISCHARGE SUMMARY',
        18,
        titleY + ((boxHeight - 12) / 2) - 2,
        {
          width: doc.page.width - 36,
          align: 'center'
        }
      );

    doc.y = titleY + boxHeight + 15;
  };

  // ===== FOOTER FUNCTION =====
  const addFooter = () => {
    const footerY = doc.page.height - 55;

    doc.strokeColor(colors.border)
      .lineWidth(0.4)
      .moveTo(18, footerY)
      .lineTo(doc.page.width - 18, footerY)
      .stroke();

    doc.fillColor(colors.primary)
      .fontSize(12)
      .font('Helvetica-Bold')
      .text('Women Fetal Care Clinic', 18, footerY + 5);

    doc.fillColor(colors.lightText)
      .fontSize(8)
      .font('Helvetica')
      .text('IVF & Infertility Specialist | 17-B, Ground Floor, Anupam Nagar', 18, footerY + 18)
      .text('Infront of Park, Near Mehra Hospital, City Center, Gwalior, 474011 | Tel: +91-9243053461', 18, footerY + 26);

    const sigX = doc.page.width - 170;
    doc.fillColor(colors.lightText)
      .fontSize(10)
      .text('_________________________', sigX, footerY + 5)
      .font('Helvetica-Bold')
      .fillColor(colors.primary)
      .text(`Dr. ${data.doctor?.name || 'Doctor'}`, sigX, footerY + 18)
      .font('Helvetica')
      .fontSize(9)
      .fillColor(colors.lightText)
      .text(`Date: ${new Date().toLocaleDateString('en-IN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })}`, sigX, footerY + 29);
  };

  // ===== PAGE 1 =====
  addHeader();

  // ===== PATIENT DEMOGRAPHICS =====
  doc.fillColor(colors.primary)
    .fontSize(12)
    .font('Helvetica-Bold')
    .text('Patient Demographics', 18, doc.y);

  doc.strokeColor(colors.border)
    .lineWidth(0.4)
    .moveTo(18, doc.y + 1.5)
    .lineTo(doc.page.width - 18, doc.y + 1.5)
    .stroke();

  doc.fillColor(colors.text)
    .fontSize(10)
    .font('Helvetica');

  let yPos = doc.y + 8;

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
  yPos += 11;

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
  yPos += 11;

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
  yPos += 11;

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
  yPos += 11;

  // Row 5
  doc.fillColor(colors.lightText)
    .text('Referred By:', col1, yPos, { continued: true })
    .fillColor(colors.text)
    .text(` ${data.patient?.referredByDoctorName || 'N/A'}`);

  doc.fillColor(colors.lightText)
    .text('Infertility:', col2, yPos, { continued: true })
    .fillColor(colors.text)
    .text(` ${getPatientField(data.patient?.infertiliyType, data.patient?.infertiliyTypeDetails)}`);
  yPos += 11;

  yPos += 15;

  // ===== HUSBAND DETAILS =====

  if (data.relative) {
    doc.fillColor(colors.primary)
      .fontSize(12)
      .font('Helvetica-Bold')
      .text('Husband/Relative', 18, yPos)
      .font('Helvetica')
      .fontSize(10);

    doc.strokeColor(colors.border)
      .lineWidth(0.4)
      .moveTo(18, doc.y + 1.5)
      .lineTo(doc.page.width - 18, doc.y + 1.5)
      .stroke();

    doc.fillColor(colors.text)
      .fontSize(10)
      .font('Helvetica');

    yPos = doc.y + 8;

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

    const col1 = 22;
    const col2 = doc.page.width / 3 + 10;
    const col3 = (doc.page.width / 3) * 2 + 20;

    // Row 1
    doc.fillColor(colors.lightText)
      .text('Name:', col1, yPos, { continued: true })
      .fillColor(colors.text)
      .text(` ${relative?.name || 'N/A'}`);

    doc.fillColor(colors.lightText)
      .text('Sex:', col2, yPos, { continued: true })
      .fillColor(colors.text)
      .text(` ${relative?.sex || 'N/A'}`);

    doc.fillColor(colors.lightText)
      .text('Age:', col3, yPos, { continued: true })
      .fillColor(colors.text)
      .text(` ${relative?.age ? `${relative.age} yrs` : 'N/A'}`);
    yPos += 11;

    // Row 2
    doc.fillColor(colors.lightText)
      .text('Relative:', col1, yPos, { continued: true })
      .fillColor(colors.text)
      .text(` ${relative?.role || 'N/A'}`);

    doc.fillColor(colors.lightText)
      .text('Number:', col2, yPos, { continued: true })
      .fillColor(colors.text)
      .text(` ${relative?.mobileNumber || 'N/A'}`);

    doc.fillColor(colors.lightText)
      .text('Address:', col3, yPos, { continued: true })
      .fillColor(colors.text)
      .text(`${relative.address || 'N/A'}`);
    yPos += 11;
    // Row 3
    doc.fillColor(colors.lightText)
      .text('ID Proof:', col1, yPos, { continued: true })
      .fillColor(colors.text)
      .text(` ${getPatientField(relative?.idProofType, relative?.idProofTypeDetails)}`);


    doc.fillColor(colors.lightText)
      .text('ID Number:', col2, yPos, { continued: true })
      .fillColor(colors.text)
      .text(` ${relative?.idProofNumber || 'N/A'}`);
    yPos += 11;
  }

  yPos += 15;

  // ===== CONSULTATION FEES =====
  if (data.consultation?.fees) {
    doc.fillColor(colors.primary)
      .fontSize(12)
      .font('Helvetica-Bold')
      .text('Consultation Fees', 18, yPos)
      .font('Helvetica')
      .fontSize(10);

    doc.strokeColor(colors.border)
      .lineWidth(0.4)
      .moveTo(18, doc.y + 1.5)
      .lineTo(doc.page.width - 18, doc.y + 1.5)
      .stroke();

    doc.fillColor(colors.text)
      .fontSize(10)
      .font('Helvetica');

    yPos = doc.y + 10;

    const fees = data.consultation.fees;
    const tableX = 22;
    const col1Width = 25;
    const col2Width = 150;
    const col3Width = 100;

    doc.rect(tableX, yPos - 5, doc.page.width - 44, 18)
      .fill(colors.lightBg)
      .stroke(colors.border);

    doc.fillColor(colors.primary)
      .fontSize(11)
      .font('Helvetica-Bold')
      .text('#', tableX + 5, yPos, { width: 20, align: 'center' })
      .text('Fee Type', tableX + 30, yPos)
      .text('Amount (Rs.)', doc.page.width - 150, yPos, { align: 'center' });

    yPos = doc.y + 2;

    doc.fillColor(colors.text)
      .fontSize(11)
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
        doc.rect(tableX, yPos - 5, doc.page.width - 44, 20)
          .fill(colors.white)
          .stroke(colors.border);
      } else {
        doc.rect(tableX, yPos - 5, doc.page.width - 44, 20)
          .fill('#f8f9fa')
          .stroke(colors.border);
      }

      doc.fillColor(colors.text)
        .fontSize(10)
        .text(`${idx + 1}`, tableX + 2, yPos, { width: 20, align: 'center' })
        .text(item.label, tableX + 30, yPos)
        .text(`${item.amount}/-`, doc.page.width - 150, yPos, { align: 'center' });

      yPos += 15;
    });

    if (feeItems.length === 0) {
      doc.rect(tableX, yPos - 5, doc.page.width - 44, 10)
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

    yPos += 5;
  }

  yPos += 15;


  // ===== CLINICAL HISTORY =====
  if (data.patientHistory) {

    doc.fillColor(colors.primary)
      .fontSize(12)
      .font('Helvetica-Bold')
      .text('Patient History', 18, yPos)
      .font('Helvetica')
      .fontSize(10);

    doc.strokeColor(colors.border)
      .lineWidth(0.4)
      .moveTo(18, doc.y + 1.5)
      .lineTo(doc.page.width - 18, doc.y + 1.5)
      .stroke();

    doc.fillColor(colors.text)
      .fontSize(10)
      .font('Helvetica');

    yPos = doc.y + 10;

    const history = data.patientHistory;

    if (history.chiefComplaints) {
      const complaintText = history.chiefComplaints.replace(/_/g, ' ').toUpperCase();
      doc.fillColor(colors.lightText)
        .text('Chief:', 25, yPos, { continued: true })
        .fillColor(colors.text)
        .text(` ${complaintText}${history.chiefComplaintsDetails ? ` - ${history.chiefComplaintsDetails}` : ''}`);
    }

    yPos += 11;

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
    }

    yPos += 11;

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
      }
    }

    yPos += 11;

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
      }
    }
    yPos += 11;

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

  yPos += 15;

  // ===== PATIENT EXAMINATION =====
  const formatExamValue = (value, details) => {
    if (!value) return null;
    if (value.toLowerCase() === 'normal' && !details) return 'Normal';
    if (value.toLowerCase() === 'normal' && details) return `Normal (${details})`;
    if (details) return `${value} (${details})`;
    return value;
  };

  if (data.patientExamination) {
    doc.fillColor(colors.primary)
      .fontSize(12)
      .font('Helvetica-Bold')
      .text('Patient Examination', 18, yPos)
      .font('Helvetica')
      .fontSize(10);

    doc.strokeColor(colors.border)
      .lineWidth(0.4)
      .moveTo(18, doc.y + 1.5)
      .lineTo(doc.page.width - 18, doc.y + 1.5)
      .stroke();

    doc.fillColor(colors.text)
      .fontSize(10)
      .font('Helvetica');

    yPos = doc.y + 10;

    const exam = data.patientExamination;
    const vitals = exam.vitals || {};

    let vitalsText = '';
    if (vitals.bp) vitalsText += `BP: ${vitals.bp}${vitals.bpUnit ? ` ${vitals.bpUnit}` : ''} | `;
    if (vitals.pr) vitalsText += `PR: ${vitals.pr}${vitals.prUnit ? ` ${vitals.prUnit}` : ''} | `;
    if (vitals.height) vitalsText += `Height: ${vitals.height}${vitals.heightUnit ? ` ${vitals.heightUnit}` : ''} | `;
    if (vitals.weight) vitalsText += `Weight: ${vitals.weight}${vitals.weightUnit ? ` ${vitals.weightUnit}` : ''}`;
    if (vitals.bmi) vitalsText += ` | BMI: ${vitals.bmi}${vitals.bmiUnit ? ` ${vitals.bmiUnit}` : ''}`;

    if (vitalsText) {
      doc.fillColor(colors.lightText)
        .fontSize(10)
        .text(`${vitalsText}`, 23, yPos, { width: doc.page.width - 36 });
    }
    yPos += 11;


    if (vitals.abdominalExamination) {
      doc.fillColor(colors.lightText)
        .fontSize(10)
        .text('  Abdomen:', 18, yPos, { continued: true })
        .fillColor(colors.text)
        .text(` ${vitals.abdominalExamination}`);
    }
    yPos += 11;

    if (vitals.localExamination) {
      if (vitals.localExamination.perVaginalExamination) {
        doc.fillColor(colors.lightText)
          .text('  Per Vaginal:', 18, yPos, { continued: true })
          .fillColor(colors.text)
          .text(` ${vitals.localExamination.perVaginalExamination}`);

      }
      yPos += 11;

      if (vitals.localExamination.perSpeculumExamination) {
        doc.fillColor(colors.lightText)
          .text('  Per Speculum:', 18, yPos, { continued: true })
          .fillColor(colors.text)
          .text(` ${vitals.localExamination.perSpeculumExamination}`);

      }
      yPos += 11;

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
      yPos += 11;
    }
  }

  yPos += 15;

  // ===== RELATIVE EXAMINATION =====
  if (data.relativeExaminations) {
    doc.fillColor(colors.primary)
      .fontSize(12)
      .font('Helvetica-Bold')
      .text('Relative / Husband Examination', 18, yPos)
      .font('Helvetica')
      .fontSize(10);

    doc.strokeColor(colors.border)
      .lineWidth(0.4)
      .moveTo(18, doc.y + 1.5)
      .lineTo(doc.page.width - 18, doc.y + 1.5)
      .stroke();

    doc.fillColor(colors.text)
      .fontSize(10)
      .font('Helvetica');

    yPos = doc.y + 10;
    const relExam = data.relativeExaminations;
    const relVitals = relExam.vitals || {};

    let relVitalsText = '';
    if (relVitals.bp) relVitalsText += `BP: ${relVitals.bp}${relVitals.bpUnit ? ` ${relVitals.bpUnit}` : ''} | `;
    if (relVitals.pr) relVitalsText += `PR: ${relVitals.pr}${relVitals.prUnit ? ` ${relVitals.prUnit}` : ''} | `;
    if (relVitals.height) relVitalsText += `Ht: ${relVitals.height}${relVitals.heightUnit ? ` ${relVitals.heightUnit}` : ''} | `;
    if (relVitals.weight) relVitalsText += `Wt: ${relVitals.weight}${relVitals.weightUnit ? ` ${relVitals.weightUnit}` : ''}`;
    if (relVitals.bmi) relVitalsText += ` | BMI: ${relVitals.bmi}${relVitals.bmiUnit ? ` ${relVitals.bmiUnit}` : ''}`;

    if (relVitalsText) {
      doc.fillColor(colors.text)
        .fontSize(10)
        .text(`  ${relVitalsText}`, 18, yPos, { width: doc.page.width - 36 });
    }
    yPos += 11;

    if (relVitals.abdominalExamination) {
      doc.fillColor(colors.lightText)
        .fontSize(10)
        .text('  Abdomen:', 18, yPos, { continued: true })
        .fillColor(colors.text)
        .text(` ${relVitals.abdominalExamination}`);
    }
    yPos += 11;

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
        .fontSize(10)
        .text(`  ${relSysText}`, 18, yPos, { width: doc.page.width - 36 });
    }
  }
  yPos += 15;

  // ===== FOOTER PAGE 1 =====
  addFooter();

  // ===== PAGE 2 =====
  doc.addPage();
  addHeader();

  // Reset yPos for page 2
  yPos = doc.y;

  // ===== INVESTIGATIONS =====
  const hasInvestigations = data.investigations || data.bloodInvestigations || data.geneticInvestigations;

  if (hasInvestigations) {
    doc.fillColor(colors.primary)
      .fontSize(12)
      .font('Helvetica-Bold')
      .text('Investigations', 18, yPos)
      .font('Helvetica')
      .fontSize(10);

    doc.strokeColor(colors.border)
      .lineWidth(0.4)
      .moveTo(18, doc.y + 1.5)
      .lineTo(doc.page.width - 18, doc.y + 1.5)
      .stroke();

    doc.fillColor(colors.text)
      .fontSize(10)
      .font('Helvetica');

    yPos = doc.y + 10;

    const renderInvestigationTable = (title, investigationsData, items) => {
      if (!items || items.length === 0) return;

      doc.fillColor(colors.secondary)
        .fontSize(11)
        .font('Helvetica-Bold')
        .text(`  ${title}:`, 18, yPos)
        .font('Helvetica')
        .fontSize(11);
      yPos = doc.y + 5;


      const tableX = 28;
      const col1 = 28;
      const col2 = 40;
      const col3 = 380;

      doc.rect(tableX, yPos - 5, doc.page.width - 44, 18)
        .fill(colors.lightBg)
        .stroke(colors.border);

      doc.fillColor(colors.primary)
        .fontSize(11)
        .font('Helvetica-Bold')
        .text('#', col1, yPos, { width: 12, align: 'center' })
        .text('Test Name', col2, yPos)
        .text('Amount (Rs.)', doc.page.width - 150, yPos, { align: 'center' });

      yPos = doc.y + 2;

      doc.fillColor(colors.text)
        .fontSize(11)
        .font('Helvetica');

      items.forEach((item, idx) => {
        if (idx % 2 === 0) {
          doc.rect(tableX, yPos - 5, doc.page.width - 50, 20)
            .fill(colors.white)
            .stroke(colors.border);
        } else {
          doc.rect(tableX, yPos - 5, doc.page.width - 50, 20)
            .fill('#f8f9fa')
            .stroke(colors.border);
        }

        let testName = item.name || 'N/A';
        if (testName.length > 45) {
          testName = testName.substring(0, 42) + '...';
        }

        doc.fillColor(colors.text)
          .fontSize(10)
          .text(`${idx + 1}`, col1, yPos, { width: 12, align: 'center' })
          .text(testName, col2, yPos, { width: 335 })
          .text(`${item.price || 0}/-`, doc.page.width - 150, yPos, { align: 'center' });

        yPos += 15;
      });

      doc.strokeColor(colors.border)
        .lineWidth(0.4)
        .moveTo(tableX, yPos)
        .lineTo(doc.page.width - 22, yPos)
        .stroke();

      yPos += 3;
    };

    if (data.investigations?.investigations?.length > 0) {
      renderInvestigationTable('Ultrasound Investigations', data.investigations, data.investigations.investigations);
    }
    yPos += 8;

    if (data.bloodInvestigations?.investigations?.length > 0) {
      renderInvestigationTable('Blood Investigations', data.bloodInvestigations, data.bloodInvestigations.investigations);
    }
    yPos += 8;

    if (data.geneticInvestigations?.investigations?.length > 0) {
      renderInvestigationTable('Genetic Investigations', data.geneticInvestigations, data.geneticInvestigations.investigations);
    }
  }
  yPos += 15;

  // ===== DISCHARGE RECORD =====
  if (data.dischargeRecord) {
    doc.fillColor(colors.primary)
      .fontSize(12)
      .font('Helvetica-Bold')
      .text('Discharge', 18, yPos)
      .font('Helvetica')
      .fontSize(10);

    doc.strokeColor(colors.border)
      .lineWidth(0.4)
      .moveTo(18, doc.y + 1.5)
      .lineTo(doc.page.width - 18, doc.y + 1.5)
      .stroke();

    doc.fillColor(colors.text)
      .fontSize(10)
      .font('Helvetica');

    yPos = doc.y + 10;
    const discharge = data.dischargeRecord;

    if (discharge.finalDiagnosis) {
      doc.fillColor(colors.lightText)
        .fontSize(10)
        .text('  Final Diagnosis', 18, yPos, { continued: true })
        .fillColor(colors.text)
        .text(` ${discharge.finalDiagnosis.substring(0, 65)}${discharge.finalDiagnosis.length > 65 ? '...' : ''}`);
    }
    yPos += 11;

    if (discharge.treatmentSummary) {
      doc.fillColor(colors.lightText)
        .fontSize(10)
        .text('  Treatment Summary', 18, yPos, { continued: true })
        .fillColor(colors.text)
        .text(` ${discharge.treatmentSummary.substring(0, 65)}${discharge.treatmentSummary.length > 65 ? '...' : ''}`);
    }
    yPos += 11;

    if (discharge.dischargeAdvice) {
      doc.fillColor(colors.lightText)
        .fontSize(10)
        .text('  Discharge Advice', 18, yPos, { continued: true })
        .fillColor(colors.text)
        .text(` ${discharge.dischargeAdvice.substring(0, 65)}${discharge.dischargeAdvice.length > 65 ? '...' : ''}`);
    }
    yPos += 11;

    if (discharge.followUpDate) {
      const followUp = new Date(discharge.followUpDate).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
      doc.fillColor(colors.lightText)
        .fontSize(10)
        .text('  Discharge Date:', 18, yPos, { continued: true })
        .fillColor(colors.text)
        .text(` ${followUp}`);
    }
  }

  yPos += 20;

  // ===== PRESCRIPTIONS =====
  if (data.prescriptions?.medications?.length > 0) {
    doc.fillColor(colors.primary)
      .fontSize(12)
      .font('Helvetica-Bold')
      .text('Medications', 18, yPos)
      .font('Helvetica')
      .fontSize(10);

    doc.strokeColor(colors.border)
      .lineWidth(0.4)
      .moveTo(18, doc.y + 1.5)
      .lineTo(doc.page.width - 18, doc.y + 1.5)
      .stroke();

    doc.fillColor(colors.text)
      .fontSize(11)
      .font('Helvetica');

    yPos = doc.y + 10;

    const tableX = 22;
    const col1 = 22;
    const col2 = 40;
    const col3 = 210;
    const col4 = 270;
    const col5 = 380;
    const col6 = 440;

    doc.rect(tableX, yPos - 5, doc.page.width - 44, 18)
      .fill(colors.lightBg)
      .stroke(colors.border);

    doc.fillColor(colors.primary)
      .fontSize(11)
      .font('Helvetica-Bold')
      .text('#', col1, yPos, { width: 18, align: 'center' })
      .text('Drug Name', col2, yPos)
      .text('Dosage', col3, yPos)
      .text('Frequency', col4, yPos)
      .text('Duration', col5, yPos)
      .text('Route', col6, yPos);

    yPos = doc.y + 2;

    doc.fillColor(colors.text)
      .fontSize(11)
      .font('Helvetica');

    const meds = data.prescriptions.medications;
    meds.forEach((med, idx) => {
      if (idx % 2 === 0) {
        doc.rect(tableX, yPos - 5, doc.page.width - 50, 20)
          .fill(colors.white)
          .stroke(colors.border);
      } else {
        doc.rect(tableX, yPos - 5, doc.page.width - 50, 20)
          .fill('#f8f9fa')
          .stroke(colors.border);
      }

      let drugName = med.drugName || 'N/A';
      if (drugName.length > 28) {
        drugName = drugName.substring(0, 25) + '...';
      }

      doc.fillColor(colors.text)
        .fontSize(10)
        .text(`${idx + 1}`, col1, yPos, { width: 18, align: 'center' })
        .text(drugName, col2, yPos, { width: 165 })
        .text(med.dosage || 'N/A', col3, yPos)
        .text(med.frequency || 'N/A', col4, yPos, { width: 105 })
        .text(med.duration ? `${med.duration} days` : 'N/A', col5, yPos)
        .text(med.route || 'N/A', col6, yPos, { width: 90 });

      yPos += 15;
    });

    doc.strokeColor(colors.border)
      .lineWidth(0.4)
      .moveTo(tableX, yPos)
      .lineTo(doc.page.width - 22, yPos)
      .stroke();
  }

  yPos += 15;

  if (data.prescriptions.specialInstructions) {

    doc.fillColor(colors.primary)
      .fontSize(12)
      .font('Helvetica-Bold')
      .text('Special Instructions', 18, yPos)
      .font('Helvetica')
      .fontSize(10);

    doc.strokeColor(colors.border)
      .lineWidth(0.4)
      .moveTo(18, doc.y + 1.5)
      .lineTo(doc.page.width - 18, doc.y + 1.5)
      .stroke();

    doc.fillColor(colors.text)
      .fontSize(10)
      .font('Helvetica');

    yPos = doc.y + 10;

    const instrText = data.prescriptions.specialInstructions;
    const instrWidth = doc.page.width - 65;
    const textHeight = doc.heightOfString(instrText, {
      width: instrWidth,
      align: 'left',
      fontSize: 10
    });

    const padding = 3;
    const boxHeight = textHeight + (padding * 2);

    doc.rect(23, yPos - 1.5, doc.page.width - 46, boxHeight + 3)
      .fill(colors.highlight)
      .stroke(colors.border);

    doc.fillColor(colors.text)
      .fontSize(9)
      .font('Helvetica')
      .text(instrText, 33, yPos + padding - 0.5, {
        width: instrWidth,
        align: 'left'
      });

    yPos += boxHeight + 4;
  }
  // ===== TOTAL SUMMARY =====
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
  yPos += 15;

  if (totalItems.length > 0) {
    doc.fillColor(colors.primary)
      .fontSize(12)
      .font('Helvetica-Bold')
      .text('Grand Total', 18, yPos)
      .font('Helvetica')
      .fontSize(10);

    doc.strokeColor(colors.border)
      .lineWidth(0.4)
      .moveTo(18, doc.y + 1.5)
      .lineTo(doc.page.width - 18, doc.y + 1.5)
      .stroke();

    doc.fillColor(colors.text)
      .fontSize(10)
      .font('Helvetica');

    yPos = doc.y + 10;

    const tableX = 22;
    const col1 = 22;
    const col2 = 50;
    const col3 = 120;

    doc.rect(tableX, yPos - 5, doc.page.width - 44, 18)
      .fill(colors.lightBg)
      .stroke(colors.border);

    doc.fillColor(colors.primary)
      .fontSize(11)
      .font('Helvetica-Bold')
      .text('#', col1, yPos, { width: 20, align: 'center' })
      .text('Category', col2, yPos)
      .text('Amount (Rs.)', doc.page.width - 150, yPos, { align: 'center' });

    yPos = doc.y + 2;

    doc.fillColor(colors.text)
      .fontSize(11)
      .font('Helvetica');

    totalItems.forEach((item, idx) => {
      if (idx % 2 === 0) {
        doc.rect(tableX, yPos - 5, doc.page.width - 50, 20)
          .fill(colors.white)
          .stroke(colors.border);
      } else {
        doc.rect(tableX, yPos - 5, doc.page.width - 50, 20)
          .fill('#f8f9fa')
          .stroke(colors.border);
      }

      doc.fillColor(colors.text)
        .fontSize(10)
        .text(`${idx + 1}`, col1, yPos, { width: 20, align: 'center' })
        .text(item.label, col2, yPos, { width: 65 })
        .text(`${item.amount}/-`, doc.page.width - 150, yPos, { align: 'center' });

      yPos += 15;
    });

    doc.strokeColor(colors.border)
      .lineWidth(0.4)
      .moveTo(tableX, yPos)
      .lineTo(doc.page.width - 22, yPos)
      .stroke();

    yPos += 2;

    doc.rect(tableX, yPos - 5, doc.page.width - 44, 18)
      .fill(colors.highlight)
      .stroke(colors.border);

    doc.fillColor(colors.primary)
      .fontSize(10)
      .font('Helvetica-Bold')
      .text('GRAND TOTAL', col2, yPos)
      .text(`${grandTotal}/-`, doc.page.width - 150, yPos, { align: 'center' });

  }
  yPos += 15;

  // ===== FOOTER PAGE 2 =====
  addFooter();

  doc.end();
};

const generateDischargePDF = async (data, res) => {
  console.log("DISCHARE",data);
  
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
    margin: 14,
    bufferPages: true
  });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=discharge_summary_${data.patient?.UH_ID || 'patient'}.pdf`);

  doc.pipe(res);

  // ===== HEADER FUNCTION =====
  const addHeader = () => {
    doc.rect(0, 0, doc.page.width, 45).fill(colors.primary);
    doc.rect(0, 75, doc.page.width, 1.5).fill(colors.accent);

    doc.fillColor(colors.white)
      .fontSize(12)
      .font('Helvetica-Bold')
      .text('Women Fetal Care Clinic', 18, 8, { align: 'center' });

    doc.fontSize(10)
      .font('Helvetica')
      .text('IVF & Infertility Specialist', { align: 'center' });

    if (data.doctor) {
      doc.fontSize(9)
        .text(`${data.doctor.name} | ${data.doctor.qualification || ''} | MPMC REG. NO: ${data.doctor.registrationNumber || 'N/A'}`, { align: 'center' });
    }

    doc.fillColor(colors.text);

    // Title
    const titleY = doc.y + 8;
    const boxHeight = 20;

    doc.rect(18, titleY - 2, doc.page.width - 36, boxHeight)
      .fill(colors.lightBg)
      .stroke(colors.border);

    doc.fillColor(colors.primary)
      .fontSize(12)
      .font('Helvetica-Bold')
      .text(
        'DISCHARGE SUMMARY',
        18,
        titleY + ((boxHeight - 12) / 2) - 2,
        {
          width: doc.page.width - 36,
          align: 'center'
        }
      );

    doc.y = titleY + boxHeight + 15;
  };

  // ===== FOOTER FUNCTION =====
  const addFooter = () => {
    const footerY = doc.page.height - 55;

    doc.strokeColor(colors.border)
      .lineWidth(0.4)
      .moveTo(18, footerY)
      .lineTo(doc.page.width - 18, footerY)
      .stroke();

    doc.fillColor(colors.primary)
      .fontSize(12)
      .font('Helvetica-Bold')
      .text('Women Fetal Care Clinic', 18, footerY + 5);

    doc.fillColor(colors.lightText)
      .fontSize(8)
      .font('Helvetica')
      .text('IVF & Infertility Specialist | 17-B, Ground Floor, Anupam Nagar', 18, footerY + 18)
      .text('Infront of Park, Near Mehra Hospital, City Center, Gwalior, 474011 | Tel: +91-9243053461', 18, footerY + 26);

    const sigX = doc.page.width - 170;
    doc.fillColor(colors.lightText)
      .fontSize(10)
      .text('_________________________', sigX, footerY + 5)
      .font('Helvetica-Bold')
      .fillColor(colors.primary)
      .text(`Dr. ${data.doctor?.name || 'Doctor'}`, sigX, footerY + 18)
      .font('Helvetica')
      .fontSize(9)
      .fillColor(colors.lightText)
      .text(`Date: ${new Date().toLocaleDateString('en-IN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })}`, sigX, footerY + 29);
  };

  // ===== PAGE 1 (Single Page) =====
  addHeader();

  let yPos = doc.y;

  // ===== 1. PATIENT DEMOGRAPHICS =====
  const titleY = yPos;

  // Left side - Patient Demographics
  doc.fillColor(colors.primary)
    .fontSize(12)
    .font('Helvetica-Bold')
    .text('Patient Demographics', 18, titleY);

  // Right side - Consultation Date & Time (on the same line)
  doc.fillColor(colors.lightText)
    .fontSize(10)
    .font('Helvetica')
    .text('Dischare Date & Time:', doc.page.width / 2 + 20, titleY, {
      continued: true,
      width: doc.page.width / 2 - 38,
      align: 'left'
    })
    .fillColor(colors.text)
    .font('Helvetica-Bold')
    .text(` ${formatDateTime(data.dischargeRecord?.createdAt)}`, {
      continued: false
    });

  doc.strokeColor(colors.border)
    .lineWidth(0.4)
    .moveTo(18, doc.y + 1.5)
    .lineTo(doc.page.width - 18, doc.y + 1.5)
    .stroke();

  doc.fillColor(colors.text)
    .fontSize(10)
    .font('Helvetica');

  yPos = doc.y + 8;

// ========New============

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
  yPos += 11;

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
  yPos += 11;

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
  yPos += 11;

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
  yPos += 11;

  // Row 5
  doc.fillColor(colors.lightText)
    .text('Referred By:', col1, yPos, { continued: true })
    .fillColor(colors.text)
    .text(` ${data.patient?.referredByDoctorName || 'N/A'}`);

  doc.fillColor(colors.lightText)
    .text('Infertility:', col2, yPos, { continued: true })
    .fillColor(colors.text)
    .text(` ${getPatientField(data.patient?.infertiliyType, data.patient?.infertiliyTypeDetails)}`);
  yPos += 11;

  yPos += 15;

  // ===== 2. HUSBAND/RELATIVE DETAILS =====
  if (data.relative) {
    doc.fillColor(colors.primary)
      .fontSize(12)
      .font('Helvetica-Bold')
      .text('Husband/Relative', 18, yPos)
      .font('Helvetica')
      .fontSize(10);

    doc.strokeColor(colors.border)
      .lineWidth(0.4)
      .moveTo(18, doc.y + 1.5)
      .lineTo(doc.page.width - 18, doc.y + 1.5)
      .stroke();

    doc.fillColor(colors.text)
      .fontSize(10)
      .font('Helvetica');

    yPos = doc.y + 8;

    const relative = data.relative;

    // Row 1
    doc.fillColor(colors.lightText)
      .text('Name:', col1, yPos, { continued: true })
      .fillColor(colors.text)
      .text(` ${relative?.name || 'N/A'}`);

    doc.fillColor(colors.lightText)
      .text('Sex:', col2, yPos, { continued: true })
      .fillColor(colors.text)
      .text(` ${relative?.sex || 'N/A'}`);

    doc.fillColor(colors.lightText)
      .text('Age:', col3, yPos, { continued: true })
      .fillColor(colors.text)
      .text(` ${relative?.age ? `${relative.age} yrs` : 'N/A'}`);
    yPos += 11;

    // Row 2
    doc.fillColor(colors.lightText)
      .text('Relative:', col1, yPos, { continued: true })
      .fillColor(colors.text)
      .text(` ${relative?.role || 'N/A'}`);

    doc.fillColor(colors.lightText)
      .text('Number:', col2, yPos, { continued: true })
      .fillColor(colors.text)
      .text(` ${relative?.mobileNumber || 'N/A'}`);

    doc.fillColor(colors.lightText)
      .text('Address:', col3, yPos, { continued: true })
      .fillColor(colors.text)
      .text(`${relative?.address?.substring(0, 20) || 'N/A'}`);
    yPos += 11;

    // Row 3
    doc.fillColor(colors.lightText)
      .text('ID Proof:', col1, yPos, { continued: true })
      .fillColor(colors.text)
      .text(` ${getPatientField(relative?.idProofType, relative?.idProofTypeDetails)}`);

    doc.fillColor(colors.lightText)
      .text('ID Number:', col2, yPos, { continued: true })
      .fillColor(colors.text)
      .text(` ${relative?.idProofNumber || 'N/A'}`);
    yPos += 11;
  }

  yPos += 15;

  // ===== DISCHARGE RECORD =====
  if (data.dischargeRecord) {
    doc.fillColor(colors.primary)
      .fontSize(12)
      .font('Helvetica-Bold')
      .text('Discharge', 18, yPos)
      .font('Helvetica')
      .fontSize(10);

    doc.strokeColor(colors.border)
      .lineWidth(0.4)
      .moveTo(18, doc.y + 1.5)
      .lineTo(doc.page.width - 18, doc.y + 1.5)
      .stroke();

    doc.fillColor(colors.text)
      .fontSize(10)
      .font('Helvetica');

    yPos = doc.y + 10;
    const discharge = data.dischargeRecord;

    if (discharge.finalDiagnosis) {
      doc.fillColor(colors.lightText)
        .fontSize(10)
        .text('  Final Diagnosis', 18, yPos, { continued: true })
        .fillColor(colors.text)
        .text(` ${discharge.finalDiagnosis.substring(0, 100)}${discharge.finalDiagnosis.length > 100 ? '...' : ''}`);
    }
    yPos += 15;

    if (discharge.treatmentSummary) {
      doc.fillColor(colors.lightText)
        .fontSize(10)
        .text('  Treatment Summary', 18, yPos, { continued: true })
        .fillColor(colors.text)
        .text(` ${discharge.treatmentSummary.substring(0, 100)}${discharge.treatmentSummary.length > 100 ? '...' : ''}`);
    }
    yPos += 15;

    if (discharge.dischargeAdvice) {
      doc.fillColor(colors.lightText)
        .fontSize(10)
        .text('  Discharge Advice', 18, yPos, { continued: true })
        .fillColor(colors.text)
        .text(` ${discharge.dischargeAdvice.substring(0, 100)}${discharge.dischargeAdvice.length > 100 ? '...' : ''}`);
    }
    yPos += 15;

    if (discharge.followUpDate) {
      const followUp = new Date(discharge.followUpDate).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
      doc.fillColor(colors.lightText)
        .fontSize(10)
        .text('  Follow Up Date:', 18, yPos, { continued: true })
        .fillColor(colors.text)
        .text(` ${formatDateTime(discharge.followUpDate)}`);
    }
  }
  

  // ===== FOOTER =====
  addFooter();

  doc.end();
};

// Helper function to get all discharge data
const getDischargeDataOld = async (patientId) => {
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

// Helper function to get all discharge data
const getDischargeData = async (dischareId) => {
  try {
    const dischargeRecord = await Discharge.findById(dischareId)
      .populate('createdBy', '-password -__v')

    if (!dischargeRecord) {
      throw new Error('Dischare card not found');
    }

    const patientId = dischargeRecord.patientId;

    const patient = await User.findById(patientId).select('-password -__v');

    const relative = await Relative.findOne({ UH_ID: patient?.UH_ID });

    const doctor = dischargeRecord.createdBy || null;

    return {
      patient,
      doctor,
      dischargeRecord,
      relative,
    };
  } catch (error) {
    console.error('Error fetching patient History data:', error);
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

exports.createDischarge = async (req, res) => {
  try {
    const {
      patientId,
      finalDiagnosis,
      treatmentSummary,
      dischargeAdvice,
      followUpDate
    } = req.body;


    discharge = new Discharge({
      patientId,
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
    const { patientId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const discharge = await Discharge.find({ patientId })
      .populate('patientId')
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);


    const total = await Discharge.countDocuments({ patientId: req.params.patientId });

    if (!discharge || discharge.length === 0) {
      return res.status(200).json({
        success: true,
        data: [],
        message: 'This patient discharge card has not been prepared yet.',
        pagination: {
          total: 0,
          page: Number(page),
          pages: 0
        }
      });
    }

    res.status(200).json({
      success: true,
      data: discharge,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / limit)
      }
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
    console.log('Error generating PDF:', error);
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