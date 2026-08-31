const RelativeExamination = require('../models/RelativeExamination');
const Patient = require('../models/User');
const Relative = require('../models/Relative');

const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const { formatDateTime } = require('../utils/timeFormate');

const generateRelativeExaminationPDF = async (data, res) => {

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
        'RELATIVE EXAMINATION SUMMARY',
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

  // ===== PAGE 1 (Single Page) =====
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
    .text('Retative Examin. Date & Time:', doc.page.width / 2 + 20, titleY, {
      continued: true,
      width: doc.page.width / 2 - 38,
      align: 'left'
    })
    .fillColor(colors.text)
    .font('Helvetica-Bold')
    .text(` ${formatDateTime(data.relativeExamination?.createdAt)}`, {
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

  yPos += 12;

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

  yPos += 12;

  // ===== Relative EXAMINATION =====
  if (data.relativeExamination) {

    doc.fillColor(colors.primary)
      .fontSize(11)
      .font('Helvetica-Bold')
      .text('Relative Examination', 18, yPos)
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

    const exam = data.relativeExamination;
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

    // ===== INVESTIGATIONS =====
    if (exam.investigations) {
      const inv = exam.investigations;
      const hasInvestigationData = inv.hiv || inv.hbsAg || inv.vdrl || inv.hcv || inv.bloodGroup ||
        inv.tsh || inv.rbs || inv.thalassemiaScreen || inv.karyotype;

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
          { label: 'Thalassemia', value: inv.thalassemiaScreen },
          { label: 'Karyotype', value: inv.karyotype }
        ];

        // Filter only items with values
        const filteredItems = investigations.filter(item => item.value);

        if (filteredItems.length > 0) {
          const itemsPerRow = 5;
          const rows = Math.ceil(filteredItems.length / itemsPerRow);
          const rowHeight = 15;
          const padding = 4;
          const boxHeight = rows * rowHeight + padding * 2;

           // Card container with subtle styling
        doc.rect(18, yPos - 4, doc.page.width - 36, boxHeight)
          .fill(colors.lightBg)
          .stroke(colors.border);
          // doc.rect(18, yPos - 4, doc.page.width - 10, boxHeight)
          //   .fill(colors.lightBg)
          //   .stroke(colors.border);

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
                .fontSize(9)
                .font('Helvetica')
                .text(`${item.label}:`, currentX, currentY, {
                  width: itemWidth * 0.7,
                  continued: true
                });

              // Draw value in bold with primary color
              const valueX = currentX + (itemWidth * 0.1);
              doc.fillColor(colors.primary)
                .fontSize(8.5)
                .font('Helvetica-Bold')
                .text(item.value, valueX, currentY, {
                  width: itemWidth * 0.6
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

    // ===== SEMEN ANALYSIS =====
    if (exam.semenAnalysis) {
      const sa = exam.semenAnalysis;
      const hasSemenData = sa.count || sa.morphology || sa.motility || sa.hcv || sa.remark ||
        sa.dfi || sa.srFsh || sa.srTestosterone || sa.e2 || sa.sProlactin ||
        sa.karyotype || sa.yMicrosomeDeletion || sa.trusScrotalUsg || sa.testicularBiopsy;

      if (hasSemenData) {
        doc.fillColor(colors.primary)
          .fontSize(10)
          .font('Helvetica-Bold')
          .text('Semen Analysis', 18, yPos);

        yPos = doc.y + 5;

        // Card container with subtle styling
        doc.rect(18, yPos - 4, doc.page.width - 36, 120)
          .fill(colors.lightBg)
          .stroke(colors.border);

        // ===== Group 1: Basic Parameters =====
        const basicParams = [];
        if (sa.count) basicParams.push(`Count: ${sa.count}${sa.countUnit ? ` ${sa.countUnit}` : ''}`);
        if (sa.morphology) basicParams.push(`Morphology: ${sa.morphology}%`);
        if (sa.motility) basicParams.push(`Motility: ${sa.motility}${sa.motilityUnit ? ` ${sa.motilityUnit}` : ''}`);

        if (basicParams.length > 0) {
          doc.fillColor(colors.secondary)
            .fontSize(8.5)
            .font('Helvetica-Bold')
            .text('Basic Parameters', 22, yPos + 2);

          yPos += 12;

          let basicText = basicParams.join('  |  ');
          doc.fillColor(colors.text)
            .fontSize(9)
            .font('Helvetica')
            .text(basicText, 22, yPos, { width: doc.page.width - 50 });

          yPos += 14;
        }

        // ===== Group 2: Hormonal & Special Tests =====
        const hormonalParams = [];
        if (sa.dfi) hormonalParams.push(`DFI: ${sa.dfi}${sa.dfiUnit ? ` ${sa.dfiUnit}` : ''}`);
        if (sa.hcv) hormonalParams.push(`HCV: ${sa.hcv}`);
        if (sa.srFsh) hormonalParams.push(`srFSH: ${sa.srFsh}`);
        if (sa.srTestosterone) hormonalParams.push(`srTestosterone: ${sa.srTestosterone}`);
        if (sa.e2) hormonalParams.push(`E2: ${sa.e2}`);
        if (sa.sProlactin) hormonalParams.push(`sProlactin: ${sa.sProlactin}`);

        if (hormonalParams.length > 0) {
          doc.fillColor(colors.secondary)
            .fontSize(8.5)
            .font('Helvetica-Bold')
            .text('Hormonal & Special Tests', 22, yPos + 2);

          yPos += 14;

          let hormonalText = hormonalParams.join('  |  ');
          doc.fillColor(colors.text)
            .fontSize(9)
            .font('Helvetica')
            .text(hormonalText, 22, yPos, { width: doc.page.width - 50 });

          yPos += 16;
        }

        // ===== Group 3: Genetic & Advanced Tests =====
        const geneticParams = [];
        if (sa.karyotype) geneticParams.push(`Karyotype: ${sa.karyotype}`);
        if (sa.yMicrosomeDeletion) geneticParams.push(`Y Microsome Deletion: ${sa.yMicrosomeDeletion}`);
        if (sa.trusScrotalUsg) geneticParams.push(`TRUS/Scrotal USG: ${sa.trusScrotalUsg}`);
        if (sa.testicularBiopsy) geneticParams.push(`Testicular Biopsy: ${sa.testicularBiopsy}`);

        if (geneticParams.length > 0) {
          doc.fillColor(colors.secondary)
            .fontSize(8.5)
            .font('Helvetica-Bold')
            .text('Genetic & Advanced Tests', 22, yPos + 2);

          yPos += 14;

          let geneticText = geneticParams.join('  |  ');
          doc.fillColor(colors.text)
            .fontSize(9)
            .font('Helvetica')
            .text(geneticText, 22, yPos, { width: doc.page.width - 50 });

          yPos += 16;
        }

        // ===== Remark =====
        if (sa.remark) {
          doc.fillColor(colors.secondary)
            .fontSize(9)
            .font('Helvetica-Bold')
            .text('Remark:', 22, yPos + 2)
            .fillColor(colors.text)
            .font('Helvetica')
            .text(` ${sa.remark}`);
          yPos += 15;
        }

        // Calculate total height and update yPos
        yPos += 8;
      }
    }

    yPos +=15;

    // ===== 2. MEDICAL HISTORY =====
    if (exam.medicalHistory) {
      const mh = exam.medicalHistory;
      if (mh.problem || mh.currentMedications) {
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

    yPos += 10;


    // ===== 3.SURGICAL HISTORY IN TABLE =====
    if (exam.surgicalHistory && exam.surgicalHistory.length > 0) {
      doc.fillColor(colors.primary)
        .fontSize(10)
        .font('Helvetica-Bold')
        .text('Surgical History', 18, yPos);

      yPos = doc.y + 5;

      // Table for surgical history
      const tableY = yPos;
      const colWidths = [120, 80, doc.page.width - 218];
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
      exam.surgicalHistory.forEach((surgery, index) => {
        const isEven = index % 2 === 0;
        doc.rect(18, rowY - 2, doc.page.width - 36, rowHeight)
          .fill(isEven ? colors.white : colors.white)
          .stroke(colors.tableBorder);

        doc.fillColor(colors.text)
          .fontSize(8)
          .font('Helvetica')
          .text(surgery.surgery || 'N/A', 24, rowY + 2)
          .text(surgery.year || 'N/A', 144, rowY + 2)
          .text(surgery.detailsFinding || 'N/A', 224, rowY + 2, { width: doc.page.width - 242 });

        rowY += rowHeight;

        // Check if we need a new page
        if (rowY > doc.page.height - 100) {
          doc.addPage();
          addHeader();
          // Recalculate positions
          rowY = doc.y + 20;
          // Redraw header with adjusted positions
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

      // yPos = rowY + 8;
    }

    yPos += 55;

    // ===== 4. SYSTEM EXAMINATION =====
    const systems = [
      { label: 'CNS', value: exam.cns, details: exam.cnsDetails },
      { label: 'CVS', value: exam.cvs, details: exam.cvsDetails },
      { label: 'RS', value: exam.respiratorySystem, details: exam.respiratorySystemDetails },
      { label: 'GIT', value: exam.git, details: exam.gitDetails },
    ];

    const hasSystemData = systems.some(s => s.value);

    if (hasSystemData) {
      doc.fillColor(colors.primary)
        .fontSize(11)
        .font('Helvetica-Bold')
        .text('System Examination', 18, yPos)
        .font('Helvetica')
        .fontSize(10);

      doc.fillColor(colors.text);
      yPos = doc.y + 5;

      systems.forEach((system) => {
        if (system.value) {
          let displayText = '';
          if (system.value.toLowerCase() === 'abnormal') {
            displayText = `Abnormal${system.details ? ` (${system.details})` : ''}`;
          } else {
            displayText = system.value;
          }

          doc.fillColor(colors.lightText)
            .text(`${system.label}:`, 18, yPos, { continued: true })
            .fillColor(colors.text)
            .text(` ${displayText}`);
          yPos += 16;
        }
      });

      yPos += 5;
    }
  }

  yPos += 15;

  // ===== FOOTER =====
  addFooter();

  doc.end();
};

// Helper function to get all discharge data
const getRelativeExaminationData = async (relativeExaminationId) => {
  try {
    const relativeExamination = await RelativeExamination.findById(relativeExaminationId)
      .populate('createdBy', '-password -__v')

    if (!relativeExamination) {
      throw new Error('Relative examination not found');
    }

    const patientId = relativeExamination.patientId;

    const patient = await Patient.findById(patientId).select('-password -__v');

    const relative = await Relative.findOne({ UH_ID: patient?.UH_ID });

    const doctor = relativeExamination.createdBy || null;

    return {
      patient,
      doctor,
      relativeExamination,
      relative,
    };
  } catch (error) {
    console.error('Error fetching relative examination data:', error);
    throw error;
  }
};

// Download pdf
exports.relativeExaminationPdf = async (req, res) => {
  try {
    const { relativeExaminationId } = req.params;

    const data = await getRelativeExaminationData(relativeExaminationId);

    if (!data.relativeExamination) {
      return res.status(404).json({
        success: false,
        message: 'No patient examination summary found for this patient'
      });
    }

    await generateRelativeExaminationPDF(data, res);
  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating PDF',
      error: error.message
    });
  }
};

// Create Relative Examination
exports.createRelativeExamination = async (req, res) => {
  try {
    const {
      relativeExaminationDate,
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
      semenAnalysis,
      medicalHistory,
      surgicalHistory
    } = req.body;
    const { patientId, relativeId } = req.params;

    // Check if patient exists
    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    // Check if relative exists
    const relative = await Relative.findById(relativeId);
    if (!relative) {
      return res.status(404).json({
        success: false,
        message: 'Relative not found'
      });
    }

    // Check if relative belongs to this patient
    if (relative.UH_ID !== patient.UH_ID) {
      return res.status(400).json({
        success: false,
        message: 'Relative does not belong to this patient'
      });
    }

    const examination = new RelativeExamination({
      patientId,
      relativeId,
      relativeExaminationDate: relativeExaminationDate || new Date(),
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
        hiv: investigations?.hiv || '',
        hbsAg: investigations?.hbsAg || '',
        vdrl: investigations?.vdrl || '',
        hcv: investigations?.hcv || '',
        bloodGroup: investigations?.bloodGroup || '',
        tsh: investigations?.tsh || '',
        rbs: investigations?.rbs || '',
        thalassemiaScreen: investigations?.thalassemiaScreen || '',
        karyotype: investigations?.karyotype || ''
      },
      semenAnalysis: {
        count: semenAnalysis?.count || '',
        countUnit: semenAnalysis?.countUnit || 'mil/ml',
        morphology: semenAnalysis?.morphology || '',
        motility: semenAnalysis?.motility || '',
        motilityUnit: semenAnalysis?.motilityUnit || '%',
        hcv: semenAnalysis?.hcv || '',
        remark: semenAnalysis?.remark || '',
        dfi: semenAnalysis?.dfi || '',
        dfiUnit: semenAnalysis?.dfiUnit || '%',
        srFsh: semenAnalysis?.srFsh || '',
        srTestosterone: semenAnalysis?.srTestosterone || '',
        e2: semenAnalysis?.e2 || '',
        sProlactin: semenAnalysis?.sProlactin || '',
        karyotype: semenAnalysis?.karyotype || '',
        yMicrosomeDeletion: semenAnalysis?.yMicrosomeDeletion || '',
        trusScrotalUsg: semenAnalysis?.trusScrotalUsg || '',
        testicularBiopsy: semenAnalysis?.testicularBiopsy || ''
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
      message: 'Relative examination created successfully',
      data: examination
    });
  } catch (error) {
    console.error('Error creating relative examination:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating relative examination',
      error: error.message
    });
  }
};

// Get Relative Examination by Patient ID
exports.getRelativeExaminationByPatientId = async (req, res) => {
  try {
    const { patientId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const examinations = await RelativeExamination.find({ patientId })
      .populate('patientId', 'name UH_ID mobileNumber sex age')
      .populate('relativeId', 'name role mobileNumber sex')
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await RelativeExamination.countDocuments({ patientId: req.params.patientId });


    if (!examinations || examinations.length === 0) {
      return res.status(200).json({
        success: true,
        data: [],
        message: 'No relative found for this patient',
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
    console.error('Error fetching relative examinations:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching relative examinations',
      error: error.message
    });
  }
};

// Get Relative Examination by Relative ID
exports.getRelativeExaminationByRelativeId = async (req, res) => {
  try {
    const { relativeId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const examinations = await RelativeExamination.findOne({ relativeId })
      .populate('patientId', 'name UH_ID mobileNumber sex age')
      .populate('relativeId', 'name role mobileNumber sex')
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');

    const total = await RelativeExamination.countDocuments({ patientId: req.params.patientId });


    if (!examinations || examinations.length === 0) {
      return res.status(200).json({
        success: true,
        data: [],
        message: 'No relative found for this patient',
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
    console.error('Error fetching relative examination:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching relative examination',
      error: error.message
    });
  }
};

// Get Relative Examination by ID
exports.getRelativeExaminationById = async (req, res) => {
  try {
    const { id } = req.params;

    const examination = await RelativeExamination.findById(id)
      .populate('patientId', 'name UH_ID mobileNumber sex age')
      .populate('relativeId', 'name role mobileNumber sex')
      .populate('consultationId')
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');

    if (!examination) {
      return res.status(404).json({
        success: false,
        message: 'Relative examination not found'
      });
    }

    res.status(200).json({
      success: true,
      data: examination
    });
  } catch (error) {
    console.error('Error fetching relative examination:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching relative examination',
      error: error.message
    });
  }
};

// Update Relative Examination
exports.updateRelativeExamination = async (req, res) => {
  try {
    const { relativeId } = req.params;
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
    const existingExamination = await RelativeExamination.findOne({ relativeId });

    if (!existingExamination) {
      return res.status(404).json({
        success: false,
        message: 'Relative examination not found'
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

    const updatedExamination = await RelativeExamination.findOneAndUpdate(
      { relativeId },
      { $set: updateData },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Relative examination updated successfully',
      data: updatedExamination
    });
  } catch (error) {
    console.error('Error updating relative examination:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating relative examination',
      error: error.message
    });
  }
};

// Delete Relative Examination
exports.deleteRelativeExamination = async (req, res) => {
  try {
    const { id } = req.params;

    const examination = await RelativeExamination.findByIdAndDelete(id);

    if (!examination) {
      return res.status(404).json({
        success: false,
        message: 'Relative examination not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Relative examination deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting relative examination:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting relative examination',
      error: error.message
    });
  }
};