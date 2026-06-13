const Procedure = require('../models/Procedure');
const { sendResponse } = require('../utils/response');

// Create new procedure record
exports.createProcedure = async (req, res) => {
    try {
        const userId = req.user.id;
        const { patientId, consultationId, procedures, notes } = req.body;

        // Validate required fields
        if (!patientId || !procedures || procedures.length === 0) {
            return sendResponse(res, false, 'Patient ID and at least one procedure are required', null, 400);
        }

        // Calculate total amount
        const totalAmount = procedures.reduce((sum, proc) => sum + (proc.price || 0), 0);

        const procedure = new Procedure({
            patientId,
            consultationId: consultationId || null,
            procedures: procedures.map(proc => ({
                procedureId: proc.procedureId || proc.id,
                name: proc.name,
                price: proc.price,
                category: proc.category || getCategoryFromId(proc.procedureId || proc.id),
                subType: proc.subType || proc.type || null,
                description: proc.description || ''
            })),
            totalAmount,
            notes: notes || '',
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
        const procedures = await Procedure.findOne({ patientId: req.params.patientId })
            .populate('patientId', 'name UH_ID mobileNumber')
            .populate('consultationId')
            .populate('createdBy', 'name email')
            .sort({ procedureDate: -1 });
        if (!procedures) {
            return sendResponse(res, false, 'Procedure not found.', null, 400);
        }

        return sendResponse(res, true, 'Procedure record fetched successfully', { procedurecount: procedures.length, procedures }, 200);

    } catch (error) {
        console.error('Error fetching patient procedures:', error);
        return sendResponse(res, false, 'Error fetching patient procedures', null, 500);
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