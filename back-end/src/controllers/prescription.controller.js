const Patient = require('../models/User.js');
const Prescription = require('../models/Prescription.js');

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

    const prescription = await Prescription.findOne({ patientId })
      .populate('patientId', 'name UHID age gender')
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');

    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: 'Patient history not found'
      });
    }

    res.status(200).json({
      success: true,
     data:prescription
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching patient history',
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