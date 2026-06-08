const BloodInvestigation = require('../models/GeneticInvestigation');
const mongoose = require('mongoose');

// Create new blood investigation
exports.createBloodInvestigation = async (req, res) => {
  try {
    const { patientId, consultationId, category, investigations, totalAmount } = req.body;
    const userId = req.user?.id;

    // Check if investigation already exists for this patient and category
    const existingInvestigation = await BloodInvestigation.findOne({ 
      patientId, 
      category 
    });
    
    if (existingInvestigation) {
      return res.status(400).json({
        success: false,
        message: `${category} investigation already exists for this patient. Use update instead.`
      });
    }

    const investigation = new BloodInvestigation({
      patientId,
      consultationId,
      category,
      investigations,
      totalAmount,
      createdBy: userId,
      updatedBy: userId
    });

    await investigation.save();

    res.status(201).json({
      success: true,
      message: `${category} investigation created successfully`,
      data: investigation
    });
  } catch (error) {
    console.error('Error creating blood investigation:', error);
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

    const query = { patientId };
    if (category && ['routine', 'genetic'].includes(category)) {
      query.category = category;
    }

    const investigation = await BloodInvestigation.findOne(query)
      .populate('patientId', 'name uhid age mobile')
      .populate('consultationId', 'date consultationType')
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');

    if (!investigation) {
      return res.status(404).json({
        success: false,
        message: 'No blood investigation found for this patient'
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