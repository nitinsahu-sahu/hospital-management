const Investigation = require('../models/Investigation');
const mongoose = require('mongoose');
const Patient = require('../models/User');
const Relative = require('../models/Relative');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const { formatDateTime } = require('../utils/timeFormate');

// Create new investigation
exports.createInvestigation = async (req, res) => {

  try {
    const { patientId, category, subCategory, investigations, totalAmount } = req.body;
    const userId = req.user?.id;

    const investigation = new Investigation({
      patientId,
      category, subCategory,
      investigations,
      totalAmount,
      createdBy: userId,
      updatedBy: userId
    });

    await investigation.save();

    res.status(201).json({
      success: true,
      message: 'Investigation created successfully',
      data: investigation
    });
  } catch (error) {
    console.error('Error creating investigation:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating investigation',
      error: error.message
    });
  }
};

const generateUltrasoundPDF = async (data, res) => {

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
        'INVESTIGATION(ULTRASOUND) SUMMARY',
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
    .text('Ultrasound Date & Time:', doc.page.width / 2 + 20, titleY, {
      continued: true,
      width: doc.page.width / 2 - 38,
      align: 'left'
    })
    .fillColor(colors.text)
    .font('Helvetica-Bold')
    .text(` ${formatDateTime(data.ultrasoundData?.createdAt)}`, {
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

  // ===== INVESTIGATIONS =====

  const hasInvestigations = data.ultrasoundData;

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

      // Table Header
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

      // Table Rows
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

      // Separator line before total
      doc.strokeColor(colors.border)
        .lineWidth(0.4)
        .moveTo(tableX, yPos)
        .lineTo(doc.page.width - 22, yPos)
        .stroke();

      yPos += 5;

      // ===== TOTAL AMOUNT ROW =====
      doc.rect(tableX, yPos - 2, doc.page.width - 44, 22)
        .fill(colors.highlight)
        .stroke(colors.accent);

      // Calculate total
      const totalAmount = items.reduce((sum, item) => sum + (item.price || 0), 0);

      doc.fillColor(colors.primary)
        .fontSize(12)
        .font('Helvetica-Bold')
        .text('TOTAL', col2, yPos + 3)
        .text(`Rs. ${totalAmount.toLocaleString()}/-`, doc.page.width - 150, yPos + 3, { align: 'center' });

      yPos += 25;
    };

    if (data.ultrasoundData?.investigations?.length > 0) {
      renderInvestigationTable('Ultrasound Investigations', data.ultrasoundData, data.ultrasoundData.investigations);
    }
    yPos += 8;
  }

  yPos += 15;

  // ===== FOOTER =====
  addFooter();

  doc.end();

};

// Helper function to get all discharge data
const getUltrasound = async (patientHistoryId) => {
  try {
    const ultrasoundData = await Investigation.findById(patientHistoryId)
      .populate('createdBy', '-password -__v')

    if (!ultrasoundData) {
      throw new Error('Patient History not found');
    }

    const patientId = ultrasoundData.patientId;

    const patient = await Patient.findById(patientId).select('-password -__v');

    const relative = await Relative.findOne({ UH_ID: patient?.UH_ID });

    const doctor = ultrasoundData.createdBy || null;

    return {
      patient,
      doctor,
      ultrasoundData,
      relative,
    };
  } catch (error) {
    console.error('Error fetching patient History data:', error);
    throw error;
  }
};

// Download pdf
exports.investigationPdf = async (req, res) => {
  try {
    const { investigationId } = req.params;

    const data = await getUltrasound(investigationId);

    if (!data.ultrasoundData) {
      return res.status(404).json({
        success: false,
        message: 'No ultrasound summary found for this patient'
      });
    }

    await generateUltrasoundPDF(data, res);
  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating PDF',
      error: error.message
    });
  }
};



// Get investigation by patient ID
exports.getInvestigationByPatientId = async (req, res) => {
  try {
    const { patientId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const investigation = await Investigation.find({ patientId })
      .populate('patientId', 'name uhid age')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Investigation.countDocuments({ patientId: req.params.patientId });

    if (!investigation || investigation.length === 0) {
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
      data: investigation,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching investigation:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching investigation',
      error: error.message
    });
  }
};

// Get investigation by ID
exports.getInvestigationById = async (req, res) => {
  try {
    const { id } = req.params;

    const investigation = await Investigation.findById(id)
      .populate('patientId', 'name uhid age')
      .populate('consultationId', 'date')
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');

    if (!investigation) {
      return res.status(404).json({
        success: false,
        message: 'Investigation not found'
      });
    }

    res.status(200).json({
      success: true,
      data: investigation
    });
  } catch (error) {
    console.error('Error fetching investigation:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching investigation',
      error: error.message
    });
  }
};

// Update investigation
exports.updateInvestigation = async (req, res) => {
  try {
    const { id } = req.params;
    const { investigations, totalAmount, status, category, subCategory } = req.body;
    const userId = req.user?._id || req.body.updatedBy;
    const investigation = await Investigation.findById(id);
    if (!investigation) {
      return res.status(404).json({
        success: false,
        message: 'Investigation not found'
      });
    }

    // Update fields
    if (investigations) investigation.investigations = investigations;
    if (totalAmount !== undefined) investigation.totalAmount = totalAmount;
    if (category !== undefined) investigation.category = category;
    if (subCategory !== undefined) investigation.subCategory = subCategory;
    if (status) investigation.status = status;
    investigation.updatedBy = userId;

    await investigation.save();

    res.status(200).json({
      success: true,
      message: 'Investigation updated successfully',
      data: investigation
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating investigation',
      error: error.message
    });
  }
};

// Get all investigations (with pagination and filters)
exports.getAllInvestigations = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, startDate, endDate } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    const investigations = await Investigation.find(filter)
      .populate('patientId', 'name uhid age')
      .populate('consultationId', 'date')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Investigation.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: investigations,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching investigations:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching investigations',
      error: error.message
    });
  }
};

// Delete investigation
exports.deleteInvestigation = async (req, res) => {
  try {
    const { id } = req.params;

    const investigation = await Investigation.findByIdAndDelete(id);
    if (!investigation) {
      return res.status(404).json({
        success: false,
        message: 'Investigation not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Investigation deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting investigation:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting investigation',
      error: error.message
    });
  }
};