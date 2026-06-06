const Investigation = require('../models/Investigation');
const mongoose = require('mongoose');

// Create new investigation
exports.createInvestigation = async (req, res) => {
  
  try {
    const { patientId, consultationId,category,subCategory, investigations, totalAmount, status } = req.body;
    const userId = req.user?.id;

    // Check if investigation already exists for this patient
    const existingInvestigation = await Investigation.findOne({ patientId });
    if (existingInvestigation) {
      return res.status(400).json({
        success: false,
        message: 'Investigation already exists for this patient. Use update instead.'
      });
    }

    const investigation = new Investigation({
      patientId,
      consultationId,
      category,subCategory,
      investigations,
      totalAmount,
      status: status || 'pending',
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

// Get investigation by patient ID
exports.getInvestigationByPatientId = async (req, res) => {
  try {
    const { patientId } = req.params;

    const investigation = await Investigation.findOne({ patientId })
      .populate('patientId', 'name uhid age')
      .populate('consultationId', 'date')
      .populate('createdBy', 'name email');

    if (!investigation) {
      return res.status(404).json({
        success: false,
        message: 'No investigation found for this patient'
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
    const { investigations, totalAmount, status,category,subCategory } = req.body;
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