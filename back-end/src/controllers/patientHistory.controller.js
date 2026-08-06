const PatientHistory = require('../models/PatientHistory');
const Consultation = require('../models/Consultation');
const Patient = require('../models/User');
const Relative = require('../models/Relative');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const { formatDateTime } = require('../utils/timeFormate');

const generatePatientHistoryPDF = async (data, res) => {
  console.log("ph", data.patientHistory.historyOfIllness);

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
        'PATIENT HISTORY SUMMARY',
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

  doc.fillColor(colors.lightText)
    .fontSize(10)
    .font('Helvetica')
    .text('History Date & Time:', doc.page.width / 2 + 20, titleY, {
      continued: true,
      width: doc.page.width / 2 - 38,
      align: 'left'
    })
    .fillColor(colors.text)
    .font('Helvetica-Bold')
    .text(` ${formatDateTime(data.patientHistory?.createdAt)}`, {
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

  // ===== CLINICAL HISTORY =====
  if (data?.patientHistory) {
    const history = data.patientHistory;
    let sectionY = yPos;

    doc.fillColor(colors.primary)
      .fontSize(12)
      .font('Helvetica-Bold')
      .text('Clinical History', 18, sectionY);

    doc.strokeColor(colors.border)
      .lineWidth(0.4)
      .moveTo(18, doc.y + 1.5)
      .lineTo(doc.page.width - 18, doc.y + 1.5)
      .stroke();

    yPos = doc.y + 10;

    const sectionWidth = doc.page.width - 36;
    const leftCol = 22;
    const rightCol = doc.page.width / 2 + 10;
    const labelWidth = 100;
    const valueX = leftCol + labelWidth;

    // ===== CHIEF COMPLAINTS =====
    if (history.chiefComplaints) {
      const complaintText = history.chiefComplaints.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());

      doc.rect(leftCol, yPos - 2, sectionWidth, 20)
        .fill(colors.lightBg)
        .stroke(colors.border);

      doc.fillColor(colors.primary)
        .fontSize(10)
        .font('Helvetica-Bold')
        .text('Chief Complaints', leftCol + 5, yPos + 3);

      yPos += 22;

      doc.fillColor(colors.text)
        .fontSize(10)
        .font('Helvetica')
        .text(`${complaintText}${history.chiefComplaintsDetails ? ` - ${history.chiefComplaintsDetails}` : ''}`, leftCol + 10, yPos, {
          width: sectionWidth - 20
        });

      yPos = doc.y + 8;
    }

    // ===== HISTORY OF ILLNESS =====
    if (history.historyOfIllness) {
      const illness = history.historyOfIllness;

      doc.rect(leftCol, yPos - 2, sectionWidth, 20)
        .fill(colors.lightBg)
        .stroke(colors.border);

      doc.fillColor(colors.primary)
        .fontSize(10)
        .font('Helvetica-Bold')
        .text('History of Illness', leftCol + 5, yPos + 3);

      yPos += 22;

      const illnessLeftX = leftCol + 10;

      // Onset
      if (illness.onset) {
        const onsetDate = new Date(illness.onset).toLocaleDateString('en-IN', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        });

        doc.fillColor(colors.lightText)
          .fontSize(9)
          .font('Helvetica')
          .text('Onset:', illnessLeftX, yPos, { continued: true, width: 80 })
          .fillColor(colors.text)
          .font('Helvetica-Bold')
          .text(` ${onsetDate}`);

        yPos += 14;
      }

      // Duration
      if (illness.duration && illness.duration.length > 0) {
        const durationText = illness.duration.map(d => `${d.number} ${d.unit}`).join(', ');

        doc.fillColor(colors.lightText)
          .fontSize(9)
          .font('Helvetica')
          .text('Duration:', illnessLeftX, yPos, { continued: true, width: 250 })
          .fillColor(colors.text)
          .font('Helvetica-Bold')
          .text(` ${durationText}`);

        yPos += 14;
      }

      // Associated Symptoms
      if (illness.associatedSymptoms) {
        doc.fillColor(colors.lightText)
          .fontSize(9)
          .font('Helvetica')
          .text('Symptoms:', illnessLeftX, yPos, { continued: true, width: sectionWidth })
          .fillColor(colors.text)
          .font('Helvetica')
          .text(` ${illness.associatedSymptoms}`, {
            width: sectionWidth - 90
          });

        yPos = doc.y + 6;
      }

      yPos += 4;
    }

    // ===== MENSTRUAL HISTORY =====
    if (history.menstrualHistory) {
      const menstrual = history.menstrualHistory;

      doc.rect(leftCol, yPos - 2, sectionWidth, 20)
        .fill(colors.lightBg)
        .stroke(colors.border);

      doc.fillColor(colors.primary)
        .fontSize(10)
        .font('Helvetica-Bold')
        .text('Menstrual History', leftCol + 5, yPos + 3);

      yPos += 22;

      const menstLeftX = leftCol + 10;

      // LMP
      if (menstrual.lmp) {
        const lmpDate = new Date(menstrual.lmp).toLocaleDateString('en-IN', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        });

        doc.fillColor(colors.lightText)
          .fontSize(9)
          .font('Helvetica')
          .text('LMP:', menstLeftX, yPos, { continued: true, width: 100 })
          .fillColor(colors.text)
          .font('Helvetica-Bold')
          .text(` ${lmpDate}`);

        // Cycle Length and Days of Flow on same line
        doc.fillColor(colors.lightText)
          .text('Cycle Length:', menstLeftX + 200, yPos, { continued: true, width: 100 })
          .fillColor(colors.text)
          .font('Helvetica-Bold')
          .text(` ${menstrual.cycleLength || 'N/A'} days`);

        doc.fillColor(colors.lightText)
          .text('Days of Flow:', menstLeftX + 380, yPos, { continued: true, width: 100 })
          .fillColor(colors.text)
          .font('Helvetica-Bold')
          .text(` ${menstrual.daysOfFlow || 'N/A'} days`);

        yPos += 14;
      }

      // Associated Symptoms
      if (menstrual.associatedSymptoms) {
        doc.fillColor(colors.lightText)
          .fontSize(9)
          .font('Helvetica')
          .text('Symptoms:', menstLeftX, yPos, { continued: true, width: sectionWidth })
          .fillColor(colors.text)
          .font('Helvetica')
          .text(` ${menstrual.associatedSymptoms}`, {
            width: sectionWidth - 90
          });

        yPos = doc.y + 6;
      }

      yPos += 4;
    }

    // ===== OBSTETRIC HISTORY =====
    if (history.obstetricHistory) {
      const obst = history.obstetricHistory;

      doc.rect(leftCol, yPos - 2, sectionWidth, 20)
        .fill(colors.lightBg)
        .stroke(colors.border);

      doc.fillColor(colors.primary)
        .fontSize(10)
        .font('Helvetica-Bold')
        .text('Obstetric History', leftCol + 5, yPos + 3);

      yPos += 22;

      // Create a table-like layout for obstetric history
      const obstFields = [
        { key: 'gravida', label: 'Gravida', value: obst.gravida },
        { key: 'para', label: 'Para', value: obst.para },
        { key: 'living', label: 'Living', value: obst.living },
        { key: 'abortion', label: 'Abortion', value: obst.abortion },
        { key: 'sb_iod_dead', label: 'SB/IUD/Dead', value: obst.sb_iod_dead },
        { key: 'ectopic', label: 'Ectopic', value: obst.ectopic }
      ];

      const obstStartX = leftCol + 10;
      const obstColWidth = (sectionWidth - 20) / 3;

      obstFields.forEach((field, index) => {
        const colIndex = index % 3;
        const rowIndex = Math.floor(index / 3);
        const xPos = obstStartX + (colIndex * obstColWidth);
        const currentY = yPos + (rowIndex * 18);

        if (field.value) {
          doc.fillColor(colors.lightText)
            .fontSize(9)
            .font('Helvetica')
            .text(`${field.label}:`, xPos, currentY, { continued: true, width: 100 })
            .fillColor(colors.text)
            .font('Helvetica-Bold')
            .text(` ${field.value}`);
        }
      });

      yPos += Math.ceil(obstFields.filter(f => f.value).length / 3) * 18 + 8;
    }

    // ===== WIFE MEDICAL HISTORY =====
    if (history.wifeMedicalHistory) {
      const wifeMed = history.wifeMedicalHistory;

      doc.rect(leftCol, yPos - 2, sectionWidth, 20)
        .fill(colors.lightBg)
        .stroke(colors.border);

      doc.fillColor(colors.primary)
        .fontSize(10)
        .font('Helvetica-Bold')
        .text('Wife Medical History', leftCol + 5, yPos + 3);

      yPos += 22;

      const wifeFields = [
        { key: 'diabetes', label: 'Diabetes', value: wifeMed.diabetes },
        { key: 'hypertension', label: 'Hypertension', value: wifeMed.hypertension },
        { key: 'asthma', label: 'Asthma', value: wifeMed.asthma },
        { key: 'thyroid', label: 'Thyroid', value: wifeMed.thyroid },
        { key: 'drugAllergy', label: 'Drug Allergy', value: wifeMed.drugAllergy },
        { key: 'geneticDiseaseSelf', label: 'Genetic Disease (Self)', value: wifeMed.geneticDiseaseSelf },
        { key: 'geneticDiseaseFamily', label: 'Genetic Disease (Family)', value: wifeMed.geneticDiseaseFamily },
        { key: 'downSyndrome', label: 'Down Syndrome', value: wifeMed.downSyndrome },
        { key: 'smoking', label: 'Smoking', value: wifeMed.smoking },
        { key: 'drugAddiction', label: 'Drug Addiction', value: wifeMed.drugAddiction }
      ];

      const wifeStartX = leftCol + 10;
      const wifeColWidth = sectionWidth / 2;

      wifeFields.forEach((field, index) => {
        if (field.key === 'drugAllergyDetails' && wifeMed.drugAllergy?.toLowerCase() !== 'yes') return;
        if (field.key === 'geneticDiseaseFamily' && !field.value) return;
        if (!field.value && field.key !== 'drugAllergyDetails') return;

        const colIndex = index % 2;
        const rowIndex = Math.floor(index / 2);
        const xPos = wifeStartX + (colIndex * wifeColWidth);
        const currentY = yPos + (rowIndex * 16);

        let displayValue = field.value;
        if (field.key !== 'drugAllergyDetails') {
          displayValue = field.value?.toLowerCase() === 'yes' ? 'Yes' :
            field.value?.toLowerCase() === 'no' ? 'No' :
              field.value || 'N/A';
        }

        // Draw alternating row backgrounds
        if (rowIndex % 2 === 0) {
          doc.rect(xPos - 5, currentY - 1, wifeColWidth - 5, 14)
            .fill('#f8f9fa')
            .stroke(colors.border);
        }

        doc.fillColor(colors.lightText)
          .fontSize(8)
          .font('Helvetica')
          .text(`${field.label}:`, xPos, currentY + 1, { continued: true, width: 120 })
          .fillColor(colors.text)
          .font('Helvetica-Bold')
          .text(` ${displayValue}`);
      });

      // Drug Allergy Details
      if (wifeMed.drugAllergy?.toLowerCase() === 'yes' && wifeMed.drugAllergyDetails) {
        yPos += Math.ceil(wifeFields.filter(f => {
          if (f.key === 'drugAllergyDetails' && wifeMed.drugAllergy?.toLowerCase() !== 'yes') return false;
          if (f.key === 'geneticDiseaseFamily' && !f.value) return false;
          return f.value || f.key === 'drugAllergyDetails';
        }).length / 2) * 16 + 4;

        doc.fillColor(colors.lightText)
          .fontSize(9)
          .font('Helvetica')
          .text('Drug Allergy Details:', wifeStartX, yPos, { continued: true, width: 120 })
          .fillColor(colors.text)
          .font('Helvetica')
          .text(` ${wifeMed.drugAllergyDetails}`);

        yPos += 14;
      } else {
        yPos += Math.ceil(wifeFields.filter(f => {
          if (f.key === 'drugAllergyDetails' && wifeMed.drugAllergy?.toLowerCase() !== 'yes') return false;
          if (f.key === 'geneticDiseaseFamily' && !f.value) return false;
          return f.value || f.key === 'drugAllergyDetails';
        }).length / 2) * 16 + 8;
      }
    }

    // ===== HUSBAND MEDICAL HISTORY =====
    if (history.husbandMedicalHistory) {
      const husbandMed = history.husbandMedicalHistory;

      doc.rect(leftCol, yPos - 2, sectionWidth, 20)
        .fill(colors.lightBg)
        .stroke(colors.border);

      doc.fillColor(colors.primary)
        .fontSize(10)
        .font('Helvetica-Bold')
        .text('Husband Medical History', leftCol + 5, yPos + 3);

      yPos += 22;

      const husbandFields = [
        { key: 'diabetes', label: 'Diabetes', value: husbandMed.diabetes },
        { key: 'hypertension', label: 'Hypertension', value: husbandMed.hypertension },
        { key: 'asthma', label: 'Asthma', value: husbandMed.asthma },
        { key: 'thyroid', label: 'Thyroid', value: husbandMed.thyroid },
        { key: 'drugAllergy', label: 'Drug Allergy', value: husbandMed.drugAllergy },
        { key: 'geneticDiseaseSelf', label: 'Genetic Disease (Self)', value: husbandMed.geneticDiseaseSelf },
        { key: 'geneticDiseaseFamily', label: 'Genetic Disease (Family)', value: husbandMed.geneticDiseaseFamily },
        { key: 'downSyndrome', label: 'Down Syndrome', value: husbandMed.downSyndrome },
        { key: 'smoking', label: 'Smoking', value: husbandMed.smoking },
        { key: 'drugAddiction', label: 'Drug Addiction', value: husbandMed.drugAddiction }
      ];

      const husbandStartX = leftCol + 10;
      const husbandColWidth = sectionWidth / 2;

      husbandFields.forEach((field, index) => {
        if (field.key === 'drugAllergyDetails' && husbandMed.drugAllergy?.toLowerCase() !== 'yes') return;
        if (field.key === 'geneticDiseaseFamily' && !field.value) return;
        if (!field.value && field.key !== 'drugAllergyDetails') return;

        const colIndex = index % 2;
        const rowIndex = Math.floor(index / 2);
        const xPos = husbandStartX + (colIndex * husbandColWidth);
        const currentY = yPos + (rowIndex * 16);

        let displayValue = field.value;
        if (field.key !== 'drugAllergyDetails') {
          displayValue = field.value?.toLowerCase() === 'yes' ? 'Yes' :
            field.value?.toLowerCase() === 'no' ? 'No' :
              field.value || 'N/A';
        }

        // Draw alternating row backgrounds
        if (rowIndex % 2 === 0) {
          doc.rect(xPos - 5, currentY - 1, husbandColWidth - 5, 14)
            .fill('#f8f9fa')
            .stroke(colors.border);
        }

        doc.fillColor(colors.lightText)
          .fontSize(8)
          .font('Helvetica')
          .text(`${field.label}:`, xPos, currentY + 1, { continued: true, width: 120 })
          .fillColor(colors.text)
          .font('Helvetica-Bold')
          .text(` ${displayValue}`);
      });

      // Drug Allergy Details
      if (husbandMed.drugAllergy?.toLowerCase() === 'yes' && husbandMed.drugAllergyDetails) {
        yPos += Math.ceil(husbandFields.filter(f => {
          if (f.key === 'drugAllergyDetails' && husbandMed.drugAllergy?.toLowerCase() !== 'yes') return false;
          if (f.key === 'geneticDiseaseFamily' && !f.value) return false;
          return f.value || f.key === 'drugAllergyDetails';
        }).length / 2) * 16 + 4;

        doc.fillColor(colors.lightText)
          .fontSize(9)
          .font('Helvetica')
          .text('Drug Allergy Details:', husbandStartX, yPos, { continued: true, width: 120 })
          .fillColor(colors.text)
          .font('Helvetica')
          .text(` ${husbandMed.drugAllergyDetails}`);

        yPos += 14;
      } else {
        yPos += Math.ceil(husbandFields.filter(f => {
          if (f.key === 'drugAllergyDetails' && husbandMed.drugAllergy?.toLowerCase() !== 'yes') return false;
          if (f.key === 'geneticDiseaseFamily' && !f.value) return false;
          return f.value || f.key === 'drugAllergyDetails';
        }).length / 2) * 16 + 8;
      }
    }
  }

  yPos += 10;

  yPos += 15;

  // ===== FOOTER =====
  addFooter();

  doc.end();
};

// Helper function to get all discharge data
const getHistoryData = async (patientHistoryId) => {
  try {
    const patientHistory = await PatientHistory.findById(patientHistoryId)
      .populate('createdBy', '-password -__v')

    if (!patientHistory) {
      throw new Error('Patient History not found');
    }

    const patientId = patientHistory.patientId;

    const patient = await Patient.findById(patientId).select('-password -__v');

    const relative = await Relative.findOne({ UH_ID: patient?.UH_ID });

    const doctor = patientHistory.createdBy || null;

    return {
      patient,
      doctor,
      patientHistory,
      relative,
    };
  } catch (error) {
    console.error('Error fetching patient History data:', error);
    throw error;
  }
};

// Download pdf
exports.patientHistoryPdf = async (req, res) => {
  try {
    const { patientHistoryId } = req.params;

    const data = await getHistoryData(patientHistoryId);

    if (!data.patientHistory) {
      return res.status(404).json({
        success: false,
        message: 'No patient history summary found for this patient'
      });
    }

    await generatePatientHistoryPDF(data, res);
  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating PDF',
      error: error.message
    });
  }
};

// Create Patient History
exports.createPatientHistory = async (req, res) => {
  try {
    const {
      patientHistoryDate,
      patientId,
      consultationId,
      chiefComplaints,
      chiefComplaintsDetails,
      // amenorrhoea,
      // complaint,
      historyOfIllness,
      menstrualHistory,
      obstetricHistory,
      wifeMedicalHistory,
      husbandMedicalHistory
    } = req.body;

    // Check if patient exists
    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    if (historyOfIllness?.duration) {
      const isValidDuration = historyOfIllness.duration.every(item => {
        if (item.unit === '' || item.unit === null || item.unit === undefined) {
          return true;
        }
        return item.number && ['months', 'weeks', 'days', 'years'].includes(item.unit);
      });

      if (!isValidDuration) {
        return res.status(400).json({
          success: false,
          message: 'Invalid duration format. Each duration item must have a number and a valid unit (months/weeks/days/years)'
        });
      }
    }

    const patientHistory = new PatientHistory({
      patientId,
      consultationId,
      chiefComplaints,
      chiefComplaintsDetails,
      // amenorrhoea,
      // complaint,
      historyOfIllness: {
        onset: historyOfIllness?.onset,
        duration: historyOfIllness?.duration || [],
        associatedSymptoms: historyOfIllness?.associatedSymptoms
      },
      menstrualHistory: {
        cycleLength: menstrualHistory?.cycleLength,
        daysOfFlow: menstrualHistory?.daysOfFlow,
        associatedSymptoms: menstrualHistory?.associatedSymptoms,
        lmp: menstrualHistory?.lmp
      },
      obstetricHistory: {
        gravida: obstetricHistory?.gravida,
        para: obstetricHistory?.para,
        living: obstetricHistory?.living,
        abortion: obstetricHistory?.abortion,
        sb_iod_dead: obstetricHistory?.sb_iod_dead,
        ectopic: obstetricHistory?.ectopic
      },
      wifeMedicalHistory: {
        diabetes: wifeMedicalHistory?.diabetes,
        hypertension: wifeMedicalHistory?.hypertension,
        asthma: wifeMedicalHistory?.asthma,
        thyroid: wifeMedicalHistory?.thyroid,
        drugAllergy: wifeMedicalHistory?.drugAllergy,
        drugAllergyDetails: wifeMedicalHistory?.drugAllergyDetails,
        geneticDiseaseSelf: wifeMedicalHistory?.geneticDiseaseSelf,
        geneticDiseaseFamily: wifeMedicalHistory?.geneticDiseaseFamily,
        downSyndrome: wifeMedicalHistory?.downSyndrome,
        smoking: wifeMedicalHistory?.smoking,
        drugAddiction: wifeMedicalHistory?.drugAddiction
      },
      husbandMedicalHistory: {
        diabetes: husbandMedicalHistory?.diabetes,
        hypertension: husbandMedicalHistory?.hypertension,
        asthma: husbandMedicalHistory?.asthma,
        thyroid: husbandMedicalHistory?.thyroid,
        drugAllergy: husbandMedicalHistory?.drugAllergy,
        drugAllergyDetails: husbandMedicalHistory?.drugAllergyDetails,
        geneticDiseaseSelf: husbandMedicalHistory?.geneticDiseaseSelf,
        geneticDiseaseFamily: husbandMedicalHistory?.geneticDiseaseFamily,
        downSyndrome: husbandMedicalHistory?.downSyndrome,
        smoking: husbandMedicalHistory?.smoking,
        drugAddiction: husbandMedicalHistory?.drugAddiction
      },
      createdBy: req.user.id,
      updatedBy: req.user.id
    });

    await patientHistory.save();

    // If consultationId is provided, update the consultation with history reference
    if (consultationId) {
      await Consultation.findByIdAndUpdate(consultationId, {
        patientHistoryId: patientHistory._id
      });
    }

    res.status(201).json({
      success: true,
      message: 'Patient history created successfully',
      data: patientHistory
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: 'Error creating patient history',
      error: error.message
    });
  }
};

// Update Patient History
exports.updatePatientHistory = async (req, res) => {
  try {
    const { patientId } = req.params;
    const {
      chiefComplaints,
      chiefComplaintsDetails,
      // amenorrhoea,
      // complaint,
      historyOfIllness,
      menstrualHistory,
      obstetricHistory,
      wifeMedicalHistory,
      husbandMedicalHistory,
      consultationId
    } = req.body;

    const updateData = {
      updatedBy: req.user.id
    };

    // Only update fields that are provided

    if (consultationId !== undefined) updateData.consultationId = consultationId;
    if (chiefComplaints !== undefined) updateData.chiefComplaints = chiefComplaints;
    if (chiefComplaintsDetails !== undefined) updateData.chiefComplaintsDetails = chiefComplaintsDetails;
    // if (amenorrhoea !== undefined) updateData.amenorrhoea = amenorrhoea;
    // if (complaint !== undefined) updateData.complaint = complaint;

    if (historyOfIllness) {
      updateData.historyOfIllness = {};
      if (historyOfIllness.onset) updateData.historyOfIllness.onset = historyOfIllness.onset;
      if (historyOfIllness.duration !== undefined) {
        // Validate duration format if provided and not empty
        if (historyOfIllness?.duration) {
          const isValidDuration = historyOfIllness.duration.every(item => {
            if (item.unit === '' || item.unit === null || item.unit === undefined) {
              return true;
            }
            return item.number && ['months', 'weeks', 'days', 'years'].includes(item.unit);
          });

          if (!isValidDuration) {
            return res.status(400).json({
              success: false,
              message: 'Invalid duration format. Each duration item must have a number and a valid unit (months/weeks/days/years)'
            });
          }
        }
        // if (Array.isArray(historyOfIllness.duration) && historyOfIllness.duration.length > 0) {
        //   const isValidDuration = historyOfIllness.duration.every(item =>
        //     item.number && item.unit && ['months', 'weeks', 'days', 'years',""].includes(item.unit)
        //   );
        //   if (!isValidDuration) {
        //     return res.status(400).json({
        //       success: false,
        //       message: 'Invalid duration format. Each duration item must have a number and a valid unit (months/weeks/days/years)'
        //     });
        //   }
        // }
        updateData.historyOfIllness.duration = historyOfIllness.duration;
      }
      if (historyOfIllness.associatedSymptoms) updateData.historyOfIllness.associatedSymptoms = historyOfIllness.associatedSymptoms;
    }

    if (menstrualHistory) {
      updateData.menstrualHistory = {};
      if (menstrualHistory.cycleLength) updateData.menstrualHistory.cycleLength = menstrualHistory.cycleLength;
      if (menstrualHistory.daysOfFlow) updateData.menstrualHistory.daysOfFlow = menstrualHistory.daysOfFlow;
      if (menstrualHistory.associatedSymptoms) updateData.menstrualHistory.associatedSymptoms = menstrualHistory.associatedSymptoms;
      if (menstrualHistory.lmp) updateData.menstrualHistory.lmp = menstrualHistory.lmp;
    }

    if (obstetricHistory) {
      updateData.obstetricHistory = {};
      if (obstetricHistory.gravida) updateData.obstetricHistory.gravida = obstetricHistory.gravida;
      if (obstetricHistory.para) updateData.obstetricHistory.para = obstetricHistory.para;
      if (obstetricHistory.living) updateData.obstetricHistory.living = obstetricHistory.living;
      if (obstetricHistory.abortion) updateData.obstetricHistory.abortion = obstetricHistory.abortion;
      if (obstetricHistory.ectopic) updateData.obstetricHistory.ectopic = obstetricHistory.ectopic;
      if (obstetricHistory.sb_iod_dead) updateData.obstetricHistory.sb_iod_dead = obstetricHistory.sb_iod_dead;
    }

    if (wifeMedicalHistory) {
      updateData.wifeMedicalHistory = {};
      Object.keys(wifeMedicalHistory).forEach(key => {
        if (wifeMedicalHistory[key] !== undefined) {
          updateData.wifeMedicalHistory[key] = wifeMedicalHistory[key];
        }
      });
    }

    if (husbandMedicalHistory) {
      updateData.husbandMedicalHistory = {};
      Object.keys(husbandMedicalHistory).forEach(key => {
        if (husbandMedicalHistory[key] !== undefined) {
          updateData.husbandMedicalHistory[key] = husbandMedicalHistory[key];
        }
      });
    }

    const patientHistory = await PatientHistory.findOneAndUpdate(
      { patientId },
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!patientHistory) {
      return res.status(404).json({
        success: false,
        message: 'Patient history not found'
      });
    }

    // If consultationId is provided, update the consultation
    if (consultationId) {
      await Consultation.findByIdAndUpdate(consultationId, {
        patientHistoryId: patientHistory._id
      });
    }

    res.status(200).json({
      success: true,
      message: 'Patient history updated successfully',
      data: patientHistory
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating patient history',
      error: error.message
    });
  }
};

// Get Patient History by Patient ID
exports.getPatientHistoryByPatientId = async (req, res) => {

  try {
    const { page = 1, limit = 10 } = req.query;
    const { patientId } = req.params;

    const patientHistory = await PatientHistory.find({ patientId })
      .populate('patientId', 'name UHID age gender')
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await PatientHistory.countDocuments({ patientId: req.params.patientId });

    if (!patientHistory || patientHistory.length === 0) {
      return res.status(200).json({
        success: true,
        data: [],
        message: 'No patient history found for this patient',
        pagination: {
          total: 0,
          page: Number(page),
          pages: 0
        }
      });
    }

    res.status(200).json({
      success: true,
      data: patientHistory,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching consultations',
      error: error.message
    });
  }
};

// Delete Patient History
exports.deletePatientHistory = async (req, res) => {
  try {
    const { patientId } = req.params;

    const patientHistory = await PatientHistory.findOneAndDelete({ patientId });

    if (!patientHistory) {
      return res.status(404).json({
        success: false,
        message: 'Patient history not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Patient history deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting patient history:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting patient history',
      error: error.message
    });
  }
};

// Get All Patient Histories (with pagination and filters)
exports.getAllPatientHistories = async (req, res) => {
  try {
    const { page = 1, limit = 10, sortBy = 'createdAt', order = 'desc' } = req.query;

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { [sortBy]: order === 'desc' ? -1 : 1 },
      populate: [
        { path: 'patientId', select: 'name UHID age gender' },
        { path: 'createdBy', select: 'name email' },
        { path: 'updatedBy', select: 'name email' }
      ]
    };

    const patientHistories = await PatientHistory.paginate({}, options);

    res.status(200).json({
      success: true,
      data: patientHistories
    });
  } catch (error) {
    console.error('Error fetching patient histories:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching patient histories',
      error: error.message
    });
  }
};