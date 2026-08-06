const RelativeExamination = require('../models/RelativeExamination');
const Patient = require('../models/User');
const Relative = require('../models/Relative');
const Consultation = require('../models/Consultation');

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
  doc.fillColor(colors.primary)
    .fontSize(12)
    .font('Helvetica-Bold')
    .text('Patient Demographics', 18, titleY);

  doc.fillColor(colors.lightText)
    .fontSize(10)
    .font('Helvetica')
    .text('Retative Examination Date & Time:', doc.page.width / 2 + 20, titleY, {
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
        .fontSize(11)
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
          .fontSize(10)
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

    // ===== 2. SYSTEM EXAMINATION =====
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
          yPos += 25;
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
      gitDetails
    } = req.body;
    const { patientId, relativeId } = req.params
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
      relativeExaminationDate,
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
        abdominalExamination: vitals?.abdominalExamination || ''
      },
      cns: cns || '',
      cnsDetails: cns === 'abnormal' ? cnsDetails || '' : '',
      cvs: cvs || '',
      cvsDetails: cvs === 'abnormal' ? cvsDetails || '' : '',
      respiratorySystem: respiratorySystem || '',
      respiratorySystemDetails: respiratorySystem === 'abnormal' ? respiratorySystemDetails || '' : '',
      git: git || '',
      gitDetails: git === 'abnormal' ? gitDetails || '' : '',
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