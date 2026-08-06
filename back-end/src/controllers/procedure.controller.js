const Procedure = require('../models/Procedure');
const { sendResponse } = require('../utils/response');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const Patient = require('../models/User');
const Relative = require('../models/Relative');
const { formatDateTime } = require('../utils/timeFormate');

const generateProcedurePDF = async (data, res) => {

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
                'PROCEDURE SUMMARY',
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
        .text('Procedure Date & Time:', doc.page.width / 2 + 20, titleY, {
            continued: true,
            width: doc.page.width / 2 - 38,
            align: 'left'
        })
        .fillColor(colors.text)
        .font('Helvetica-Bold')
        .text(` ${formatDateTime(data.procedure?.createdAt)}`, {
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

    // ===== PROCEDURE TABLE =====
    doc.fillColor(colors.primary)
        .fontSize(11)
        .font('Helvetica-Bold')
        .text('Procedure Details', 18, yPos);

    doc.strokeColor(colors.border)
        .lineWidth(0.4)
        .moveTo(18, doc.y + 2)
        .lineTo(doc.page.width - 18, doc.y + 2)
        .stroke();

    yPos = doc.y + 10;

    // Table headers
    const tableX = 18;
    const tableWidth = doc.page.width - 36;
    const col1Width = tableWidth * 0.08;  // S.No
    const col2Width = tableWidth * 0.47;  // Procedure Name
    const col3Width = tableWidth * 0.20;  // Category
    const col4Width = tableWidth * 0.25;  // Price

    // Header background
    doc.rect(tableX, yPos, tableWidth, 22)
        .fill(colors.primary);

    doc.fillColor(colors.white)
        .fontSize(11)
        .font('Helvetica-Bold');

    // Header text with proper alignment
    doc.text('S.No', tableX + 5, yPos + 6, { width: col1Width - 5, align: 'left' });
    doc.text('Procedure Name', tableX + col1Width + 5, yPos + 6, { width: col2Width - 5, align: 'left' });
    doc.text('Category', tableX + col1Width + col2Width + 5, yPos + 6, { width: col3Width - 5, align: 'left' });
    doc.text('Amount (Rs.)', tableX + col1Width + col2Width + col3Width + 5, yPos + 6, { width: col4Width - 10, align: 'left' });

    yPos += 22;

    // Table rows
    doc.fillColor(colors.text)
        .fontSize(9)
        .font('Helvetica');

    let totalAmount = 0;
    const procedures = data.procedure?.procedures || [];

    procedures.forEach((proc, index) => {
        // Alternate row background
        if (index % 2 === 0) {
            doc.rect(tableX, yPos, tableWidth, 18)
                .fill(colors.lightBg);
        } else {
            doc.rect(tableX, yPos, tableWidth, 18)
                .fill(colors.white);
        }

        const price = proc.price || 0;
        totalAmount += price;

        doc.fillColor(colors.text)
            .fontSize(10)
            .font('Helvetica');

        // Row data with proper alignment - Added "/-" after price
        doc.text((index + 1).toString(), tableX + 5, yPos + 4, { width: col1Width - 5, align: 'left' });
        doc.text(proc.name || 'N/A', tableX + col1Width + 5, yPos + 4, { width: col2Width - 5, align: 'left' });
        doc.text(proc.category || 'N/A', tableX + col1Width + col2Width + 5, yPos + 4, { width: col3Width - 5, align: 'left' });
        doc.text(`${price.toLocaleString('en-IN')}/-`, tableX + col1Width + col2Width + col3Width + 5, yPos + 4, { width: col4Width - 10, align: 'left' });

        yPos += 18;

        // Check if we need a new page
        if (yPos > doc.page.height - 120) {
            addFooter();
            doc.addPage();
            addHeader();
            yPos = doc.y + 10;

            // Re-add table headers on new page
            doc.rect(tableX, yPos, tableWidth, 22)
                .fill(colors.primary);

            doc.fillColor(colors.white)
                .fontSize(9)
                .font('Helvetica-Bold');

            doc.text('S.No', tableX + 5, yPos + 6, { width: col1Width - 5, align: 'left' });
            doc.text('Procedure Name', tableX + col1Width + 5, yPos + 6, { width: col2Width - 5, align: 'left' });
            doc.text('Category', tableX + col1Width + col2Width + 5, yPos + 6, { width: col3Width - 5, align: 'left' });
            doc.text('Amount (Rs.)', tableX + col1Width + col2Width + col3Width + 5, yPos + 6, { width: col4Width - 8, align: 'left' });

            yPos += 22;
            doc.fillColor(colors.text)
                .fontSize(8.5)
                .font('Helvetica');
        }
    });

    // ===== TOTAL ROW =====
    // Add some spacing
    yPos += 5;

    // Total row with highlight
    doc.rect(tableX, yPos, tableWidth, 24)
        .fill(colors.highlight)
        .stroke(colors.border);

    doc.fillColor(colors.primary)
        .fontSize(10)
        .font('Helvetica-Bold');

    // GRAND TOTAL label - LEFT side
    doc.text('TOTAL', tableX + col1Width + 5, yPos + 6, {
        width: col2Width - 5,
        align: 'left'
    });

    // Total amount - RIGHT side
    doc.text(`${totalAmount.toLocaleString('en-IN')}/-`, tableX + col1Width + col2Width + col3Width + 5, yPos + 6, {
        width: col4Width - 8,
        align: 'left'
    });

    yPos += 15;

    // ===== FOOTER =====
    addFooter();

    doc.end();
};

const getProcedureData = async (procedureId) => {
    try {
        const procedure = await Procedure.findById(procedureId)
            .populate('createdBy', '-password -__v')

        if (!procedure) {
            throw new Error('procedure not found');
        }

        const patientId = procedure.patientId;

        const patient = await Patient.findById(patientId).select('-password -__v');

        const relative = await Relative.findOne({ UH_ID: patient?.UH_ID });

        const doctor = procedure.createdBy || null;

        return {
            patient,
            doctor,
            procedure,
            relative,
        };
    } catch (error) {
        console.error('Error fetching procedure data:', error);
        throw error;
    }
};

// Download pdf
exports.procedurePdf = async (req, res) => {
    try {
        const { procedureId } = req.params;

        const data = await getProcedureData(procedureId);

        if (!data.procedure) {
            return res.status(404).json({
                success: false,
                message: 'No patient history summary found for this patient'
            });
        }

        await generateProcedurePDF(data, res);
    } catch (error) {
        console.error('Error generating PDF:', error);
        res.status(500).json({
            success: false,
            message: 'Error generating PDF',
            error: error.message
        });
    }
};

// Create new procedure record
exports.createProcedure = async (req, res) => {
    try {
        const userId = req.user.id;
        const { patientId, procedures, procedureDate } = req.body;

        // Validate required fields
        if (!patientId || !procedures || procedures.length === 0) {
            return sendResponse(res, false, 'Patient ID and at least one procedure are required', null, 400);
        }

        // Calculate total amount
        const totalAmount = procedures.reduce((sum, proc) => sum + (proc.price || 0), 0);

        const procedure = new Procedure({
            procedureDate,
            patientId,
            procedures: procedures.map(proc => ({
                procedureId: proc.procedureId || proc.id,
                name: proc.name,
                price: proc.price,
                category: proc.category || getCategoryFromId(proc.procedureId || proc.id),
                subType: proc.subType || proc.type || null,
                description: proc.description || ''
            })),
            totalAmount,
            createdBy: userId,
            updatedBy: userId
        });

        await procedure.save();

        return sendResponse(res, true, 'Procedure record created successfully', procedure, 201);


    } catch (error) {
        console.error('Error creating procedure:', error);
        return sendResponse(res, false, 'Error creating procedure record', null, 400);
    }
};

// Get all procedures
exports.getAllProcedures = async (req, res) => {
    try {
        const { patientId, status, startDate, endDate } = req.query;

        let query = {};

        if (patientId) query.patientId = patientId;
        if (status) query.status = status;
        if (startDate || endDate) {
            query.procedureDate = {};
            if (startDate) query.procedureDate.$gte = new Date(startDate);
            if (endDate) query.procedureDate.$lte = new Date(endDate);
        }

        const procedures = await Procedure.find(query)
            .populate('patientId', 'name UH_ID mobileNumber')
            .populate('consultationId')
            .populate('createdBy', 'name email')
            .populate('updatedBy', 'name email')
            .sort({ procedureDate: -1 });

        return sendResponse(res, true, 'Data fetched.', { procedures, count: procedures.length }, 200);

    } catch (error) {
        console.error('Error fetching procedures:', error);
        return sendResponse(res, false, 'Error fetching procedures', null, 500);

    }
};

// Get procedure by ID
exports.getProcedureById = async (req, res) => {
    log
    try {
        const procedure = await Procedure.findById(req.params.id)
            .populate('patientId', 'name UH_ID mobileNumber')
            .populate('consultationId')
            .populate('createdBy', 'name email')
            .populate('updatedBy', 'name email');

        if (!procedure) {
            return sendResponse(res, false, 'Procedure record not found', null, 404);

        }
        return sendResponse(res, true, 'Patient procedure found', procedure, 200);

    } catch (error) {
        console.error('Error fetching procedure:', error);
        return sendResponse(res, false, 'Error fetching procedure', null, 500);
    }
};

// Get procedures by patient ID
exports.getProceduresByPatientId = async (req, res) => {

    try {
        const { page = 1, limit = 10 } = req.query;
        const { patientId } = req.params;

        const procedure = await Procedure.find({ patientId })
            .populate('patientId', 'name UHID age gender')
            .populate('createdBy', 'name email')
            .populate('updatedBy', 'name email')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Procedure.countDocuments({ patientId: req.params.patientId });

        if (!procedure || procedure.length === 0) {
            return res.status(200).json({
                success: true,
                data: [],
                message: 'No patient procedure found for this patient',
                pagination: {
                    total: 0,
                    page: Number(page),
                    pages: 0
                }
            });
        }

        res.status(200).json({
            success: true,
            data: procedure,
            pagination: {
                total,
                page: Number(page),
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching procedure.',
            error: error.message
        });
    }
};

// Update procedure
exports.updateProcedure = async (req, res) => {
    try {
        const userId = req.user._id;
        const { procedures, notes, status } = req.body;

        const updateData = {
            updatedBy: userId
        };

        if (procedures) {
            updateData.procedures = procedures.map(proc => ({
                procedureId: proc.procedureId || proc.id,
                name: proc.name,
                price: proc.price,
                category: proc.category || getCategoryFromId(proc.procedureId || proc.id),
                subType: proc.subType || proc.type || null,
                description: proc.description || ''
            }));
            updateData.totalAmount = procedures.reduce((sum, proc) => sum + (proc.price || 0), 0);
        }

        if (notes !== undefined) updateData.notes = notes;
        if (status) updateData.status = status;

        const procedure = await Procedure.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!procedure) {
            return sendResponse(res, false, 'Procedure record not found', null, 404);
        }
        return sendResponse(res, true, 'Procedure record updated successfully', procedure, 200);

    } catch (error) {
        console.error('Error updating procedure:', error);
        return sendResponse(res, false, 'Error updating procedure', null, 500);
    }
};

// Delete procedure
exports.deleteProcedure = async (req, res) => {
    try {
        const procedure = await Procedure.findByIdAndDelete(req.params.id);

        if (!procedure) {
            return sendResponse(res, false, 'Procedure record not found', null, 404);
        }

        return sendResponse(res, true, 'Procedure record deleted successfully', null, 200);
    } catch (error) {
        console.error('Error deleting procedure:', error);
        return sendResponse(res, false, 'Error deleting procedure', null, 404);
    }
};

// Helper function to get category from procedure ID
function getCategoryFromId(procedureId) {
    if (procedureId.startsWith('iui')) return 'iui';
    if (procedureId === 'cvs') return 'cvs';
    if (procedureId === 'prp') return 'prp';
    if (procedureId.startsWith('lbc')) return 'lbc';
    if (procedureId === 'amniocentesis') return 'amniocentesis';
    return 'other';
}