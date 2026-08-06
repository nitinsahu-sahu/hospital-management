const BloodInvestigation = require('../models/GeneticInvestigation');
const mongoose = require('mongoose');
const Patient = require('../models/User');
const Relative = require('../models/Relative');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const { formatDateTime } = require('../utils/timeFormate');

const generateGeneticPDF = async (data, res) => {

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
        'INVESTIGATION(GENETIC TEST) SUMMARY',
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
    .text('Genetic Date & Time:', doc.page.width / 2 + 20, titleY, {
      continued: true,
      width: doc.page.width / 2 - 38,
      align: 'left'
    })
    .fillColor(colors.text)
    .font('Helvetica-Bold')
    .text(` ${formatDateTime(data.geneticData?.createdAt)}`, {
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
  const hasInvestigations = data.geneticData;

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

    if (data.geneticData?.investigations?.length > 0) {
      renderInvestigationTable('Genetic Investigations', data.geneticData, data.geneticData.investigations);
    }
    yPos += 8;
  }

  yPos += 15;

  // ===== FOOTER =====
  addFooter();

  doc.end();

};

// Helper function to get all discharge data
const getGeneticData = async (geneticInvestigationId) => {
  try {
    const geneticData = await BloodInvestigation.findById(geneticInvestigationId)
      .populate('createdBy', '-password -__v')

    if (!geneticData) {
      throw new Error('Genetic test not found');
    }

    const patientId = geneticData.patientId;

    const patient = await Patient.findById(patientId).select('-password -__v');

    const relative = await Relative.findOne({ UH_ID: patient?.UH_ID });

    const doctor = geneticData.createdBy || null;

    return {
      patient,
      doctor,
      geneticData,
      relative,
    };
  } catch (error) {
    console.error('Error fetching patient History data:', error);
    throw error;
  }
};

// Download pdf
exports.geneticPdf = async (req, res) => {
  try {
    const { geneticId } = req.params;

    const data = await getGeneticData(geneticId);

    if (!data.geneticData) {
      return res.status(404).json({
        success: false,
        message: 'No genetic investigation summary found for this patient'
      });
    }

    await generateGeneticPDF(data, res);
  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating PDF',
      error: error.message
    });
  }
};

// Create new blood investigation
exports.createBloodInvestigation = async (req, res) => {
  try {
    const { patientId, category, investigations, totalAmount } = req.body;
    const userId = req.user?.id;

    // Check if investigation already exists for this patient and category
    const existingInvestigation = await BloodInvestigation.findOne({
      patientId,
      category
    });

    const investigation = new BloodInvestigation({
      patientId,
      category,
      investigations,
      totalAmount,
      createdBy: userId,
      updatedBy: userId
    });

    await investigation.save();

    res.status(201).json({
      success: true,
      message: 'Created successfully',
      data: investigation
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating blood investigation',
      error: error.message
    });
  }
};

// Get blood investigation by patient ID and category
exports.getBloodInvestigationByPatientId = async (req, res) => {
  try {
    const { patientId } = req.params;
    const { category } = req.query;
    const { page = 1, limit = 10 } = req.query;

    const query = { patientId };
    if (category && ['routine', 'genetic'].includes(category)) {
      query.category = category;
    }

    const geneticsInvestigation = await BloodInvestigation.find(query)
      .populate('patientId', 'name uhid age mobile')
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await BloodInvestigation.countDocuments({ patientId: req.params.patientId });

     if (!geneticsInvestigation || geneticsInvestigation.length === 0) {
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
      data: geneticsInvestigation,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching blood investigation:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching blood investigation',
      error: error.message
    });
  }
};

// Get blood investigation by ID
exports.getBloodInvestigationById = async (req, res) => {
  try {
    const { id } = req.params;

    const investigation = await BloodInvestigation.findById(id)
      .populate('patientId', 'name uhid age mobile')
      .populate('consultationId', 'date consultationType')
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');

    if (!investigation) {
      return res.status(404).json({
        success: false,
        message: 'Blood investigation not found'
      });
    }

    res.status(200).json({
      success: true,
      data: investigation
    });
  } catch (error) {
    console.error('Error fetching blood investigation:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching blood investigation',
      error: error.message
    });
  }
};

// Update blood investigation
exports.updateBloodInvestigation = async (req, res) => {
  try {
    const { id } = req.params;
    const { investigations, totalAmount } = req.body;
    const userId = req.user?.id;

    const investigation = await BloodInvestigation.findById(id);
    if (!investigation) {
      return res.status(404).json({
        success: false,
        message: 'Blood investigation not found'
      });
    }

    // Update fields
    if (investigations) investigation.investigations = investigations;
    if (totalAmount !== undefined) investigation.totalAmount = totalAmount;
    investigation.updatedBy = userId;

    await investigation.save();

    res.status(200).json({
      success: true,
      message: 'Blood investigation updated successfully',
      data: investigation
    });
  } catch (error) {
    console.error('Error updating blood investigation:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating blood investigation',
      error: error.message
    });
  }
};

// Get all blood investigations (with pagination and filters)
exports.getAllBloodInvestigations = async (req, res) => {
  try {
    const { page = 1, limit = 10, category, status, startDate, endDate } = req.query;
    const filter = {};

    if (category && ['routine', 'genetic'].includes(category)) filter.category = category;
    if (status) filter.status = status;
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const investigations = await BloodInvestigation.find(filter)
      .populate('patientId', 'name uhid age')
      .populate('consultationId', 'date')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await BloodInvestigation.countDocuments(filter);

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
    console.error('Error fetching blood investigations:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching blood investigations',
      error: error.message
    });
  }
};

// Delete blood investigation
exports.deleteBloodInvestigation = async (req, res) => {
  try {
    const { id } = req.params;

    const investigation = await BloodInvestigation.findByIdAndDelete(id);
    if (!investigation) {
      return res.status(404).json({
        success: false,
        message: 'Blood investigation not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Blood investigation deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting blood investigation:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting blood investigation',
      error: error.message
    });
  }
};