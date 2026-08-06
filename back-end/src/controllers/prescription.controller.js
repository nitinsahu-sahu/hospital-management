const Patient = require('../models/User.js');
const Prescription = require('../models/Prescription.js');
const Relative = require('../models/Relative');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const { formatDateTime } = require('../utils/timeFormate');

const generatePrescriptionPDF = async (data, res) => {

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
        'PRESCRIPTIONS SUMMARY',
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
    .text('Prescription Date & Time:', doc.page.width / 2 + 20, titleY, {
      continued: true,
      width: doc.page.width / 2 - 38,
      align: 'left'
    })
    .fillColor(colors.text)
    .font('Helvetica-Bold')
    .text(` ${formatDateTime(data.prescription?.createdAt)}`, {
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

  // ===== PRESCRIPTIONS =====
  if (data.prescription?.medications?.length > 0) {
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
    const col1 = 22;      // # - 18px
    const col2 = 42;      // Drug Name - 170px
    const col3 = 200;     // Dosage - 60px
    const col4 = 260;     // Frequency - 85px
    const col5 = 340;     // Duration - 60px
    const col6 = 400;     // Route - 60px
    const col7 = 493;     // Instructions - remaining space
    // const tableX = 22;
    // const col1 = 22;
    // const col2 = 40;
    // const col3 = 210;
    // const col4 = 270;
    // const col5 = 380;
    // const col6 = 440;

    doc.rect(tableX, yPos - 5, doc.page.width - 44, 18)
      .fill(colors.lightBg)
      .stroke(colors.border);

    // Header
    doc.fillColor(colors.primary)
      .fontSize(11)
      .font('Helvetica-Bold')
      .text('#', col1, yPos, { width: 18, align: 'center' })
      .text('Drug Name', col2, yPos, { width: 170 })
      .text('Dosage', col3, yPos, { width: 60 })
      .text('Frequency', col4, yPos, { width: 85 })
      .text('Duration', col5, yPos, { width: 60 })
      .text('Route', col6, yPos, { width: 60 })
      .text('Instructions', col7, yPos, { width: 90 }); // Naya column

    yPos = doc.y + 2;

    doc.fillColor(colors.text)
      .fontSize(11)
      .font('Helvetica');

    const meds = data.prescription.medications;
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
        .fontSize(7)
        .text(`${idx + 1}`, col1, yPos, { width: 18, align: 'center' })
        .text(drugName, col2, yPos, { width: 165 })
        .text(med.dosage ? `${med.dosage} mg` : 'N/A', col3, yPos)
        .text(med.frequency || 'N/A', col4, yPos, { width: 105 })
        .text(med.duration ? `${med.duration} days` : 'N/A', col5, yPos)
        .text(med.route || 'N/A', col6, yPos, { width: 90 })
        .text(med.instructions || 'N/A', col7, yPos, { width: 90 });

      yPos += 15;
    });

    doc.strokeColor(colors.border)
      .lineWidth(0.4)
      .moveTo(tableX, yPos)
      .lineTo(doc.page.width - 22, yPos)
      .stroke();
  }

  yPos += 15;

  if (data.prescription?.specialInstructions) {

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

    const instrText = data.prescription.specialInstructions;
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

  yPos += 15;

  // ===== FOOTER =====
  addFooter();

  doc.end();
};

// Helper function to get all discharge data
const getPrescriptionData = async (prescriptionId) => {
  try {
    const prescription = await Prescription.findById(prescriptionId)
      .populate('createdBy', '-password -__v')

    if (!prescription) {
      throw new Error('Patient History not found');
    }

    const patientId = prescription.patientId;

    const patient = await Patient.findById(patientId).select('-password -__v');

    const relative = await Relative.findOne({ UH_ID: patient?.UH_ID });

    const doctor = prescription.createdBy || null;

    return {
      patient,
      doctor,
      prescription,
      relative,
    };
  } catch (error) {
    console.error('Error fetching patient History data:', error);
    throw error;
  }
};

// Download pdf
exports.prescriptionPdf = async (req, res) => {
  try {
    const { prescriptionId } = req.params;

    const data = await getPrescriptionData(prescriptionId);

    if (!data.prescription) {
      return res.status(404).json({
        success: false,
        message: 'No prescription summary found for this patient'
      });
    }

    await generatePrescriptionPDF(data, res);
  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating PDF',
      error: error.message
    });
  }
};

// ✅ Create Prescription
exports.createPrescription = async (req, res) => {
  try {
    const {
      patientId,
      medications,
      specialInstructions,
    } = req.body;

    // Validate patient exists
    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient not found",
      });
    }

    // Validate medications array
    if (!medications || medications.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one medication is required",
      });
    }

    const prescription = new Prescription({
      patientId,
      medications,
      specialInstructions,
      createdBy: req.user.id,
      updatedBy: req.user.id
    });

    await prescription.save();

    // Populate patient details
    await prescription.populate("patientId", "name patientId mobile gender age");

    res.status(201).json({
      success: true,
      message: "Prescription created successfully",
      data: prescription,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ✅ Get Prescriptions by Patient
exports.getPrescriptionsByPatient = async (req, res) => {
  try {
    const { patientId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const prescription = await Prescription.find({ patientId })
      .populate('patientId', 'name UHID age gender')
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Prescription.countDocuments({ patientId: req.params.patientId });

    if (!prescription || prescription.length === 0) {
      return res.status(200).json({
        success: true,
        data: [],
        message: 'No prescription found for this patient',
        pagination: {
          total: 0,
          page: Number(page),
          pages: 0
        }
      });
    }

    res.status(200).json({
      success: true,
      data: prescription,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching prescription',
      error: error.message
    });
  }
};

// ✅ Update Prescription
exports.updatePrescription = async (req, res) => {
  try {
    const { patientId, medications, ...updateData } = req.body;

    // If patientId is provided, validate
    if (patientId) {
      const patient = await Patient.findById(patientId);
      if (!patient) {
        return res.status(404).json({
          success: false,
          message: "Patient not found",
        });
      }
      updateData.patientId = patientId;
    }

    // If medications provided, validate
    if (medications) {
      if (!Array.isArray(medications) || medications.length === 0) {
        return res.status(400).json({
          success: false,
          message: "At least one medication is required",
        });
      }
      updateData.medications = medications;
    }

    const prescription = await Prescription.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate("patientId", "name patientId mobile gender age")

    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: "Prescription not found",
      });
    }

    res.json({
      success: true,
      message: "Prescription updated successfully",
      data: prescription,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};