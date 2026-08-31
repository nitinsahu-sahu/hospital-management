const PatientExamination = require('../models/PatientExamination');
const Patient = require('../models/User');
const Consultation = require('../models/Consultation');
const Relative = require('../models/Relative');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const { formatDateTime } = require('../utils/timeFormate');

const generatePatientExaminationPDF = async (data, res) => {
  const colors = {
    primary: '#1a5276',
    secondary: '#2e86c1',
    accent: '#1abc9c',
    lightBg: '#ebf5fb',
    border: '#aed6f1',
    text: '#2c3e50',
    lightText: '#5d6d7e',
    highlight: '#d4efdf',
    white: '#ffffff',
    tableHeader: '#2c3e50',
    tableBorder: '#dee2e6'
  };

  const doc = new PDFDocument({
    size: 'A4',
    margin: 14,
    bufferPages: true
  });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=patient_examination_${data.patient?.UH_ID || 'patient'}.pdf`);

  doc.pipe(res);

  // ===== HEADER FUNCTION =====
  const addHeader = () => {
    doc.rect(0, 0, doc.page.width, 45).fill(colors.primary);
    doc.rect(0, 75, doc.page.width, 1.5).fill(colors.accent);

    doc.fillColor(colors.white)
      .fontSize(12)
      .font('Helvetica-Bold')
      .text('Women & Fetal Care Clinic', 18, 8, { align: 'center' });

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
        'PATIENT EXAMINATION SUMMARY',
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
      .text('Women & Fetal Care Clinic', 18, footerY + 5);

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

  // ===== HELPER FUNCTIONS =====
  const getPatientField = (field, detailsField) => {
    if (field === 'other' && detailsField) {
      return `Other (${detailsField})`;
    }
    return field || 'N/A';
  };

  const formatDateTime = (date) => {
    if (!date) return 'N/A';
    const d = new Date(date);
    return d.toLocaleString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  // ===== PAGE 1 =====
  addHeader();

  let yPos = doc.y;

  // ===== 1. PATIENT DEMOGRAPHICS =====
  const titleY = yPos;
  doc.fillColor(colors.primary)
    .fontSize(12)
    .font('Helvetica-Bold')
    .text('Patient Demographics', 18, titleY);

  doc.fillColor(colors.lightText)
    .fontSize(10)
    .font('Helvetica')
    .text('Patient Examination Date & Time:', doc.page.width / 2 + 20, titleY, {
      continued: true,
      width: doc.page.width / 2 - 38,
      align: 'left'
    })
    .fillColor(colors.text)
    .font('Helvetica-Bold')
    .text(` ${formatDateTime(data.patientExamination?.createdAt)}`, {
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

  // ===== PATIENT EXAMINATION =====
  if (data.patientExamination) {
    doc.fillColor(colors.primary)
      .fontSize(11)
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

    // ===== 1. VITALS & PHYSICAL EXAMINATION =====
    const hasVitalsData = vitals.bp || vitals.pr || vitals.height || vitals.weight || vitals.bmi || vitals.abdominalExamination;

    if (hasVitalsData) {
      doc.fillColor(colors.primary)
        .fontSize(10)
        .font('Helvetica-Bold')
        .text('Vitals & Physical Examination', 18, yPos)
        .font('Helvetica')
        .fontSize(9);

      doc.fillColor(colors.text);
      yPos = doc.y + 5;

      let vitalsText = '';
      if (vitals.bp) vitalsText += `BP: ${vitals.bp}${vitals.bpUnit ? ` ${vitals.bpUnit}` : ''} | `;
      if (vitals.pr) vitalsText += `PR: ${vitals.pr}${vitals.prUnit ? ` ${vitals.prUnit}` : ''} | `;
      if (vitals.height) vitalsText += `Height: ${vitals.height}${vitals.heightUnit ? ` ${vitals.heightUnit}` : ''} | `;
      if (vitals.weight) vitalsText += `Weight: ${vitals.weight}${vitals.weightUnit ? ` ${vitals.weightUnit}` : ''}`;
      if (vitals.bmi) vitalsText += ` | BMI: ${vitals.bmi}${vitals.bmiUnit ? ` ${vitals.bmiUnit}` : ''}`;

      if (vitalsText) {
        doc.fillColor(colors.text)
          .fontSize(9)
          .text(vitalsText, 18, yPos, { width: doc.page.width - 36 });
        yPos = doc.y + 2;
      }

      if (vitals.abdominalExamination) {
        doc.fillColor(colors.lightText)
          .text('Abdomen:', 18, yPos, { continued: true })
          .fillColor(colors.text)
          .text(` ${vitals.abdominalExamination}`);
        yPos += 15;
      }
    }

    yPos += 5;

    // ===== 2. LOCAL EXAMINATION =====
    const hasLocalExam = vitals.localExamination &&
      (vitals.localExamination.perVaginalExamination || vitals.localExamination.perSpeculumExamination);

    if (hasLocalExam) {
      doc.fillColor(colors.primary)
        .fontSize(10)
        .font('Helvetica-Bold')
        .text('Local Examination', 18, yPos)
        .font('Helvetica')
        .fontSize(9);

      doc.fillColor(colors.text);
      yPos = doc.y + 5;

      
      if (vitals.localExamination.perVaginalExamination) {
        doc.fillColor(colors.lightText)
          .text('Per Vaginal:', 18, yPos, { continued: true })
          .fillColor(colors.text)
          .text(` ${vitals.localExamination.perVaginalExamination}`);
        yPos += 11;
      }

      if (vitals.localExamination.perSpeculumExamination) {
        doc.fillColor(colors.lightText)
          .text('Per Speculum:', 18, yPos, { continued: true })
          .fillColor(colors.text)
          .text(` ${vitals.localExamination.perSpeculumExamination}`);
        yPos += 11;
      }

      yPos += 5;
    }

    yPos += 5;

    // ===== 3. SYSTEM EXAMINATION =====
    const systems = [
      { label: 'CNS', value: exam.cns, details: exam.cnsDetails },
      { label: 'CVS', value: exam.cvs, details: exam.cvsDetails },
      { label: 'RS', value: exam.respiratorySystem, details: exam.respiratorySystemDetails },
      { label: 'GIT', value: exam.git, details: exam.gitDetails },
    ];

    const hasSystemData = systems.some(s => s.value);

    if (hasSystemData) {
      doc.fillColor(colors.primary)
        .fontSize(10)
        .font('Helvetica-Bold')
        .text('System Examination', 18, yPos)
        .font('Helvetica')
        .fontSize(9);

      doc.fillColor(colors.text);
      yPos = doc.y + 5;

      doc.rect(18, yPos - 4, doc.page.width - 36, 70)
        .fill(colors.lightBg)
        .stroke(colors.border);


      systems.forEach((system) => {
        if (system.value) {
          let displayText = '';
          if (system.value.toLowerCase() === 'abnormal') {
            displayText = `Abnormal${system.details ? ` (${system.details})` : ''}`;
          } else {
            displayText = system.value;
          }

          doc.fillColor(colors.lightText)
            .text(`${system.label}:`, 22, yPos, { continued: true })
            .fillColor(colors.text)
            .text(` ${displayText}`);
          yPos += 16;
        }
      });

      yPos += 5;
    }

    yPos += 5;

    // ===== 4. INVESTIGATIONS =====
    if (exam.investigations) {
      const inv = exam.investigations;
      const hasInvestigationData = inv.hiv || inv.hbsAg || inv.vdrl || inv.hcv || inv.bloodGroup ||
        inv.tsh || inv.rbs || inv.thalassemiaScreen || inv.karyotype || inv.prl ||
        inv.sgot || inv.dtah || inv.sgpt || inv.bun || inv.srCreatinine || inv.papTest ||
        inv.echocardiography;

      if (hasInvestigationData) {
        doc.fillColor(colors.primary)
          .fontSize(10)
          .font('Helvetica-Bold')
          .text('Investigations', 18, yPos);

        yPos = doc.y + 5;

        const investigations = [
          { label: 'HIV', value: inv.hiv },
          { label: 'HBsAg', value: inv.hbsAg },
          { label: 'VDRL', value: inv.vdrl },
          { label: 'HCV', value: inv.hcv },
          { label: 'Blood Group', value: inv.bloodGroup },
          { label: 'TSH', value: inv.tsh },
          { label: 'RBS', value: inv.rbs },
          { label: 'PRL', value: inv.prl },
          { label: 'SGOT', value: inv.sgot },
          { label: 'DTAH', value: inv.dtah },
          { label: 'SGPT', value: inv.sgpt },
          { label: 'BUN', value: inv.bun },
          { label: 'Sr Creatinine', value: inv.srCreatinine },
          { label: 'Thalassemia', value: inv.thalassemiaScreen },
          { label: 'Pap Test', value: inv.papTest },
          { label: 'Karyotype', value: inv.karyotype },
          { label: 'Echocardiography', value: inv.echocardiography }
        ];

        // Filter only items with values
        const filteredItems = investigations.filter(item => item.value);

        if (filteredItems.length > 0) {
          const itemsPerRow = 5;
          const rows = Math.ceil(filteredItems.length / itemsPerRow);
          const rowHeight = 15;
          const padding = 4;
          const boxHeight = rows * rowHeight + padding * 2;

          // Check if there's enough space for investigations, if not add new page
          if (yPos + boxHeight + 50 > doc.page.height - 60) {
            // Add footer to current page before new page
            addFooter();
            doc.addPage();
            addHeader();
            yPos = doc.y + 10;
          }

          doc.rect(18, yPos - 4, doc.page.width - 36, boxHeight)
            .fill(colors.lightBg)
            .stroke(colors.border);

          let currentY = yPos + padding;

          // Loop through rows
          for (let row = 0; row < rows; row++) {
            const startIndex = row * itemsPerRow;
            const endIndex = Math.min(startIndex + itemsPerRow, filteredItems.length);
            const rowItems = filteredItems.slice(startIndex, endIndex);

            // Calculate equal width for each item
            const totalWidth = doc.page.width - 50;
            const itemWidth = totalWidth / itemsPerRow;

            let currentX = 22;
            rowItems.forEach((item) => {
              // Draw label in light color
              doc.fillColor(colors.lightText)
                .fontSize(8.5)
                .font('Helvetica')
                .text(`${item.label}:`, currentX, currentY, {
                  width: itemWidth * 0.8,
                  continued: true
                });

              // Draw value in bold with primary color
              const valueX = currentX + (itemWidth * 0.1);
              doc.fillColor(colors.primary)
                .fontSize(8.5)
                .font('Helvetica-Bold')
                .text(item.value, valueX, currentY, {
                  width: itemWidth * 0.2
                });

              currentX += itemWidth;
            });

            currentY += rowHeight;
          }

          yPos += boxHeight + 2;
        }
      }
    }

    yPos += 5;

    // ===== 5. RUBELLA (Nested Object) =====
    if (exam.investigations?.rubella) {
      const rubella = exam.investigations.rubella;
      const hasRubellaData = rubella.igg || rubella.igm || rubella.amh || rubella.avidityTest;

      if (hasRubellaData) {
        // Check if there's enough space
        if (yPos + 40 > doc.page.height - 60) {
          addFooter();
          doc.addPage();
          addHeader();
          yPos = doc.y + 10;
        }

        doc.fillColor(colors.primary)
          .fontSize(10)
          .font('Helvetica-Bold')
          .text('Rubella Panel', 18, yPos);

        yPos = doc.y + 5;

        const rubellaParams = [];
        if (rubella.igg) rubellaParams.push(`IgG: ${rubella.igg}`);
        if (rubella.igm) rubellaParams.push(`IgM: ${rubella.igm}`);
        if (rubella.amh) rubellaParams.push(`AMH: ${rubella.amh}`);
        if (rubella.avidityTest) rubellaParams.push(`Avidity Test: ${rubella.avidityTest}`);

        if (rubellaParams.length > 0) {
          doc.rect(18, yPos - 4, doc.page.width - 36, 22)
            .fill(colors.lightBg)
            .stroke(colors.border);

          let rubellaText = rubellaParams.join('  |  ');
          doc.fillColor(colors.text)
            .fontSize(9)
            .font('Helvetica')
            .text(rubellaText, 22, yPos + 4, { width: doc.page.width - 50 });

          yPos += 24;
        }
      }
    }

    yPos += 5;

    // ===== 6. HSG (Nested Object) =====
    if (exam.investigations?.hsg) {
      const hsg = exam.investigations.hsg;
      if (hsg.year || hsg.finding) {
        // Check if there's enough space
        if (yPos + 40 > doc.page.height - 60) {
          addFooter();
          doc.addPage();
          addHeader();
          yPos = doc.y + 10;
        }

        doc.fillColor(colors.primary)
          .fontSize(10)
          .font('Helvetica-Bold')
          .text('HSG (Hysterosalpingography)', 18, yPos);

        yPos = doc.y + 5;

        doc.rect(18, yPos - 4, doc.page.width - 36, 22)
          .fill(colors.lightBg)
          .stroke(colors.border);

        let hsgText = '';
        if (hsg.year) hsgText += `Year: ${hsg.year}`;
        if (hsg.finding) hsgText += `${hsgText ? ' | ' : ''}Finding: ${hsg.finding}`;

        doc.fillColor(colors.text)
          .fontSize(9)
          .font('Helvetica')
          .text(hsgText, 22, yPos + 4, { width: doc.page.width - 50 });

        yPos += 24;
      }
    }

    yPos += 5;

    // ===== 7. MEDICAL HISTORY =====
    if (exam.medicalHistory) {
      const mh = exam.medicalHistory;
      if (mh.problem || mh.currentMedications) {
        // Check if there's enough space
        if (yPos + 60 > doc.page.height - 60) {
          addFooter();
          doc.addPage();
          addHeader();
          yPos = doc.y + 10;
        }

        doc.fillColor(colors.primary)
          .fontSize(10)
          .font('Helvetica-Bold')
          .text('Medical History', 18, yPos);

        yPos = doc.y + 5;

        doc.rect(18, yPos - 4, doc.page.width - 36, 40)
          .fill(colors.lightBg)
          .stroke(colors.border);

        if (mh.problem) {
          doc.fillColor(colors.lightText)
            .fontSize(9)
            .font('Helvetica')
            .text('Problem:', 22, yPos + 4, { continued: true })
            .fillColor(colors.text)
            .font('Helvetica-Bold')
            .text(` ${mh.problem}`);
          yPos += 15;
        }

        if (mh.currentMedications) {
          doc.fillColor(colors.lightText)
            .fontSize(9)
            .font('Helvetica')
            .text('Current Medications:', 22, yPos + 4, { continued: true })
            .fillColor(colors.text)
            .font('Helvetica-Bold')
            .text(` ${mh.currentMedications}`);
          yPos += 15;
        }

        yPos += 4;
      }
    }

    yPos += 15;
  }

  // Add footer to page 1 before adding surgical history page
  addFooter();

  // ===== 8. SURGICAL HISTORY ON NEW PAGE =====
  if (data.patientExamination?.surgicalHistory && data.patientExamination.surgicalHistory.length > 0) {
    // Add new page for surgical history
    doc.addPage();
    addHeader();
    
    let yPosSurgical = doc.y + 10;
    
    doc.fillColor(colors.primary)
      .fontSize(12)
      .font('Helvetica-Bold')
      .text('Surgical History', 18, yPosSurgical);

    yPosSurgical = doc.y + 10;

    // Table for surgical history
    const tableY = yPosSurgical;
    const rowHeight = 18;
    let rowY = tableY;

    // Table header
    doc.rect(18, rowY - 2, doc.page.width - 36, rowHeight)
      .fill(colors.tableHeader);

    doc.fillColor(colors.white)
      .fontSize(9)
      .font('Helvetica-Bold')
      .text('Surgery', 24, rowY + 2)
      .text('Year', 144, rowY + 2)
      .text('Details/Findings', 224, rowY + 2);

    rowY += rowHeight;

    // Table data
    data.patientExamination.surgicalHistory.forEach((surgery, index) => {
      const isEven = index % 2 === 0;
      doc.rect(18, rowY - 2, doc.page.width - 36, rowHeight)
        .fill(isEven ? colors.white : colors.lightBg)
        .stroke(colors.tableBorder);

      doc.fillColor(colors.text)
        .fontSize(8)
        .font('Helvetica')
        .text(surgery.surgery || 'N/A', 24, rowY + 2)
        .text(surgery.year || 'N/A', 144, rowY + 2)
        .text(surgery.detailsFinding || 'N/A', 224, rowY + 2, { width: doc.page.width - 242 });

      rowY += rowHeight;

      // Check if we need a new page for surgical history continuation
      if (rowY > doc.page.height - 100) {
        // Add footer to current surgical page
        addFooter();
        doc.addPage();
        addHeader();
        rowY = doc.y + 20;
        doc.rect(18, rowY - 2, doc.page.width - 36, rowHeight)
          .fill(colors.tableHeader);
        doc.fillColor(colors.white)
          .fontSize(9)
          .font('Helvetica-Bold')
          .text('Surgery', 24, rowY + 2)
          .text('Year', 144, rowY + 2)
          .text('Details/Findings', 224, rowY + 2);
        rowY += rowHeight;
      }
    });

    // Add footer to surgical history page
    addFooter();
  }

  // If no surgical history, the footer is already added above
  // If surgical history exists, we've already added the footer

  doc.end();
};

// Helper function to get all discharge data
const getPatientExaminationData = async (patientExaminationId) => {
  try {
    const patientExamination = await PatientExamination.findById(patientExaminationId)
      .populate('createdBy', '-password -__v')

    if (!patientExamination) {
      throw new Error('Patient History not found');
    }

    const patientId = patientExamination.patientId;

    const patient = await Patient.findById(patientId).select('-password -__v');

    const relative = await Relative.findOne({ UH_ID: patient?.UH_ID });

    const doctor = patientExamination.createdBy || null;

    return {
      patient,
      doctor,
      patientExamination,
      relative,
    };
  } catch (error) {
    console.error('Error fetching patient History data:', error);
    throw error;
  }
};

// Download pdf
exports.patientExaminationPdf = async (req, res) => {
  try {
    const { patientExaminationId } = req.params;

    const data = await getPatientExaminationData(patientExaminationId);
    if (!data.patientExamination) {
      return res.status(404).json({
        success: false,
        message: 'No patient examination summary found for this patient'
      });
    }

    await generatePatientExaminationPDF(data, res);
  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating PDF',
      error: error.message
    });
  }
};

// Create Patient Examination
exports.createPatientExamination = async (req, res) => {
  try {
    const {
      patientExaminationDate,
      patientId,
      vitals,
      cns,
      cnsDetails,
      cvs,
      cvsDetails,
      respiratorySystem,
      respiratorySystemDetails,
      git,
      gitDetails,
      investigations,
      medicalHistory,
      surgicalHistory
    } = req.body;

    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    const examination = new PatientExamination({
      patientId,
      patientExaminationDate: patientExaminationDate || new Date(),
      vitals: {
        pr: vitals?.pr || '',
        prUnit: vitals?.prUnit || 'bpm',
        bp: vitals?.bp || '',
        bpUnit: vitals?.bpUnit || 'mmHg',
        height: vitals?.height || '',
        heightUnit: vitals?.heightUnit || 'cm',
        weight: vitals?.weight || '',
        weightUnit: vitals?.weightUnit || 'kg',
        bmi: vitals?.bmi || '',
        bmiUnit: vitals?.bmiUnit || 'kg/m²',
        abdominalExamination: vitals?.abdominalExamination || '',
        localExamination: {
          perVaginalExamination: vitals?.localExamination?.perVaginalExamination || '',
          perSpeculumExamination: vitals?.localExamination?.perSpeculumExamination || ''
        }
      },
      cns: cns || '',
      cnsDetails: cns === 'abnormal' ? cnsDetails || '' : '',
      cvs: cvs || '',
      cvsDetails: cvs === 'abnormal' ? cvsDetails || '' : '',
      respiratorySystem: respiratorySystem || '',
      respiratorySystemDetails: respiratorySystem === 'abnormal' ? respiratorySystemDetails || '' : '',
      git: git || '',
      gitDetails: git === 'abnormal' ? gitDetails || '' : '',
      investigations: {
        bloodGroup: investigations?.bloodGroup || '',
        hiv: investigations?.hiv || '',
        tsh: investigations?.tsh || '',
        hbsAg: investigations?.hbsAg || '',
        rbs: investigations?.rbs || '',
        hcv: investigations?.hcv || '',
        prl: investigations?.prl || '',
        vdrl: investigations?.vdrl || '',
        sgot: investigations?.sgot || '',
        dtah: investigations?.dtah || '',
        sgpt: investigations?.sgpt || '',
        bun: investigations?.bun || '',
        srCreatinine: investigations?.srCreatinine || '',
        rubella: {
          igg: investigations?.rubella?.igg || '',
          igm: investigations?.rubella?.igm || '',
          amh: investigations?.rubella?.amh || '',
          avidityTest: investigations?.rubella?.avidityTest || ''
        },
        thalassemiaScreen: investigations?.thalassemiaScreen || '',
        papTest: investigations?.papTest || '',
        karyotype: investigations?.karyotype || '',
        hsg: {
          year: investigations?.hsg?.year || '',
          finding: investigations?.hsg?.finding || ''
        },
        echocardiography: investigations?.echocardiography || ''
      },
      medicalHistory: {
        problem: medicalHistory?.problem || '',
        currentMedications: medicalHistory?.currentMedications || ''
      },
      surgicalHistory: surgicalHistory || [],
      createdBy: req.user.id,
      updatedBy: req.user.id
    });

    await examination.save();

    res.status(201).json({
      success: true,
      message: 'Patient examination created successfully',
      data: examination
    });
  } catch (error) {
    console.error('Error creating patient examination:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating patient examination',
      error: error.message
    });
  }
};

// Get Patient Examination by Patient ID
exports.getPatientExaminationByPatientId = async (req, res) => {
  try {
    const { patientId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const examinations = await PatientExamination.find({ patientId })
      .populate('patientId', 'name UH_ID mobileNumber sex age')
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await PatientExamination.countDocuments({ patientId: req.params.patientId });

    if (!examinations || examinations.length === 0) {
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
      data: examinations,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching patient examination:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching patient examination',
      error: error.message
    });
  }
};

// Get Patient Examination by ID
exports.getPatientExaminationById = async (req, res) => {
  try {
    const { id } = req.params;

    const examination = await PatientExamination.findById(id)
      .populate('patientId', 'name UH_ID mobileNumber sex age')
      .populate('consultationId')
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');

    if (!examination) {
      return res.status(404).json({
        success: false,
        message: 'Patient examination not found'
      });
    }

    res.status(200).json({
      success: true,
      data: examination
    });
  } catch (error) {
    console.error('Error fetching patient examination:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching patient examination',
      error: error.message
    });
  }
};

// Update Patient Examination
exports.updatePatientExamination = async (req, res) => {
  try {
    const { patientId } = req.params;
    const {
      vitals,
      cns,
      cnsDetails,
      cvs,
      cvsDetails,
      respiratorySystem,
      respiratorySystemDetails,
      git,
      gitDetails
    } = req.body;

    // Find existing examination
    const existingExamination = await PatientExamination.findOne({ patientId });

    if (!existingExamination) {
      return res.status(404).json({
        success: false,
        message: 'Patient examination not found'
      });
    }

    // Build update object
    const updateData = {
      updatedBy: req.user.id
    };

    // Update vitals if provided
    if (vitals) {
      updateData.vitals = {};
      const vitalsFields = ['pr', 'prUnit', 'bp', 'bpUnit', 'height', 'heightUnit',
        'weight', 'weightUnit', 'bmi', 'bmiUnit', 'abdominalExamination'];

      vitalsFields.forEach(field => {
        if (vitals[field] !== undefined) {
          updateData.vitals[field] = vitals[field];
        }
      });

      // Handle local examination
      if (vitals.localExamination) {
        updateData.vitals.localExamination = {};
        if (vitals.localExamination.perVaginalExamination !== undefined) {
          updateData.vitals.localExamination.perVaginalExamination =
            vitals.localExamination.perVaginalExamination;
        }
        if (vitals.localExamination.perSpeculumExamination !== undefined) {
          updateData.vitals.localExamination.perSpeculumExamination =
            vitals.localExamination.perSpeculumExamination;
        }
      }
    }

    // Update CNS
    if (cns !== undefined) {
      updateData.cns = cns;
      updateData.cnsDetails = cns === 'abnormal' ? (cnsDetails || '') : '';
    } else if (cnsDetails !== undefined && existingExamination.cns === 'abnormal') {
      updateData.cnsDetails = cnsDetails;
    }

    // Update CVS
    if (cvs !== undefined) {
      updateData.cvs = cvs;
      updateData.cvsDetails = cvs === 'abnormal' ? (cvsDetails || '') : '';
    } else if (cvsDetails !== undefined && existingExamination.cvs === 'abnormal') {
      updateData.cvsDetails = cvsDetails;
    }

    // Update Respiratory System
    if (respiratorySystem !== undefined) {
      updateData.respiratorySystem = respiratorySystem;
      updateData.respiratorySystemDetails = respiratorySystem === 'abnormal' ? (respiratorySystemDetails || '') : '';
    } else if (respiratorySystemDetails !== undefined && existingExamination.respiratorySystem === 'abnormal') {
      updateData.respiratorySystemDetails = respiratorySystemDetails;
    }

    // Update GIT
    if (git !== undefined) {
      updateData.git = git;
      updateData.gitDetails = git === 'abnormal' ? (gitDetails || '') : '';
    } else if (gitDetails !== undefined && existingExamination.git === 'abnormal') {
      updateData.gitDetails = gitDetails;
    }

    const updatedExamination = await PatientExamination.findOneAndUpdate(
      { patientId },
      { $set: updateData },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Patient examination updated successfully',
      data: updatedExamination
    });
  } catch (error) {
    console.error('Error updating patient examination:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating patient examination',
      error: error.message
    });
  }
};

// Delete Patient Examination
exports.deletePatientExamination = async (req, res) => {
  try {
    const { id } = req.params;

    const examination = await PatientExamination.findByIdAndDelete(id);

    if (!examination) {
      return res.status(404).json({
        success: false,
        message: 'Patient examination not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Patient examination deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting patient examination:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting patient examination',
      error: error.message
    });
  }
};