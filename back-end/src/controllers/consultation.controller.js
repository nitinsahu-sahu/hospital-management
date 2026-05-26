const Consultation = require('../models/Cosultation');
const { sendResponse } = require('../utils/response');

// Create consultation
exports.createConsultation = async (req, res) => {
  try {
    const { patientId, fees } = req.body;
    const userId = req.user.id;
    const consultation = new Consultation({
      patientId,
      fees: {
        freeOfCost: fees.freeOfCost || 0,
        emergencyConsultationFee: fees.emergencyConsultationFee || 0,
        geneticConsultationFee: fees.geneticConsultationFee || 0,
        opdConsultationFee: fees.opdConsultationFee || 0,
        additionalFees: fees.additionalFees || []
      },
      createdBy: userId,
      updatedBy: userId
    });

    await consultation.save();

    return sendResponse(res, true, 'Consultation created successfully', consultation, 201);

  } catch (error) {
    return sendResponse(res, false, 'Error creating consultation', null, 500);
  }
};

// Get all consultations
exports.getAllConsultations = async (req, res) => {
  try {
    const consultations = await Consultation.find().populate('patientId')
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');

    res.status(200).json({
      success: true,
      data: consultations
    });
  } catch (error) {
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
    const consultation = await Consultation.findById(req.params.id).populate('patientId').populate('createdBy', 'name email')
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
    const { fees } = req.body;

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

// Add additional fee
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