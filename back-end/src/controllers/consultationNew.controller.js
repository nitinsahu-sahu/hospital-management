const Consultation = require('../models/Consultation');
const User = require('../models/User');
const Relative = require('../models/Relative');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const { sendResponse } = require('../utils/response');
const { formatDateTime } = require('../utils/timeFormate');



const generateConsultantPDF = async (data, res) => {
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
        'DOCTOR CONSULTATION SUMMARY',
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
    .text('Consultation Date & Time:', doc.page.width / 2 + 20, titleY, {
      continued: true,
      width: doc.page.width / 2 - 38,
      align: 'left'
    })
    .fillColor(colors.text)
    .font('Helvetica-Bold')
    .text(` ${formatDateTime(data.consultation?.createdAt)}`, {
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

  // ===== 3. CONSULTATION FEES =====
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

  // ===== 4. GRAND TOTAL =====
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

  // ===== FOOTER =====
  addFooter();

  doc.end();
};

// Helper function to get all discharge data
const getConsultationData = async (consultationId) => {
  try {
    const consultation = await Consultation.findById(consultationId)
      .populate('createdBy', '-password -__v')

    if (!consultation) {
      throw new Error('Consultation not found');
    }

    const patientId = consultation.patientId;

    const patient = await User.findById(patientId).select('-password -__v');

    const relative = await Relative.findOne({ UH_ID: patient?.UH_ID });

    const doctor = consultation.createdBy || null;

    return {
      patient,
      doctor,
      consultation,
      relative,
    };
  } catch (error) {
    console.error('Error fetching consultation data:', error);
    throw error;
  }
};

// Download pdf
exports.consultationPdf = async (req, res) => {
  try {
    const { consultantaionId } = req.params;

    const data = await getConsultationData(consultantaionId);
    if (!data.consultation) {
      return res.status(404).json({
        success: false,
        message: 'No consultation summary found for this patient'
      });
    }

    await generateConsultantPDF(data, res);
  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating PDF',
      error: error.message
    });
  }
};

// Create new consultation
exports.createConsultation = async (req, res) => {
  try {
    const { patientId, fees, consultationDate, doctorNotes, diagnosis } = req.body;
    const userId = req.user.id;

    const consultation = new Consultation({
      patientId,
      consultationDate: consultationDate || new Date(),
      doctorNotes: doctorNotes || '',
      diagnosis: diagnosis || '',
      fees: {
        freeOfCost: fees?.freeOfCost || 0,
        emergencyConsultationFee: fees?.emergencyConsultationFee || 0,
        geneticConsultationFee: fees?.geneticConsultationFee || 0,
        opdConsultationFee: fees?.opdConsultationFee || 0,
        additionalFees: fees?.additionalFees || []
      },
      createdBy: userId,
      updatedBy: userId
    });

    await consultation.save();

    return sendResponse(res, true, 'Consultation created successfully', consultation, 201);
  } catch (error) {
    return sendResponse(res, false, 'Error creating consultation', error.message, 500);
  }
};

// Get all consultations
exports.getAllConsultations = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const query = {};

    if (status) {
      query.status = status;
    }

    const consultations = await Consultation.find(query)
      .populate('patientId', 'name email uhid phone')
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .sort({ consultationDate: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Consultation.countDocuments(query);

    res.status(200).json({
      success: true,
      data: consultations,
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

// Get all consultations by patient ID
exports.getConsultationsByPatientId = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const consultations = await Consultation.find({ patientId: req.params.patientId })
      .populate('patientId', 'name email UH_ID phone')
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .sort({ consultationDate: -1, createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Consultation.countDocuments({ patientId: req.params.patientId });

    if (!consultations || consultations.length === 0) {
      return res.status(200).json({
        success: true,
        data: [],
        message: 'No consultations found for this patient',
        pagination: {
          total: 0,
          page: Number(page),
          pages: 0
        }
      });
    }

    res.status(200).json({
      success: true,
      data: consultations,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.log("eror", error);

    res.status(500).json({
      success: false,
      message: 'Error fetching consultations',
      error: error.message
    });
  }
};

// Get single consultation
exports.getConsultation = async (req, res) => {
  try {
    const consultation = await Consultation.findById(req.params.id)
      .populate('patientId')
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');

    if (!consultation) {
      return res.status(404).json({
        success: false,
        message: 'Consultation not found'
      });
    }

    res.status(200).json({
      success: true,
      data: consultation
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching consultation',
      error: error.message
    });
  }
};

// Update consultation
exports.updateConsultation = async (req, res) => {
  try {
    const userId = req.user.id;
    const { fees, totalAmount, consultationDate, doctorNotes, diagnosis, status } = req.body;

    const updateData = {
      updatedBy: userId
    };

    if (fees) {
      updateData.fees = {
        freeOfCost: fees.freeOfCost || 0,
        emergencyConsultationFee: fees.emergencyConsultationFee || 0,
        geneticConsultationFee: fees.geneticConsultationFee || 0,
        opdConsultationFee: fees.opdConsultationFee || 0,
        additionalFees: fees.additionalFees || []
      };
    }

    if (totalAmount !== undefined) updateData.totalAmount = totalAmount;
    if (consultationDate) updateData.consultationDate = consultationDate;
    if (doctorNotes !== undefined) updateData.doctorNotes = doctorNotes;
    if (diagnosis !== undefined) updateData.diagnosis = diagnosis;
    if (status) updateData.status = status;

    const consultation = await Consultation.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!consultation) {
      return res.status(404).json({
        success: false,
        message: 'Consultation not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Consultation updated successfully',
      data: consultation
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating consultation',
      error: error.message
    });
  }
};

// Add additional fee to specific consultation
exports.addAdditionalFee = async (req, res) => {
  try {
    const { name, amount } = req.body;
    const userId = req.user.id;

    const consultation = await Consultation.findById(req.params.id);

    if (!consultation) {
      return res.status(404).json({
        success: false,
        message: 'Consultation not found'
      });
    }

    consultation.fees.additionalFees.push({ name, amount });
    consultation.updatedBy = userId;
    await consultation.save();

    res.status(200).json({
      success: true,
      message: 'Additional fee added successfully',
      data: consultation
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error adding additional fee',
      error: error.message
    });
  }
};

// Delete consultation
exports.deleteConsultation = async (req, res) => {
  try {
    const consultation = await Consultation.findByIdAndDelete(req.params.id);

    if (!consultation) {
      return res.status(404).json({
        success: false,
        message: 'Consultation not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Consultation deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting consultation',
      error: error.message
    });
  }
};

// Get consultation statistics for a patient
exports.getPatientConsultationStats = async (req, res) => {
  try {
    const patientId = req.params.patientId;

    const stats = await Consultation.aggregate([
      { $match: { patientId: mongoose.Types.ObjectId(patientId) } },
      {
        $group: {
          _id: null,
          totalConsultations: { $sum: 1 },
          totalAmount: { $sum: '$totalAmount' },
          averageAmount: { $avg: '$totalAmount' },
          lastConsultation: { $max: '$consultationDate' }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: stats[0] || {
        totalConsultations: 0,
        totalAmount: 0,
        averageAmount: 0,
        lastConsultation: null
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics',
      error: error.message
    });
  }
};